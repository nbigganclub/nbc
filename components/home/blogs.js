import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase"
import { CgSpinner } from 'react-icons/cg';
import Blog from './blog'

export default function Blogs() {
  
  const [blogsData, setBlogsData] = useState([]);
  
  
  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, "posts"), orderBy("timestamp", "desc")), (snapshot) => {
      setBlogsData(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2 bg-white dark:bg-gray-800">
      {blogsData.length ? (
        blogsData.map((data, key) => (
          <Blog data={data} key={key} />
        ))
      ) : (
        <div className="min-h-[600px] flex items-center justify-center text-gray-600 dark:text-gray-200">
          <CgSpinner className="h-8 w-8 animate-spin" />
        </div>
      )}
    </section>
  );
}