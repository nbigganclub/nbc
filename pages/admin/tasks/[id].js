import Head from "next/head";
import { useRouter } from "next/router";
import {useState, Fragment } from "react";
import { getSession, useSession } from "next-auth/react";
import { Transition, Dialog } from "@headlessui/react";
import { getDoc, getDocs, doc, deleteDoc, collection } from "firebase/firestore";
import { db } from "@/firebase";
import { addHistory } from "@/utilities/tools";
import { ImCross, ImCheckmark } from "react-icons/im";
import { CgSpinner } from "react-icons/cg";

export default function ViewTask({ taskDataJSON, matchedUsers }) {

    const renderTaskData = JSON.parse(taskDataJSON);
    const renderMatchedUsers = JSON.parse(matchedUsers);

    const status = new Date(renderTaskData.expireDate.seconds * 1000) < new Date();

    const { data: session } = useSession();

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();


    const deleteTask = async() => {
        setLoading(true);
        await deleteDoc(doc(db, 'tasks', renderTaskData.id));
        await addHistory(`[${session?.user?.id}] ${session?.user?.fullName}`, `Deleted task ${renderTaskData.title}`);
        setLoading(false);
        router.push("/admin/tasks");
    }

    return (
        <>
            <Head>
                <title>Task information</title>
            </Head>
            <div className="max-w-7xl mx-auto px-2 lg:p-0">
                <div className="text-center py-4 lg:mt-10">
                    <p className="text-xl lg:text-2xl font-medium text-black dark:text-gray-200 text-center pb-4 px-2 border-b-2 inline-block">Task information</p>
                </div>
                <section>
                    <table className="w-full text-black dark:text-gray-200">
                        <tbody>
                            <tr className="bg-gray-100 rounded-sm dark:bg-gray-800">
                                <th className="py-3 px-6">ID</th>
                                <td className="py-3 px-6">:</td>
                                <td className="py-3 px-6">{renderTaskData.id}</td>
                            </tr>
                            <tr className="rounded-sm">
                                <th className="py-3 px-6">Name</th>
                                <td className="py-3 px-6">:</td>
                                <td className="py-3 px-6">{renderTaskData.title}</td>
                            </tr>
                            <tr className="bg-gray-100 rounded-sm dark:bg-gray-800">
                                <th className="py-3 px-6">Status</th>
                                <td className="py-3 px-6">:</td>
                                <td className={`py-3 px-6 ${status ? "text-red-500" : "text-green-500"}`}>{status ? "Expired" : "Running"}</td>
                            </tr>
                            <tr className="rounded-sm">
                                <th className="py-3 px-6">Total participate</th>
                                <td className="py-3 px-6">:</td>
                                <td className="py-3 px-6">{renderTaskData.completed?.length}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                <section className="mt-20">
                    <p className="text-xl font-medium text-center mb-5">List of participate :</p>
                    <ul>
                        {renderMatchedUsers.map((e, k) => (
                            <li key={k} className="flex items-center justify-center space-x-2 w-max">
                                <p className="lg:text-xl font-semibold text-black dark:text-gray-200">&#91;{e.id}&#93; {e.fullName}</p>
                                {e.matched ? <ImCheckmark className="text-emerald-500 h-6 w-6" /> : <ImCross className="w-6 h-6 text-red-500" />}
                            </li>
                        ))}
                    </ul>
                </section>
                <div className="text-center mt-10">
                    <button type="button" onClick={() => setIsOpen(true)} className="w-48 bg-red-500 hover:bg-red-700 transition-all py-1 rounded-sm font-medium text-white dark:text-gray-200">Delete task</button>
                </div>
            </div>
            <Transition show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[999]" onClose={() => {}}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-red-500">Delete task</Dialog.Title>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">All of this task information will be deleted ! You&apos;r this action will also save in history.</p>
                                <button type="button" disabled={loading} className="flex items-center space-x-2 justify-center rounded mt-4 bg-red-500/20 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/30 focus:outline-none transition-all disabled:bg-red-200/30" onClick={deleteTask}>
                                    {loading && <CgSpinner className="h-5 w-5 animate-spin" />}
                                    <p>{loading ? "Deleting..." : "Delete"}</p>
                                </button>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}

export async function getServerSideProps({ req, res, query }) {

    let session = await getSession({ req, res, callbackUrl: "http://localhost:3000/auth/siginin" });

    if (session) session.user.timestamp = null;
    const taskId = query.id;

    if (!session) {
        return {
            redirect: {
              permanent: false,
              destination: '/auth/signin'
            },
            props: {}
        }
    }
      
    if (!session?.user?.permissions?.includes("tasks-management")) {
        return {
          redirect: {
            permanent: false,
            destination: '/no-permission'
          },
          props: {}
        }
    }
      
    if (taskId) {
        const taskRef = await getDoc(doc(db, 'tasks', taskId));
        if (taskRef.exists()) {
            const userData = (await getDocs(collection(db, "users"))).docs.map(doc => doc.data());
            const taskData = taskRef.data();
            const taskDataJSON = JSON.stringify(taskData);

            const matchedUsers = JSON.stringify(userData.map(user => {
                return {
                  ...user,
                  matched: taskData.completed.includes(Number(user.id))
                }
            }));
            return {
                props: {
                session,
                taskDataJSON,
                matchedUsers
            }
          }
        }
    }
    return {
        redirect: {
          permanent: false,
          destination: '/404'
        },
        props: {}
    }
}
