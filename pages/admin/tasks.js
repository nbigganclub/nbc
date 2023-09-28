import Head from "next/head";
import { useState, useEffect, Fragment } from "react";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { authOptions } from "../api/auth/[...nextauth]";
import { Transition, Dialog } from "@headlessui/react";
import { doc, updateDoc, getCountFromServer, getDocs, getDoc, collection, orderBy, query, limit, startAfter } from "firebase/firestore";
import { db } from "@/firebase";
import InfiniteScroll from "react-infinite-scroll-component";
import TaskBar from "@/components/tasks/taskBar";
import { addHistory } from "@/utilities/tools";
import { BsFillTriangleFill } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";





import AddTask from "@/components/tasks/addTask";

export default function AdminTasks() {

  const { data: session } = useSession();

  const [renderTasks, setRenderTasks] = useState([]);

  const [totalTasks, setTotalTasks] = useState(0);
  const [mounted, setMounted] = useState(false);

  const [confirmWindow, setConfirmWindow] = useState({});
  const [loading, setLoading] = useState(false);

  const submitTask = async() => {
    setLoading(true);
    await updateDoc(doc(db, 'tasks', confirmWindow.e.id), {
      completed: [...confirmWindow.e.completed, Number(session?.user?.id)]
    });
    await addHistory(`[${session?.user?.id}] ${session?.user?.fullName}`, `Submitted task ${confirmWindow.e.title}`);
    fetchTasks();
    setLoading(false);
    setConfirmWindow({});
  };

  const fetchTasks = async () => {
    const taskSnapshot = await getDocs(
      query(collection(db, 'tasks'), orderBy('timestamp', 'desc'), limit(10))
    );
    setRenderTasks(taskSnapshot.docs.map((doc) => doc.data()));
    const totalTasksSnapshot = await getCountFromServer(collection(db, 'tasks'));
    setTotalTasks(totalTasksSnapshot.data().count);
    setMounted(true);
  };

  useEffect(() => {
    fetchTasks();
  }, []);
  
  const fetchMoreData = async () => {
    const lastTask = renderTasks[renderTasks.length - 1];
    const lastDoc = await getDoc(doc(db, 'tasks', lastTask.id));
    const moreTasksSnapshot = await getDocs(
      query(collection(db, 'tasks'), orderBy('timestamp', 'desc'), startAfter(lastDoc), limit(10))
    );
    setRenderTasks((prevRenderTasks) => [...prevRenderTasks,    ...moreTasksSnapshot.docs.map((doc) => doc.data()),  ]);
  };




  return (
    <>
      <Head>
        <title>Tasks</title>
      </Head>
      <div className="max-w-7xl mx-auto lg:pt-10 p-2 lg:p-0">
        {session?.user?.permissions?.includes("tasks-management") && (
          <AddTask session={session} fetchTasks={fetchTasks} />
        )}
        <div className="text-center py-4">
          <p className="text-xl lg:text-2xl font-medium text-black dark:text-gray-200 text-center pb-4 px-2 border-b-2 inline-block">Tasks</p>
        </div>
        <section className="mb-5">
          {renderTasks.length ? (
              <InfiniteScroll
                  dataLength={renderTasks.length}
                  next={fetchMoreData}
                  hasMore={renderTasks.length < totalTasks}
                  loader={
                      <section className="h-[200px] flex justify-center items-center">
                          <CgSpinner className="h-8 w-8 animate-spin" />
                      </section>
                  }
              >
                  <table className="w-full mt-5 text-left font-medium text-xs lg:text-sm text-gray-900 dark:text-gray-200">
                      <thead className="uppercase bg-violet-500/30 border border-violet-500 rounded-sm">
                          <tr>
                              <th scope="col" className="px-6 py-3">Serial no.</th>
                              <th scope="col" className="px-6 py-3">Task</th>
                              <th scope="col" className="px-6 py-3">Expire</th>
                              <th scope="col" className="px-6 py-3">Status</th>
                              <th scope="col" className="px-6 py-3"></th>
                          </tr>
                      </thead>
                      <tbody>
                        {mounted && renderTasks.map((e, k) => <TaskBar key={k} session={session} k={k} e={e} setConfirmWindow={setConfirmWindow} />)}
                      </tbody>
                  </table>
              </InfiniteScroll>
              ) : (
                  <section className="min-h-[600px] flex items-center justify-center">
                      <div className="flex items-center space-x-2 font-semibold">
                          <BsFillTriangleFill className="h-8 w-8 text-gray-600 dark:text-gray-200" />
                          <p>No tasks !</p>
                      </div>
                  </section>
              )}
        </section>
      </div>
      <Transition show={Object.keys(confirmWindow).length !== 0} as={Fragment}>
        <Dialog as="div" className="relative z-[999]" onClose={() => setConfirmWindow(false)}>
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 bg-black bg-opacity-50" />
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
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-blue-500 mb-20">Make sure you done the task properly !</Dialog.Title>
                        <button type="button" disabled={loading} className="flex items-center space-x-2 justify-center rounded mt-4 bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-500/30 focus:outline-none transition-all disabled:bg-blue-200/30" onClick={() => submitTask()}>
                            {loading && <CgSpinner className="h-5 w-5 animate-spin" />}
                            <p>{loading ? "Wait..." : "Accept"}</p>
                        </button>
                    </Dialog.Panel>
                </Transition.Child>
            </div>
        </Dialog>
      </Transition>
    </>
  )
}

export async function getServerSideProps(context) {

  let session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
      permanent: false,
      destination: '/auth/signin'
      },
      props: {}
    }
  }

  return {
    props: {
      session,
    }
  }
}