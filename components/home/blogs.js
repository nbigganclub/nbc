import { db } from '@/firebase';
import { collection, limit, orderBy, onSnapshot, query, startAfter, where, getDoc, doc, getCountFromServer } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { BsFillTriangleFill } from 'react-icons/bs';
import { CgSpinner } from 'react-icons/cg';
import Blog from './blog'
import InfiniteScroll from 'react-infinite-scroll-component';

export default function Blogs({ blogsData }) {


  const [renderPost, setRenderPost] = useState(() => blogsData.map(e => JSON.parse(e)));

  const [totalPost, setTotalPost] = useState(0);

  useEffect(() => {
    const getTotalPost = async() => {
      setTotalPost((await getCountFromServer(query(collection(db, 'posts'), where('isApproved', '==', true)))).data().count);
    };
    getTotalPost();
  }, []);

  const fetchMoreData = async() => {
    const lastDoc = await getDoc(doc(db, 'posts', renderPost[renderPost.length - 1].id));
    onSnapshot(query(collection(db, "posts"), where("isApproved", "==", true), limit(6), orderBy("timestamp", "desc"), startAfter(lastDoc)), (snapshot) => {
      setRenderPost(prevRenderPost => [...prevRenderPost, ...snapshot.docs.map(doc => doc.data())]);
    });
  }

  return (
    <div>
      <div className="text-center py-4">
        <p className="text-xl lg:text-xl font-medium text-black dark:text-gray-200 text-center pb-4 px-2 border-b-2 inline-block">Blog Posts</p>
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
  );
}