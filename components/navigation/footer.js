import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 px-3 lg:p-0">
      <div className="lg:mx-10 p-2 md:px-0">
        <div className="font-semibold text-blue-500 my-4">
          <p>Phone no. 01xxxxxxxxx</p>
          <Link href="mailto:narsingdibigganclub@gmail.com">Mail us : narsingdibigganclub@gmail.com</Link>
        </div>
        <p className="py-2 bg-blue-500/30 text-sm text-center dark:text-gray-200">
          If you fall into any problem contact to our developer
          <Link href="mailto:shawkath646@gmail.com" className="text-blue-500 ml-2  font-semibold">SH MARUF</Link>
        </p>
        <p className="bg-white dark:bg-gray-900 py-2 text-black dark:text-gray-200 text-center">All rights reserved to Narsingdi Biggan Club.</p>
      </div>
    </footer>
  );
}