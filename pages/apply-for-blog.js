import Head from 'next/head'
import { useRouter } from 'next/router'
import { useRef, useState } from "react";
import { doc, addDoc, updateDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useForm } from "react-hook-form";
import { db, storage } from '../firebase';
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
        authorName: data.authorName,
        views: 0,
        timestamp: serverTimestamp(),
        isApproved: false
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
              setLoading(false);
              router.push("/");
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
    <div className="max-w-5xl mx-auto p-3 lg:p-0 min-h-[600px] pt-10 lg:pt-20">
      <Head>
        <title>Apply for Blog</title>
      </Head>
      <p className="text-3xl font-semibold text-sky-500 mb-5 text-center">Apply for Blog</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2 dark:text-gray-200" htmlFor="authorName">
            Your Full Name :
          </label>
          <input
            name="authorName"
            {...register('authorName', { required: { value: true, message: "This field is required" }, minLength: { value: 3,message: "Minimum 3 character required" }, maxLength: { value: 32, message: "Maximum 32 character allowed"}})}
            className={`bg-transparent appearance-none border ${
              errors.authorName ? "border-red-500" : "border-gray-500"
            } rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none transition-all`}
            type="text"
          />
          <p className="text-red-500 text-xs italic">{errors.authorName?.message}</p>
        </div>
  
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2 dark:text-gray-200" htmlFor="title">
            Title :
          </label>
          <input
            name="title"
            {...register('title', { required: { value: true, message: "This field is required" }, minLength: { value: 5,message: "Minimum 5 character required" }, maxLength: { value: 48, message: "Maximum 64 character allowed"}})}
            className={`bg-transparent appearance-none border ${
              errors.title ? "border-red-500" : "border-gray-500"
            } rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none transition-all`}
            type="text"
          />
          <p className="text-red-500 text-xs italic">{errors.title?.message}</p>
        </div>
  
        <div className="mb-4">
          <label
            className="block text-gray-700 font-medium mb-2 dark:text-gray-200"
            htmlFor="description"
          >
            Description :
          </label>
          <textarea
            name="description"
            {...register('description', { required: { value: true, message: "This field is required" }, minLength: { value: 10,message: "Minimum 10 character required" }, maxLength: { value: 5000, message: "Maximum 5000 character allowed"}})}
            className={`bg-transparent appearance-none border ${
              errors.description ? "border-red-500" : "border-gray-500"
            } rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none transition-all`}
            rows="5"
          />
          <p className="text-red-500 text-xs italic">{errors.description?.message}</p>
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
          <p className="text-sm max-w-[250px] truncate">{selectedFile?.name}</p>
        </div>
          
        {progress > 0 && (
          <div className="my-3">
            <p className="text-sm mt-2 font-medium text-blue-700 dark:text-white">{progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{width: progress + "%"}}></div>
            </div>
          </div>
        )}
        <p className="text-sm italic text-center">* Your post will send to admin panel and wait for approve</p>
        {status.text && <p className={`text-sm my-2 font-medium text-center ${status.type ? "text-green-500" : "text-red-500"}`}>{status.text}</p>}
        <button type="submit" disabled={loading} className="w-full py-1.5 text-center text-sm bg-blue-500 rounded text-white dark:text-gray-200 transition-all flex items-center justify-center space-x-2 hover:bg-blue-700 disabled:bg-blue-500/50 font-medium">
          {loading && <CgSpinner className="h-5 w-5 animate-spin" />}
          <p>{loading ? "Uploading..." : "Upload"}</p>
        </button>
      </form>
    </div>
  );
}
