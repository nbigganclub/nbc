import Head from 'next/head'
import Image from 'next/image';
import { useRouter } from 'next/router'
import { useRef, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useForm } from "react-hook-form";
import { db, storage } from '@/firebase';
import { CgSpinner } from 'react-icons/cg';
import { useSession, getSession } from 'next-auth/react';
import { addHistory } from '@/utilities/tools';

export default function PendingPosts({ data }) {
  const fileInput = useRef(null);
  const { register, handleSubmit, formState: { errors }} = useForm({
    defaultValues: {
      title: data.title,
      authorName: data.authorName,
      description: data.description,
    }
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ type: true, text: "" });
  
  const router = useRouter();
  const { data: session } = useSession();
  
  const onSubmit = async(newData) => {
    setLoading(true);
    setProgress(0);
    
    try {
      const eRef = doc(db, 'posts', data.id);
      await updateDoc(eRef, {
        title: newData.title,
        description: newData.description,
        authorName: newData.authorName,
        views: 0,
        timestamp: serverTimestamp(),
        isApproved: true
      });
      
      if(!selectedFile) {
        setLoading(false);
        setStatus({ type: true, text: "Published successfully without thumbnail !" });
        router.back();
        await addHistory(session?.user?.fullName, `Edited and published blog without thumbnail ${data.id}`);
        return;
      }
      const fileRef = ref(storage, `posts/${data.id}`);
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
                thumbnail: downloadURL,
              });
              setStatus({ type: true, text: "Published successfully!" });
              setSelectedFile(null);
              await addHistory(session?.user?.fullName, `Edited and published blog ${data.id}`);
              setLoading(false);
              router.push("/admin/pending-blogs");
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
    <div className="max-w-5xl mx-auto p-3 lg:p-0 min-h-[600px] pt-10">
      <Head>
        <title>Apply for Blog</title>
      </Head>
      <p className="text-3xl font-semibold text-sky-500 mb-5 text-center lg:pt-8">Apply for Blog</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2 dark:text-gray-200" htmlFor="authorName">
            Author&apos;s Full Name :
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
          {selectedFile ? selectedFile.name : (data.thumbnail && <Image src={data.thumbnail} height="120" width="100" className="rounded-sm" />)}
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
        <button type="submit" disabled={loading} className="w-full py-1.5 text-center text-sm bg-blue-500 rounded text-white dark:text-gray-200 transition-all flex items-center justify-center space-x-2 hover:bg-blue-700 disabled:bg-blue-500/50 font-medium">
          {loading && <CgSpinner className="h-5 w-5 animate-spin" />}
          <p>{loading ? "Publishing..." : "Publish"}</p>
        </button>
      </form>
    </div>
  );
}

export async function getServerSideProps({ req, res, query }) {
  let session = await getSession({ req, res, callbackUrl: "http://localhost:3000/auth/siginin" });
  const postId = query.id;

  if (!session?.user?.permissions?.includes('posts-management')) {
    return {
      redirect: {
        permanent: false,
        destination: '/no-permission',
      },
      props: {},
    };
  }
  if (!postId) {
    return {
      redirect: {
        permanent: false,
        destination: '/404',
      },
      props: {},
    };
  }

  const postRef = await getDoc(doc(db, 'posts', postId));

  if (!postRef.exists()) {
    return {
      redirect: {
        permanent: false,
        destination: '/404',
      },
      props: {},
    };
  }

  const postInfo = postRef.data();
  postInfo.timestamp = null;

  return {
    props: {
      data: postInfo,
    },
  };
}
