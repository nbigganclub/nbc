import Head from 'next/head'
import Blogs from '../components/home/blogs'
import ImageCarousal from '@/components/home/ImageCarousal'
import MembersList from '@/components/home/membersList'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/firebase'


export default function Home({ memberList, blogsData }) {
 
  return (
    <div>
      <Head>
        <title>Home - Narsingdi Biggan Club</title>
      </Head>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2">
          <MembersList memberList={memberList} />
          <ImageCarousal className="w-[400px] lg:w-[600px] h-[350px] lg:h-[450px] mx-auto" />
        </div>
        <Blogs blogsData={blogsData} />
      </div>

    </div>
  )
}

export async function getServerSideProps() {
  const blogsQuerySnapshot = await getDocs(query(collection(db, 'posts'), where("isApproved", "==", true), orderBy("timestamp", "desc"), limit(6)));
  const memberListQuerySnapshot = await getDocs(query(collection(db, 'users'), orderBy("timestamp", "desc"), limit(3)));

  const blogsData = blogsQuerySnapshot.docs.map((doc) => JSON.stringify(doc.data()));
  const memberList = memberListQuerySnapshot.docs.map((doc) => JSON.stringify(doc.data()));

  return {
    props: {
      blogsData,
      memberList,
    }
  }
}
