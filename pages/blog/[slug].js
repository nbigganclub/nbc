import Link from 'next/link';
import Image from 'next/image'
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc, deleteDoc, } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/firebase"
import { AiOutlineUser, AiOutlineEye, AiOutlineCalendar } from "react-icons/ai";
import noThumbnail from '@/components/assets/noThumbnail.jpeg';
import { addHistory } from '@/utilities/tools';
import { useSession } from 'next-auth/react';
import Moment from 'react-moment';
import { getServerSession } from 'next-auth';
import Head from 'next/head';
import { authOptions } from "../api/auth/[...nextauth]";
import { useState, Fragment } from 'react';
import { Transition, Dialog } from '@headlessui/react';


export default function ViewPost({ stringyData }) {
  
  const router = useRouter();
  const { data: session } = useSession();
  const data = JSON.parse(stringyData);
  const [loading, setLoading] = useState(false);
  const [isDialog, setIsDialog] = useState(false);
 
  const declinePost = async() => {
    setLoading(true);
    await deleteDoc(doc(db, 'posts', data.id));
    if (data.thumbnail) await deleteObject(ref(storage, `posts/${data.id}`));
    await addHistory(`[${session?.user?.id}] ${session?.user?.fullName}`, `${data.isApproved ? "Removed" : "Declined"} blog ${data.title}`);
    setLoading(false);
    router.push(data.isApproved ? "/" : "/admin/pending-blogs");
  }
  const approvePost = async() => {
    setLoading(true);
    await updateDoc(doc(db, 'posts', data.id), {
      isApproved: true
    });
    await addHistory(`[${session?.user?.id}] ${session?.user?.fullName}`, `Approved blog ${data.id}`);
    setLoading(false);
    router.push("/admin/pending-blogs");
  }
  
  return (
    <>
      <Head>
        <title>{data.title}</title>
      </Head>
      <div className="p-2 lg:p-0 bg-white dark:bg-gray-900 min-h-[700px]">
        <section className="max-w-5xl mx-auto">
          <div className="relative h-[250px]">
            <Image src={data.thumbnail || noThumbnail.src} fill className="object-cover" />
          </div>
          <p className="text-2xl my-3 font-semibold">{data.title}</p>
          <div className="flex items-center justify-between text-sm my-2">
            <div className="flex items-center space-x-1 text-blue-500">
              <AiOutlineEye className="h-4 w-4" />
              <p>{data.views}</p>
            </div>
            <div className="flex items-center space-x-1 text-pink-500">
              <AiOutlineUser className="h-4 w-4" />
              <p>{data.authorName || "Unknown"}</p>
            </div>
            <div className="flex items-center space-x-1 text-purple-500">
              <AiOutlineCalendar className="h-4 w-4" />
              <p><Moment format="MMMM Do YYYY">{new Date(data.timestamp.seconds * 1000)}</Moment></p>
            </div>
          </div>
          <p className="text-gray-800 dark:text-gray-200">{data.description}</p>
          {session?.user?.permissions?.includes("posts-management") && (
            <div className="flex items-center space-x-1 mt-5">
              <button type="button" onClick={() => setIsDialog(true)} disabled={loading} className="w-full py-1.5 rounded bg-red-500 text-white dark:text-gray-200 transition-all hover:bg-red-600 font-medium disabled:bg-red-500/50">{data.isApproved ? "Delete" : "Decline"}</button>
              <Link href={`/admin/pending-blogs/${data.id}`} className="w-full py-1.5 rounded bg-blue-500 text-white dark:text-gray-200 transition-all hover:bg-blue-600 font-medium flex items-center justify-center">Edit</Link>
              {!data.isApproved && (
                <button type="button" disabled={loading} onClick={approvePost} className="w-full py-1.5 rounded bg-emerald-600 text-white dark:text-gray-200 transition-all hover:bg-emerald-700 font-medium disabled:bg-emerald-600/50">Approve</button>
              )}
            </div>
          )}
        </section>
      </div>
      <Transition show={isDialog} as={Fragment}>
        <Dialog as="div" className="relative z-[999]" onClose={() => {}}>
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-red-500">{data.isApproved ? "Delete" : "Decline"} task</Dialog.Title>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">All of this blog data will be deleted ! You&apos;r this action will also save in history.</p>
                        <button type="button" disabled={loading} className="flex items-center space-x-2 justify-center rounded mt-4 bg-red-500/20 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/30 focus:outline-none transition-all disabled:bg-red-200/30" onClick={declinePost}>
                            {loading && <CgSpinner className="h-5 w-5 animate-spin" />}
                            <p>{loading ? "Deleting..." : "Delete"}</p>
                        </button>
                    </Dialog.Panel>
                </Transition.Child>
            </div>
        </Dialog>
    </Transition>
    </>
  );
}

export async function getServerSideProps(context) {

  let session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );
        
  const id = context.query.slug;
  const data = await getDoc(doc(db, 'posts', id));
  if (data.exists()) {
    return {
      props: {
        session,
        stringyData: JSON.stringify(data.data()),
      }
    }
  }
  return {
    redirect: {
      permanent: false,
      destination: "/404",
    },
    props:{},
  }
}
