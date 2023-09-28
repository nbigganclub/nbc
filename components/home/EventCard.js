import Image from "next/image";

import eventBanner1 from '../assets/382679510_636381841970533_4115478539825413709_n-removebg-preview.png';
import Link from "next/link";


export default function EventCard() {
    return(
        <section className="grid lg:grid-cols-2">
            <Image src={eventBanner1.src} width={600} height={300} priority={1} alt="Event banner 1" className="mx-auto h-auto" />
            <div className="flex justify-center items-center">
                <div className="space-y-5 bg-sky-600/50 border-2 border-sky-600 rounded p-5 text-center">
                    <p className="font-bold text-4xl bg-gradient-to-r from-orange-700 via-blue-500 to-green-400 text-transparent bg-clip-text animate-gradient">On 29 september 2023,<br />At 08.00 AM</p>
                    <p className="font-semibold text-3xl">Location: Narsingdi Government College</p>
                    <p className="text-xl">Participate in the Olympiad and receive a certificate for free!</p>
                    <div>
                        <Link href="/events/NSO23/ParticipateList" className="text-base bg-purple-500/75 rounded text-white hover:bg-purple-700/75 transition-all px-4 py-2">Find your roll!</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}