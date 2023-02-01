import Image from 'next/image'
import Link from 'next/link'
import { AiOutlineUser, AiOutlineEye, AiOutlineCalendar } from "react-icons/ai";
import format from 'date-fns/format';
//import { GetDate } from '../../utilities/tools'
import noThumbnail from '../assets/noThumbnail.jpeg'

export default function Blog({ data }) {
  
  console.log(data.viewedBy)
  
  const unformattedDate = new Date(data.timestamp.seconds * 1000);
  const date = format(unformattedDate, 'MM-dd-yyyy');

  return (
    <article className="w-full h-[500px] rounded shadow-lg overflow-hidden">
      <div className="relative w-full h-56">
        <Image src={data.thumbnail || noThumbnail.src} fill alt="" className="object-cover" />
      </div>
      <div className="p-3">
        <p className="text-2xl h-16 font-semibold text-cyan-600 mt-2">{data.title}</p>
        <div className="flex items-center justify-between text-sm mb-2">
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
        <p className="h-[120px] text-gray-800">{data.description}</p>
        <Link href={`view/${data.id}`} className="block py-1.5 text-sm bg-blue-500 font-medium text-white rounded text-center transition-all hover:bg-blue-700">View</Link>
      </div>
    </article>
  );
}