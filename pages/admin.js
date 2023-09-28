import Head from "next/head"
import Link from "next/link"
import { AiOutlineHistory } from "react-icons/ai"
import { BsFillPeopleFill } from "react-icons/bs"
import { BiTask } from "react-icons/bi"
import { MdPostAdd } from "react-icons/md"
import { collection, getCountFromServer, query, where } from "firebase/firestore"
import { db } from "@/firebase"
import { useEffect, useState } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]";


export default function AdminPanal() {

  const [countPendingPosts, setCountPendingPosts] = useState(0);

  useEffect(() => {
    const getCountPendingPosts = async() => {
      setCountPendingPosts((await getCountFromServer(query(collection(db, 'posts'), where('isApproved', '==', false)))).data().count);
    };
    getCountPendingPosts();
  }, []);

  return (
    <>
      <Head>
        <title>Admin Tools</title>
      </Head>
      <div className="text-center py-4">
        <p className="text-xl lg:text-2xl font-medium text-black dark:text-gray-200 text-center pb-4 px-2 border-b-2 inline-block">Admin tools</p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 mt-8 gap-8">
        <Link href="/members" className="rounded-xl border flex items-center space-x-4 p-3 w-[350px] mx-auto bg-pink-600/20 hover:bg-pink-600/30 transition-all border-pink-700 text-black">
          <BsFillPeopleFill className="h-12 w-12 dark:text-pink-300" />
          <p className="text-xl font-medium dark:text-gray-200">Members</p>
        </Link>
        <Link href="/admin/pending-blogs" className="rounded-xl border flex items-center space-x-4 p-3 w-[350px] mx-auto bg-sky-600/20 hover:bg-sky-600/30 transition-all border-sky-700 text-black">
          <MdPostAdd className="h-12 w-12 dark:text-sky-300" />
          <p className="text-xl font-medium dark:text-gray-200">Pending Blogs</p>
          {countPendingPosts > 0 && <p className="text-xl font-semibold bg-blue-700 flex items-center justify-center text-white dark:text-gray-200 p-2 h-9 w-9 rounded-full animate-pulse">{countPendingPosts}</p>}
        </Link>
        <Link href="/admin/tasks" className="rounded-xl border flex items-center space-x-4 p-3 w-[350px] mx-auto bg-green-600/20 hover:bg-green-600/30 transition-all border-green-700 text-black">
          <BiTask className="h-12 w-12 dark:text-green-300" />
          <p className="text-xl font-medium dark:text-gray-200">Tasks</p>
        </Link>
        <Link href="/admin/history" className="rounded-xl border flex items-center space-x-4 p-3 w-[350px] mx-auto bg-yellow-600/20 hover:bg-yellow-600/30 transition-all border-yellow-700 text-black">
          <AiOutlineHistory className="h-12 w-12 dark:text-yellow-300" />
          <p className="text-xl font-medium dark:text-gray-200">History</p>
        </Link>
      </div>
    </>
  )
}

export async function getServerSideProps(context) {
  let session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (session) {
    return {
      props: {}
    }
  } else {
    return {
      redirect: {
        permanent: false,
        destination: '/auth/signin'
      },
      props: {}
    }
  }
}

