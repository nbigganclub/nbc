import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import Navbar from '../components/navigation/navbar'
import Blogs from '../components/home/blogs'
import headerLogo from '../components/assets/headerLogo.png'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  
  
  
  return (
    <div>
      <Head>
        <title>Home - Narsingdi Biggan Club</title>
      </Head>
      <header className="p-2 lg:p-0">
        <div className="flex justify-center items-center">
          <div>
            <Image src={headerLogo.src} height="250" width="250" className="mx-auto" />
            <p className="text-3xl font-semibold text-cyan-600">Narsingdi Biggan Club</p>
          </div>
        </div>
        <Navbar />
      
      </header>
      <Blogs />

    </div>
  )
}
