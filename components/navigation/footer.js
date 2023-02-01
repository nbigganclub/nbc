import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="p-2 bg-white dark:bg-gray-900">
      <div className="font-semibold text-blue-500 my-4">
        <p>Phone no. 01xxxxxxxxx</p>
        <p>Mail us : narsingdibigganclub@gmail.com</p>
      </div>
      <p className="py-2 bg-blue-500/30 text-sm text-center">
        If you fall into any problem contact to our developer
        <Link href="/shmaruf" className="text-blue-500 ml-2 font-semibold">SH MARUF</Link>
      </p>
      <p className="bg-white py-2 text-black dark:text-gray-200 text-center">All rights reserved to Narsingdi Biggan Club</p>
    </footer>
  );
}