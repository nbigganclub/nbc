import Link from "next/link";
import { BsFillTriangleFill } from 'react-icons/bs'
import PeCard from "@/components/home/peCard";

export default function MembersList({ memberList }) {

    return (
        <section className="mb-5">
            <div className="text-center py-4">
                <p className="text-xl lg:text-2xl font-medium text-black dark:text-gray-200 text-center pb-4 px-2 border-b-2 inline-block">We are</p>
            </div>
            {memberList.length ? (
                <div className="max-w-6xl mx-auto mt-2 gap-8 space-y-2">
                    {memberList.map((e, k) => <PeCard key={k} data={JSON.parse(e)} />)}
                </div>
            ) : (
                <div className="min-h-[300px] flex items-center justify-center">
                    <div className="flex items-center space-x-2 font-semibold">
                        <BsFillTriangleFill className="h-8 w-8 text-gray-600 dark:text-gray-200" />
                        <p>No members !</p>
                    </div>
                </div>
            )}
            <div className="text-center mt-5">
                <Link href="/members" className="text-sky-600 font-medium hover:text-sky-800 transition-all">Show all ...</Link>
            </div>
        </section>
    );
}
