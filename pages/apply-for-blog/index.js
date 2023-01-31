import Head from 'next/head'
import { useRouter } from 'next/router'
import { useRef, useState } from "react";
import { doc, addDoc, updateDoc, collection, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useForm } from "react-hook-form";
import { db, storage } from '../../firebase';
import { CgSpinner } from 'react-icons/cg';

export default function ApplyForBlog() {
  const fileInput = useRef(null);
  const { register, handleSubmit, formState: { errors }} = useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ type: true, text: "" });
  
  const router = useRouter();
  
  const onSubmit = async(data) => {
    setLoading(true);
    setProgress(0);
    
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        title: data.title,
        description: data.description,
        authorUid: null,
        authorName: "",
        views: 0,
        timestamp: serverTimestamp()
      });
      const eRef = doc(db, 'posts', docRef.id);
      if(!selectedFile) {
        await updateDoc(eRef, {
          id: docRef.id,
        });
        setLoading(false);
        setStatus({ type: true, text: "Uploaded successfully without thumbnail !" });
        router.back();
        return;
      }
      const fileRef = ref(storage, `posts/${docRef.id}`);
      const uploadTask = uploadBytesResumable(fileRef, selectedFile);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          console.log(error);
          setStatus({ type: false, text: "Something went wrong !" });
          setLoading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then(async(downloadURL) => {
              await updateDoc(eRef, {
                id: docRef.id,
                thumbnail: downloadURL,
              });
              setStatus({ type: true, text: "Uploaded successfully!" });
              setSelectedFile(null);
              router.back();
            });
        }
      )
    } catch(err) {
      console.log(err);
      setStatus({ type: false, text: "Something went wrong !" });
      setLoading(false);
    }
  };
  
  const handleThumbnailChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  

  return (
    <div className="max-w-5xl mx-auto p-3 lg:p-0">
      <Head>
        <title>Apply for Blog</title>
      </Head>
      <p className="mb-2 text-3xl font-semibold text-black dark:text-gray-200 mb-5 text-center">Apply for Blog</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
            Title
          </label>
          <input
            name="title"
            {...register('title', { required: true })}
            className={`appearance-none border ${
              errors.description ? "border-red-500" : "border-gray-500"
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none transition-all`}
            type="text"
          />
          {errors.title && (
            <p className="text-red-500 text-xs italic">Title is required</p>
          )}
        </div>
  
        <div className="mb-4">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            name="description"
            {...register('description', { required: true })}
            className={`appearance-none border ${
              errors.description ? "border-red-500" : "border-gray-500"
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none transition-all`}
            rows="5"
          />
          {errors.description && (
            <p className="text-red-500 text-xs italic">
              Description is required
            </p>
          )}
        </div>
  
        <div className="mb-4 flex items-center justify-between">
          <input
            name="thumbnail"
            className="hidden"
            type="file"
            accept="image/*"
            ref={fileInput}
            onChange={handleThumbnailChange}
          />
          <button
            type="button"
            className="bg-gray-300 py-2 px-3 rounded text-gray-700 hover:bg-gray-400 focus:outline-none transition-all"
            onClick={() => fileInput.current.click()}
          >
            <p>Choose Thumbnail</p>
          </button>
          <p className="text-sm">{selectedFile?.name}</p>
        </div>
          
        {progress > 0 && (
          <div className="my-3">
            <p className="text-sm mt-2 font-medium text-blue-700 dark:text-white">{progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{width: progress + "%"}}></div>
            </div>
          </div>
        )}
        {status.text && <p className={`text-sm my-2 font-medium text-center ${status.type ? "text-green-500" : "text-red-500"}`}>{status.text}</p>}
        <button type="submit" disabled={loading} className="w-full py-1.5 text-center text-sm bg-cyan-500 rounded text-white transition-all flex items-center justify-center space-x-2 hover:bg-cyan-800 disabled:bg-cyan-300 dark:disabled:bg-cyan-900">
          {loading && <CgSpinner className="h-5 w-5 animate-spin" />}
          <p>{loading ? "Uploading..." : "Upload"}</p>
        </button>
      </form>
    </div>
  );
}
