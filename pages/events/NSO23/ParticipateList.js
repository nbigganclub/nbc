import Head from "next/head";
import { getDocs, query, collection, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import Moment from "react-moment";
import { BsFillTriangleFill } from "react-icons/bs";

export default function ParticipateList({ participateListData }) {

    const renderParticipateList = participateListData.map(e => JSON.parse(e));

    renderParticipateList.sort((a, b) => {
        const idA = parseInt(a.id.replace('NSO23', ''), 10);
        const idB = parseInt(b.id.replace('NSO23', ''), 10);
      
        return idA - idB;
      });

    return (
        <div className="max-w-7xl mx-auto">
            <Head>
                <title>ParticipateList</title>
            </Head>
            <section className="pb-5">
                <div className="text-center py-4 lg:mt-10">
                    <p className="text-xl lg:text-2xl font-medium text-black dark:text-gray-200 text-center pb-4 px-2 border-b-2 inline-block">ParticipateList</p>
                </div>
                {renderParticipateList.length ? (
                    <table className="w-full mt-5 text-left font-medium text-xs lg:text-sm">
                        <thead className="uppercase bg-gray-50 dark:bg-gray-700 rounded-sm">
                            <tr>
                                <th scope="col" className="px-6 py-3">Roll No</th>
                                <th scope="col" className="px-6 py-3">Full Name</th>
                                <th scope="col" className="px-6 py-3">Institution</th>
                                <th scope="col" className="px-6 py-3">Registration Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderParticipateList.map((e, k) => (
                                <tr key={k} className={`border-b dark:border-gray-700 ${k%2 == 0 ? "bg-white dark:bg-gray-900 " : "bg-gray-100 dark:bg-gray-800"}`}>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{e.id}</th>
                                    <td className="px-6 py-4">{e.fullName}</td>
                                    <td className="px-6 py-4">{e.institution}</td>
                                    <td className="px-6 py-4"><Moment format="MMMM Do YYYY, h:mm:ss a">{e.Timestamp}</Moment></td>
                                </tr>
                            ))}
                        </tbody>
                    
                    </table>
                ) : (
                    <section className="min-h-[600px] flex items-center justify-center">
                        <div className="flex items-center space-x-2 font-semibold">
                            <BsFillTriangleFill className="h-8 w-8 text-gray-600 dark:text-gray-200" />
                            <p>No ParticipateList !</p>
                        </div>
                    </section>
                )}
            </section>
        </div>
    );
}

export async function getServerSideProps({ req, res }) {
    const participateListQuerySnapshot = await getDocs(
        query(collection(db, 'NSO23'))
    );
      
    const participateListData = participateListQuerySnapshot.docs.map(doc => JSON.stringify(doc.data()));
    
    return {
      props: {
        participateListData,
      }
    }
}

