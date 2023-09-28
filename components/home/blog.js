import Image from 'next/image'
import Link from 'next/link'
import { AiOutlineUser, AiOutlineEye, AiOutlineCalendar } from "react-icons/ai";
import format from 'date-fns/format';
import Clamp from 'react-multiline-clamp';
import noThumbnail from '../assets/noThumbnail.jpeg'
import { Transition } from '@headlessui/react';

export default function Blog({ data }) {
  
  const unformattedDate = new Date(data.timestamp.seconds * 1000);
  const date = format(unformattedDate, 'MM-dd-yyyy');

  

  return (
    <Transition
      as="article"
      show={true}
      appear
      enter="transition ease-out duration-500"
      enterFrom="opacity-0 translate-y-5"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-300"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-5"
      className="w-full max-w-[400px] mx-auto h-[500px] rounded shadow-lg overflow-hidden"
    >
      <div className="relative w-full h-56">
        <Image src={data.thumbnail || noThumbnail.src} fill alt="Blog banner" sizes='lg' className="object-cover" />
      </div>
      <div className="p-3">
        <p className="text-2xl h-16 font-semibold text-cyan-600 mt-2 truncate">{data.title}</p>
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center space-x-1 text-blue-500">
            <AiOutlineEye className="h-4 w-4" />
            <p>{data.views}</p>
          </div>
          <div className="flex items-center space-x-1 text-pink-500 max-w-[150px]">
            <AiOutlineUser className="h-4 w-4" />
            <p className='truncate'>{data.authorName || "Unknown"}</p>
          </div>
          <div className="flex items-center space-x-1 text-purple-500">
            <AiOutlineCalendar className="h-4 w-4" />
            <p>{date}</p>
          </div>
        </div>
        <Clamp withTooltip lines={4}>
          <p className="h-[114px] text-gray-800 dark:text-gray-300 leading-7 pb-3 mt-3 overflow-hidden">{data.description}</p>
        </Clamp>
        <Link href={`${data.isApproved ? "blog" : "/blog"}/${data.id}`} className="block py-1.5 mt-1 text-sm bg-blue-500 font-medium text-white rounded text-center transition-all hover:bg-blue-700 mb-3">View</Link>
      </div>
    </Transition>
  );
}