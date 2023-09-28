import Link from "next/link";
import Image from "next/image";
import { HiPencilAlt } from "react-icons/hi"
import noProfilePic from "@/components/assets/noThumbnail.jpeg";

export default function PeCard({ data, edit }) {

    return (
        <div className="rounded-xl border dark:border-gray-700 grid grid-cols-7 items-center w-[350px] h-[100px] mx-auto overflow-hidden px-3 py-1.5">
            <div className="relative h-[78px] w-[78px] rounded-full overflow-hidden col-span-2">
                <Image src={data.profilePic || noProfilePic.src} alt="User profile" fill className="object-cover" />
            </div>
            <div className="relative col-span-5">
                
                {edit && (
                    <Link href={{pathname: "/admin/members/add", query: { id: data.id }}} className="absolute right-0.5 bottom-0.5">
                        <HiPencilAlt className="h-5 w-5 text-pink-500 hover:text-pink-700 transition-all" />
                    </Link>
                )}
                <div className="flex items-center space-x-2 justify-between">
                    <p className="text-xl text-black dark:text-gray-200 font-semibold truncate w-[170px]">{data.fullName}</p>
                    <p className={`border truncate rounded py-0.5 px-1 text-sm inline-block font-medium ${data.position === "admin" ? "text-red-500 border-red-500" : ""} ${data.position === "moderator" ? "text-blue-500 border-blue-500" : ""} ${data.position === "campus-representative" ? "text-green-500 border-green-500" : ""} `}>{data.position}</p>
                </div>
                <Link href={`mailto:${data.email}`} className="text-sky-500 hover:text-sky-700 transition-all">{data.email}</Link>
                <p>{data.institiute}</p>
            </div>
        </div>
    );
}