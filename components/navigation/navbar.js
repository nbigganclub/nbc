import Link from 'next/link'
import Image from 'next/image'
import { Fragment } from 'react'
import { Menu, Transition, Switch } from '@headlessui/react'
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FaBars } from "react-icons/fa";
import headerLogo from '../assets/headerLogo.png'
import { useTheme } from 'next-themes';
import { signOut, useSession } from 'next-auth/react';
import noThumbnail from "../assets/noThumbnail.jpeg";

export default function Navbar() {
    
  const { theme, setTheme } = useTheme();

  const { data: session } = useSession();

  return (
    <nav className="fixed z-[999] top-0 left-0  w-full py-1 flex items-center justify-between bg-white dark:bg-gray-900 px-3 shadow-lg">
      <Link href="/" className="flex items-center space-x-2">
        <Image src={headerLogo.src} height="50" width="50" />
         <p className="font-semibold lg:text-xl text-sky-500">Narsingdi Biggan Club</p>
      </Link>
      <div className="flex items-center space-x-5">
        {session && (
          <button onClick={() => signOut()} className="h-10 w-10 rounded-full overflow-hidden relative">
            <Image src={session?.user?.profilePic || noThumbnail.src} fill alt="Navbar Logo" className="object-cover" />
          </button>
        )}
        <Menu as="div" className="relative inline-block">
            <Menu.Button className="outline-none ring-0">
              <FaBars className="h-8 w-8 text-sky-500 hover:text-sky-700 transition-all" />
            </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-800 rounded bg-sky-700 text-white dark:text-gray-200 shadow-lg ring-1 ring-black ring-opacity-5">
              <Menu.Item as="div" className="transition-all hover:bg-sky-900">
                  <Link href="/" className="w-full block p-3">Home</Link>
              </Menu.Item>
              <Menu.Item as="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="transition-all hover:bg-sky-900 p-2 flex items-center justify-between cursor-pointer w-full">
                <p>Dark Mode</p>
                <Switch
                  checked={theme === "dark"}
                  onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={`${theme === "dark" ? 'bg-black/80' : 'bg-black/60'}
                    relative inline-flex h-[25px] w-[50px] shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                >
                  <span className="sr-only">Use setting</span>
                  <span
                    aria-hidden="true"
                    className={`${theme === "dark" ? 'translate-x-[23px]' : 'translate-x-0'}
                      pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
              </Menu.Item>
              <Menu.Item as="div" className="transition-all hover:bg-sky-900">
                  <Link href="/apply-for-blog" className="w-full block p-3">Apply for blog</Link>
              </Menu.Item>
              <Menu.Item as="div" className="transition-all hover:bg-sky-900">
                  <Link href="https://www.picky.com.bd/products/6776" target="_blank" className="w-full block p-3 flex items-center space-x-2">
                    <AiOutlineShoppingCart className="h-6 w-6" />
                    <p>Buy Magazine</p>
                  </Link>
              </Menu.Item>
              <Menu.Item as="div" className="transition-all hover:bg-sky-900">
                  <Link href="/apply-for-cr" className="w-full block p-3">Apply for CR</Link>
              </Menu.Item>
              <Menu.Item as="div" className="transition-all hover:bg-sky-900">
                  <Link href="/about-us" className="w-full block p-3">About us</Link>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </nav>
  );
}