import { useState, useEffect } from 'react'
import { getSession } from 'next-auth/react';
import { collection, getDoc, getDocs, limit, query, where, orderBy, onSnapshot, getCountFromServer, doc, startAfter } from "firebase/firestore";
import { db } from "../../firebase"
import Blog from '../../components/home/blog'
import { CgSpinner } from 'react-icons/cg';
import { BsFillTriangleFill } from 'react-icons/bs'
import Head from 'next/head';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function PendingPosts({ blogsData }) {
  
  const [renderPost, setRenderPost] = useState(() => blogsData.map(e => JSON.parse(e)));

  const [totalPost, setTotalPost] = useState(0);

  useEffect(() => {
    const getTotalPost = async() => {
      setTotalPost((await getCountFromServer(query(collection(db, 'posts'), where('isApproved', '==', false)))).data().count);
    };
    getTotalPost();
  }, []);

  const fetchMoreData = async() => {
    const lastDoc = await getDoc(doc(db, 'posts', renderPost[renderPost.length - 1].id));
    onSnapshot(query(collection(db, "posts"), where("isApproved", "==", false), limit(6), orderBy("timestamp", "desc"), startAfter(lastDoc)), (snapshot) => {
      setRenderPost(prevRenderPost => [...prevRenderPost, ...snapshot.docs.map(doc => doc.data())]);
    });
  }

  return (
    <>
      <Head>
        <title>Pending Posts &#40;{totalPost}&#41;</title>
      </Head>
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-4 mt-5">
          <p className="text-xl lg:text-xl font-medium text-black dark:text-gray-200 text-center pb-4 px-2 border-b-2 inline-block">Pending Posts</p>
        </div>
        {renderPost.length ? (
          <InfiniteScroll
            dataLength={renderPost.length}
            next={fetchMoreData}
            hasMore={renderPost.length < totalPost}
            loader={
              <section className="h-[200px] flex justify-center items-center">
                <CgSpinner className="h-8 w-8 animate-spin" />
              </section>
            }
          >
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:gap-10 gap-4 p-2 mt-10 pb-10 lg:py-0">
              {renderPost.map((e, k) => <Blog data={e} key={k} />)}
            </section>
          </InfiniteScroll>
        ) : (
          <section className="min-h-[600px] flex items-center justify-center">
            <div className="flex items-center space-x-2 font-semibold">
              <BsFillTriangleFill className="h-8 w-8 text-gray-600 dark:text-gray-200" />
              <p>No posts !</p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps({ req, res }) {

  let session = await getSession({ req, res, callbackUrl: "http://localhost:3000/auth/siginin" });

  if (session) session.user.timestamp = null;
    
  if (!session?.user?.permissions?.includes("posts-management")) {
    return {
      redirect: {
        permanent: false,
        destination: '/no-permission'
      },
      props: {}
    }
  }

  const blogsQuerySnapshot = await getDocs(query(collection(db, 'posts'), where("isApproved", "==", false), orderBy("timestamp", "desc"), limit(6)));
  const blogsData = blogsQuerySnapshot.docs.map((doc) => JSON.stringify(doc.data()));

  return {
    props: {
      blogsData,
    }
  }
}
