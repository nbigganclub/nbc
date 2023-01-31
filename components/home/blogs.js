import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase"
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
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-2">
      {blogsData.length ? (
        blogsData.map(data => (
          <Blog data={data} key={data.id} />
        ))
      ) : (
        <div>Loading...</div>
      )}
    </section>
  );
}