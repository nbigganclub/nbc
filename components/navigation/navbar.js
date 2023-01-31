import Link from 'next/link'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { FaBars } from "react-icons/fa";

export default function Navbar() {
  
  const navLinks = [
    {
      name: "Home",
      destination: "/"
    },
    {
      name: "Apply for blog",
      destination: "/apply-for-blog"
    },
    {
      name: "Apply for BA",
      destination: "/apply-for-ba"
    },
    {
      name: "Apply for CR",
      destination: "/apply-for-cr"
    },
    {
      name: "About us",
      destination: "/about-us"
    },
  ]
  
  return (
    <Menu as="nav" className="w-full mt-5">
      <div className="text-right">
        <Menu.Button className="p-3 rounded-full bg-cyan-600 text-white">
          <FaBars className="h-8 w-8 " />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="w-full mt-2 divide-y divide-gray-100 rounded-md bg-cyan-600 text-white shadow-lg ring-1 ring-black ring-opacity-5">
          {navLinks.map((e, k) => (
            <Menu.Item key={k} as={Fragment} className="">
              {({ active }) => (
                <Link
                  className={`w-full block p-3 ${active && 'bg-cyan-800'}`}
                  href={e.destination}
                >{e.name}</Link>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}