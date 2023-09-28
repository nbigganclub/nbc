import Head from "next/head";
import { useEffect, useState } from "react";
import { getDocs, getDoc, doc, collection, query, orderBy, limit, getCountFromServer, onSnapshot, startAfter } from "firebase/firestore";
import { db } from "@/firebase";
import Moment from 'react-moment';
import InfiniteScroll from "react-infinite-scroll-component";
import { CgSpinner } from "react-icons/cg";
import { getSession } from "next-auth/react";
import { BsFillTriangleFill } from "react-icons/bs";

export default function History({ historyData }) {

    const [renderHistory, setRenderHistory] = useState(historyData.map(e => JSON.parse(e)));

    const [totalHistory, setTotalHistory] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const getTotalHistory = async() => {
          setTotalHistory((await getCountFromServer(collection(db, 'history'))).data().count);
        };
        getTotalHistory();
        setMounted(true);
    }, []);

    const fetchMoreData = async() => {
        const lastDoc = await getDoc(doc(db, 'history', renderHistory[renderHistory.length - 1].id));
        onSnapshot(query(collection(db, "history"), limit(6), orderBy("timestamp", "desc"), startAfter(lastDoc)), (snapshot) => {
          setRenderHistory([...renderHistory, ...snapshot.docs.map(doc => doc.data())]);
        });
    }

    return (
        <div className="max-w-7xl mx-auto">
            <Head>
                <title>History</title>
            </Head>
            <section className="pb-5">
                <div className="text-center py-4 lg:mt-10">
                    <p className="text-xl lg:text-2xl font-medium text-black dark:text-gray-200 text-center pb-4 px-2 border-b-2 inline-block">History</p>
                </div>
                {renderHistory.length ? (
                    <InfiniteScroll
                        dataLength={renderHistory.length}
                        next={fetchMoreData}
                        hasMore={renderHistory.length < totalHistory}
                        loader={
                            <section className="h-[200px] flex justify-center items-center">
                                <CgSpinner className="h-8 w-8 animate-spin" />
                            </section>
                        }
                    >
                        <table className="w-full mt-5 text-left font-medium text-xs lg:text-sm">
                            <thead className="uppercase bg-gray-50 dark:bg-gray-700 rounded-sm">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Serial no.</th>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Action</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mounted && renderHistory.map((e, k) => (
                                    <tr key={k} className={`border-b dark:border-gray-700 ${k%2 == 0 ? "bg-white dark:bg-gray-900 " : "bg-gray-100 dark:bg-gray-800"}`}>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{k+1}</th>
                                        <td className="px-6 py-4">{e[0]}</td>
                                        <td className="px-6 py-4">{e[1]}</td>
                                        <td className="px-6 py-4"><Moment format="MMMM Do YYYY, h:mm:ss a">{new Date(e.timestamp.seconds * 1000)}</Moment></td>
                                    </tr>
                                ))}
                            </tbody>
                        
                        </table>
                    </InfiniteScroll>
                    ) : (
                        <section className="min-h-[600px] flex items-center justify-center">
                            <div className="flex items-center space-x-2 font-semibold">
                                <BsFillTriangleFill className="h-8 w-8 text-gray-600 dark:text-gray-200" />
                                <p>No history !</p>
                            </div>
                        </section>
                    )}
            </section>
        </div>
    );
}

export async function getServerSideProps({ req, res }) {

    let session = await getSession({ req, res, callbackUrl: "http://localhost:3000/auth/siginin" });

    if (!session) {
        return {
            redirect: {
            permanent: false,
            destination: '/auth/signin'
            },
            props: {}
        }
    }
    if (!session?.user?.permissions?.includes("view-history")) {
        return {
            redirect: {
            permanent: false,
            destination: '/no-permission'
            },
            props: {}
        }
    }

    const historyQuerySnapshot = await getDocs(
        query(collection(db, 'history'), orderBy('timestamp', 'desc'), limit(15))
      );
      
    const historyData = historyQuerySnapshot.docs.map(doc => JSON.stringify(doc.data()));

    return {
      props: {
        historyData,
      }
    }
}