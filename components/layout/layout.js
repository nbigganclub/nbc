import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '../navigation/navbar'
import Footer from '../navigation/footer'
import { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import Image from 'next/image';
import headerLogo from "../assets/headerLogo.png";

const hideComponent = {
  hideNavbar: ["/signin"],
  hideFooter: ["/signin"],
};

export default function Layout({ children }) {
  const router = useRouter();
  const shouldHideNavbar = hideComponent.hideNavbar.some((path) =>
    router.pathname.toLowerCase().includes(path)
  );
  const shouldHideFooter = hideComponent.hideFooter.some((path) =>
    router.pathname.toLowerCase().includes(path)
  );
  const mainClassName = `min-h-[700px] bg-white dark:bg-black text-black dark:text-gray-200 ${
    !shouldHideNavbar ? "pt-[50px]" : ""
  }`;

  const [showAnimation, setShowAnimation] = useState(false);
  const [splashScreen, setSplashScreen] = useState(true);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setShowAnimation(true);
    };
  
    const handleRouteChangeComplete = () => {
      setShowAnimation(false);
    };
  
    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
  
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router]);

  useEffect(() => {
    setTimeout(() => {
      setSplashScreen(false);
    }, 1000)
  }, [])

  return (
    <>
      <Head>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0096FF" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Transition
        show={splashScreen}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="fixed z-[9999] bg-white dark:bg-gray-900 flex items-center justify-center h-screen w-full"
      >
        <div className="text-center">
          <Image src={headerLogo.src} alt="Splash logo" height="200" width="200" className="mx-auto" />
          <p className="text-sky-500 text-xl lg:text-3xl font-medium mb-3">Narsingdi Biggan Club</p>
          <p className="text-black dark:text-gray-200">Beta</p>
        </div>
      </Transition>
      <Transition
        show={showAnimation}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="fixed z-[9998] bg-white/80 dark:bg-black/80 h-screen w-full"
      >
      </Transition>
      {!shouldHideNavbar && <Navbar />}
      <main className={mainClassName}>{children}</main>
      {!shouldHideFooter && <Footer />}
    </>
  );
}
