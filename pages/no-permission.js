import Head from "next/head";

export default function NoPermission() {
    return (
        <>
            <Head>
                <title>No permission</title>
            </Head>
            <section className="flex items-center justify-center h-[700px]">
                <p className="font-medium lg:text-xl">You do not have permission to do this.</p>
            </section>
        </>
    );
}