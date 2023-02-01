import Image from 'next/image'
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]"
import { useSession } from "next-auth/react"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../../firebase"
//import { GetDate } from "../../../utilities/tools"
import format from 'date-fns/format';
import { AiOutlineUser, AiOutlineEye, AiOutlineCalendar } from "react-icons/ai";


export default function ViewPost({ stringyData }) {
  
  if(!stringyData) {
    return (
      <div className="h-[700px] flex items-center justify-center">
        <p>Post doesn&#39;t exists</p>
      </div>
    );
  }
  
  const router = useRouter();
  const { data: session } = useSession();
  const data = JSON.parse(stringyData);
  console.log(session)
  const editable = (session?.user?.id == data.author.uid);
  const unformattedDate = new Date(data.timestamp.seconds * 1000);
  const date = format(unformattedDate, 'MM-dd-yyyy');
  
  const deletePost = async() => {
    await deleteDoc(doc(db, 'posts', data.id))
    .then(() => {
      const fileRef = ref(storage, `posts/${data.id}`);
      deleteObject(fileRef)
      .then(() => {
        router.push('/');
      })
    })
  }
 
  
  return (
    <div className="max-w-5xl mx-auto p-2 lg-p-0 bg-white dark:bg-gray-800 min-h-[700px]">
      {data.thumbnail && <div className="relative h-[250px]">
        <Image src={data.thumbnail} fill className="object-cover" />
      </div>}
      <p className="text-2xl mt-2 font-semibold">{data.title}</p>
      <div className="flex items-center justify-between text-sm my-2">
        <div className="flex items-center space-x-1 text-blue-500">
          <AiOutlineEye className="h-4 w-4" />
          <p>{data.viewedBy.length}</p>
        </div>
        <div className="flex items-center space-x-1 text-pink-500">
          <AiOutlineUser className="h-4 w-4" />
          <p>{data.author.name || "Unknown"}</p>
        </div>
        <div className="flex items-center space-x-1 text-purple-500">
          <AiOutlineCalendar className="h-4 w-4" />
          <p>{date}</p>
        </div>
      </div>
      <p className="text-gray-800 dark:text-gray-200">{data.description}</p>
      {editable && <div className="grid grid-cols-2 gap-2 mt-5">
        <button type="button" onClick={() => deletePost()} className="bg-red-500 text-sm flex items-center text-white justify-center py-1.5 w-full font-semibold rounded transition-all">Delete</button>
        <button type="button" className="bg-blue-500 text-sm flex items-center text-white justify-center py-1.5 w-full font-semibold rounded transition-all">Edit</button>
      </div>}
    </div>
  );
}

export async function getServerSideProps(context) {
        
  const id = context.query.slug;
  const data = await getDoc(doc(db, 'posts', id));
  if (data.exists()) {
    return {
      props: {
        stringyData: JSON.stringify(data.data()),
      }
    }
  } else {
    return {
      props: { }
    }
  }
}