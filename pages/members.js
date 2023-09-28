import Head from "next/head";
import { BsFillTriangleFill } from 'react-icons/bs'
import PeCard from "@/components/home/peCard";
import Link from "next/link";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { useSession } from "next-auth/react";

export default function MemberManagement({ adminsData, campusRepresentativesData }) {

  const { data:session } = useSession();
  const canManageUsers = session?.user?.permissions?.includes("users-management");

  return (
    <>
      <Head>
        <title>Members Management</title>
      </Head>
      <section className="mb-5">
        <div className="text-center py-4">
          <p className="text-xl lg:text-2xl font-medium text-black dark:text-gray-200 text-center pb-4 px-2 border-b-2 inline-block">Admin Panel</p>
        </div>

        {adminsData.length ? (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 mt-8 gap-8">
            {adminsData.map((e, k) => <PeCard key={k} data={JSON.parse(e)} edit={canManageUsers} />)}
          </div>
        ) : (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="flex items-center space-x-2 font-semibold">
              <BsFillTriangleFill className="h-8 w-8 text-gray-600 dark:text-gray-200" />
              <p>No Admins !</p>
            </div>
          </div>
        )}
      </section>
      <section className="mb-5">
        <div className="text-center py-4">
          <p className="text-xl lg:text-2xl font-medium text-black dark:text-gray-200 text-center pb-4 px-2 border-b-2 inline-block">Campus Representitives</p>
        </div>

          {campusRepresentativesData.length ? (
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 mt-8 gap-8">
              {campusRepresentativesData.map((e, k) => <PeCard key={k} data={JSON.parse(e)} edit={canManageUsers} />)}
            </div>
          ) : (
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="flex items-center space-x-2 font-semibold">
                <BsFillTriangleFill className="h-8 w-8 text-gray-600 dark:text-gray-200" />
                <p>No Campus Representatives !</p>
              </div>
            </div>
          )}
      </section>
      {canManageUsers && (
        <div className="text-center pb-5 mt-10">
          <Link href="/admin/members/add" className="py-2 px-8 bg-sky-500 rounded-sm text-white dark:text-gray-200 font-medium hover:bg-sky-700 transition-all">Add member</Link>
        </div>
      )}
    </>
  )
}

export async function getServerSideProps(context) {
  let session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  const adminsQuerySnapshot = await getDocs(query(collection(db, 'users'), where("position", "==", "admin"), orderBy("timestamp", "desc")));
  const campusRepresentativesQuerySnapshot = await getDocs(query(collection(db, 'users'), where("position", "==", "campus-representative"), orderBy("timestamp", "desc")));

  const adminsData = adminsQuerySnapshot.docs.map(e => JSON.stringify(e.data()));
  const campusRepresentativesData = campusRepresentativesQuerySnapshot.docs.map(e => JSON.stringify(e.data()));

  if (session) session.user.timestamp = null;

  return {
    props: {
      session,
      adminsData,
      campusRepresentativesData
    }
  }

}


