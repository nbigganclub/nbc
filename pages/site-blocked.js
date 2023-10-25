import Head from "next/head";

export default function Page({ data }) {
    return (
        <>
            <Head>
                <title>Site Blocked</title>
            </Head>

            <section className="container min-h-screen flex items-center justify-center mx-auto fixed top-0 left-0 bg-black z-[999] w-full">
                <div className="space-y-4 text-center">
                    <p>Site ID: <span className="text-teal-600">{data.siteID}</span></p>
                    <p className="font-extrabold text-xl">{data.siteMessage}</p>
                </div>
            </section>
        </>
    );
}

export async function getServerSideProps() {

    const siteID = process.env.SITE_ID || "JCkZpB7H8ClS3fsatClx";
  
    const response = await fetch(`https://sh-web-switch.vercel.app/api/accesspoint?id=${siteID}`);
  
    const data = await response.json();
  
    return {
        props: {
            data
        }
    }
}
  