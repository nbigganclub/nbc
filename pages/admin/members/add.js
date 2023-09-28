import Head from 'next/head';
import Image from 'next/image';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Fragment, useState, useRef } from 'react';
import { hash } from 'bcryptjs';
import { Transition, Listbox, Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { doc, setDoc, updateDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { addHistory } from '@/utilities/tools';
import { CgSpinner } from 'react-icons/cg';


export default function AddFunction({ userInfo }) {

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            nbcid: userInfo?.id,
            fullName: userInfo?.fullName,
            email: userInfo?.email,
            institiute: userInfo?.institiute,
        }
    });
    const [data, setData] = useState({
        position : userInfo?.position || "--- Select ---",
        permissions: userInfo?.permissions || [],
    });
    const [profilePic, setProfilePic] = useState(null);
    const [status, setStatus] = useState({ type: true, message: ""});
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isOpen, setIsOpen] = useState(false)

    const fileInput = useRef(null);

    const router = useRouter();
    const { data: session } = useSession();

    const positionList = ["admin", "campus-representative"];
    const permissionLists = ["Users management", "Posts management", "Tasks management", "View history"];

    const onSubmit = async(e) => {
        setLoading(true);
        setStatus({ type: true, message: ""});
        if (data.position === "--- Select ---") {
            setStatus({ type: false, message: "Select position !"});
            setLoading(false);
            return;
        }
        if (e.password !== e.confirmPassword) {
            setStatus({ type: false, message: "Password does't match !"});
            setLoading(false);
            return;
        }

        if (userInfo) {
            try {
                await updateDoc(doc(db, 'users', userInfo.id), {
                    fullName: e.fullName,
                    email: e.email,
                    position: data.position,
                    institiute: e.institiute,
                    ...(e.password ? { password: await hash(e.password, 12)} : {}),
                    permissions: data.permissions,
                })
                  
                if (profilePic) {
                    const fileRef = ref(storage, `profilePics/${userInfo.id}`);
                    if (userInfo.profilePic) {
                        await deleteObject(fileRef);
                    }
                    const uploadTask = uploadBytesResumable(fileRef, profilePic);
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                        const progress = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        setProgress(progress);
                        },
                        (error) => {
                            console.log(error);
                            setStatus({ type: false, text: "Something went wrong !" });
                            setLoading(false);
                        },
                        () => {
                        getDownloadURL(uploadTask.snapshot.ref)
                        .then(async(downloadURL) => {
                            await updateDoc(doc(db, 'users', userInfo.id), {
                                profilePic: downloadURL,
                            });
                            setStatus({ type: true, message: "User information updated successfully with profile picture !"});
                            await addHistory(`[${session?.user?.id}] ${session?.user?.fullName}`, `Updated user [${userInfo.id}] ${e.fullName}`);
                            setLoading(false);
                            router.push("/members");
                        });
                    });
                } else {
                    setStatus({ type: true, message: "User information updated successfully without profile picture !"});
                    await addHistory(`[${session?.user?.id}] ${session?.user?.fullName}`, `Updated user [${userInfo.id}] ${e.fullName} without profile picture !`);
                    setLoading(false);
                    router.push("/members");
                }
            } catch (error) {
                console.log(error);
                setStatus({ type: false, message: "Something went wrong !"});
                setLoading(false);
            }
        } else {
            const userSnapshot = await getDoc(doc(db, 'users', e.nbcid));
            if (userSnapshot.exists()) {
                setStatus({ type: false, message: "User already exixts !"});
                setLoading(false);
                return;
            }

            try {
                const eRef = doc(db, 'users', e.nbcid);
                await setDoc(eRef, {
                    id: e.nbcid,
                    fullName: e.fullName,
                    email: e.email,
                    position: data.position,
                    institiute: e.institiute,
                    password: e.password,
                    permissions: data.permissions,
                    timestamp: serverTimestamp(),
                });
                if (profilePic) {
                    const fileRef = ref(storage, `profilePics/${e.nbcid}`);
                    const uploadTask = uploadBytesResumable(fileRef, profilePic);
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                        const progress = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        setProgress(progress);
                        },
                        (error) => {
                            console.log(error);
                            setStatus({ type: false, text: "Something went wrong !" });
                            setLoading(false);
                        },
                        () => {
                        getDownloadURL(uploadTask.snapshot.ref)
                        .then(async(downloadURL) => {
                            await updateDoc(eRef, {
                                profilePic: downloadURL,
                            });
                            setStatus({ type: true, message: "User created successfully with profile picture !"});
                            setLoading(false);
                            await addHistory(`[${session?.user?.id}] ${session?.user?.fullName}`, `Created user [${e.nbcid}] ${e.fullName}`);
                            router.push("/members");
                        });
                    });
                } else {
                    setStatus({ type: true, message: "User created successfully without profile picture !"})
                    setLoading(false);
                    await addHistory(`[${session?.user?.id}] ${session?.user?.fullName}`, `Created user [${e.nbcid}] ${e.fullName} without profile picture !`);
                    router.push("/members");
                };
            } catch (error) {
                console.log(error);
                setStatus({ type: false, message: "Something went wrong !"});
                setLoading(false);
            }
        }
    }

    const handleProfileChange = (e) => {
        if (e.target.files[0]) {
          setProfilePic(e.target.files[0]);
        }
    };
    const handleCheckboxChange = (item) => {
        if (item.target.checked) {
            setData({...data, permissions: [...data.permissions, item.target.value]});
        } else {
            setData({...data, permissions: data.permissions.filter(e => filterPermission(e) !== item.target.value)});
        }
    };

    const filterPermission = (e) => {
        return e.toLowerCase().replace(/ /g, "-");
    }
    const deleteUser = async() => {
        setLoading2(true);
        await deleteDoc(doc(db, 'users', userInfo.id));
        userInfo.profilePic && await deleteObject(ref(storage, `profilePics/${userInfo.id}`));
        await addHistory(`[${session?.user?.id}] ${session?.user?.fullName}`, `Removed user [${userInfo.id}] ${userInfo.fullName}`);
        setLoading2(false);
        setIsOpen(false);
        router.push('/members');
    }

    return (
        <>
            <Head>
                <title>Add user</title>
            </Head>
            <div className="text-center py-4 mt-8">
                <p className="text-xl lg:text-2xl font-medium text-black dark:text-gray-200 text-center pb-4 px-2 border-b-2 inline-block">{userInfo ? "Update user information" : "Create user"}</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-5xl grid-cols-1 lg:grid-cols-2 gap-8 mx-auto mt-10 p-4 lg:p-0 transition-all">
                <div className="space-y-2">
                    <label className="font-medium text-black dark:text-gray-200">NBC ID : <span className="text-xs ml-5 text-gray-700 dark:text-gray-400">NBC ID can't changable !</span></label>
                    <input type="text" {...register("nbcid", {required: {value: true, message: "Enter NBC ID"}, minLength: {value: 3, message: "Minimum 3 character required"}, maxLength: { value: 48, message: "Maximum 8 character allowed"}})} className={`w-full outline-none border-b-2  dark:text-gray-200 bg-transparent ${errors.fullName ? "border-red-500" : "border-gray-800 dark:border-gray-200 focus:border-green-500"}`} readOnly={userInfo}></input>
                    <p className="text-sm text-red-500">{errors.nbcid?.message}</p>
                </div>
                <div className="space-y-2">
                    <label className="font-medium text-black dark:text-gray-200">Full name :</label>
                    <input type="text" {...register("fullName", {required: {value: true, message: "Enter full name"}, minLength: {value: 3, message: "Minimum 3 character required"}, maxLength: { value: 48, message: "Maximum 48 character allowed"}})} className={`w-full outline-none border-b-2  dark:text-gray-200 bg-transparent ${errors.fullName ? "border-red-500" : "border-gray-800 dark:border-gray-200 focus:border-green-500"}`}></input>
                    <p className="text-sm text-red-500">{errors.fullName?.message}</p>
                </div>
                <div className="flex items-center justify-between">
                    <input
                        className="hidden"
                        type="file"
                        accept="image/*"
                        ref={fileInput}
                        onChange={handleProfileChange}
                    />
                    <button type="button" onClick={() => fileInput.current.click()} className="bg-gray-300 py-2 px-3 rounded text-gray-700 hover:bg-gray-400 focus:outline-none transition-all">Select Profile Picture</button>
                    {profilePic ? <p className="text-sm max-w-[250px] truncate">{profilePic?.name}</p> : (userInfo?.profilePic && <Image src={userInfo.profilePic} alt="" height="90" width="90" className="rounded" />)}
                </div>
                <div className="space-y-2">
                    <label className="font-medium text-black dark:text-gray-200">Email :</label>
                    <input type="email" {...register("email", {required: {value: true, message: "Enter email"}})} className={`w-full outline-none border-b-2  dark:text-gray-200 bg-transparent ${errors.email ? "border-red-500" : "border-gray-800 dark:border-gray-200 focus:border-green-500"}`}></input>
                    <p className="text-sm text-red-500">{errors.email?.message}</p>
                </div>
                <div className="space-y-2">
                    <label className="font-medium text-black dark:text-gray-200">Institiute :</label>
                    <input type="text" {...register("institiute", {required: {value: true, message: "Enter institiute"}, minLength: {value: 3, message: "Minimum 3 character required"}, maxLength: { value: 48, message: "Maximum 48 character allowed"}})} className={`w-full outline-none border-b-2  dark:text-gray-200 bg-transparent ${errors.fullName ? "border-red-500" : "border-gray-800 dark:border-gray-200 focus:border-green-500"}`}></input>
                    <p className="text-sm text-red-500">{errors.institiute?.message}</p>
                </div>
                <div className="space-y-2">
                    <label className="font-medium text-black dark:text-gray-200">Password :</label>
                    <input type="password" {...register("password", {required: {value: !userInfo, message: "Enter password"}, minLength: {value: 8, message: "Minimum 8 character required"}, maxLength: { value: 32, message: "Maximum 32 character allowed"}})} className={`w-full outline-none border-b-2  dark:text-gray-200 bg-transparent ${errors.password ? "border-red-500" : "border-gray-800 dark:border-gray-200 focus:border-green-500"}`}></input>
                    <p className="text-sm text-red-500">{errors.password?.message}</p>
                </div>
                <div className="space-y-2">
                    <label className="font-medium text-black dark:text-gray-200">Confirm password :</label>
                    <input type="password" {...register("confirmPassword", {required: {value: !userInfo, message: "Enter password"}, minLength: {value: 8, message: "Minimum 8 character required"}, maxLength: { value: 32, message: "Maximum 32 character allowed"}})} className={`w-full outline-none border-b-2  dark:text-gray-200 bg-transparent ${errors.confirmPassword ? "border-red-500" : "border-gray-800 dark:border-gray-200 focus:border-green-500"}`}></input>
                    <p className="text-sm text-red-500">{errors.confirmPassword?.message}</p>
                </div>
                <div className="space-y-2">
                    <label className="font-medium text-black dark:text-gray-200">Select position :</label>
                    <Listbox value={data.position} onChange={e => setData({...data, position: e})}>
                        <div className="relative cursor-pointer">
                            <Listbox.Button className="w-full bg-transparent text-left outline-transparent sm:text-sm">
                                <span className="block truncate">{data.position}</span>
                            </Listbox.Button>
                            <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Listbox.Options className="absolute z-30 mt-1 max-h-60 w-96 overflow-auto rounded-md bg-white dark:bg-gray-800 text-black dark:text-gray-200 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {positionList.map((e, k) =>
                                    <Listbox.Option
                                        key={k}
                                        className={({ active }) => `relative select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-500 text-white dark:text-gray-200' : 'text-black dark:text-gray-200'}`}
                                        value={e}
                                    >
                                        <span className="block truncate">{e}</span>
                                    </Listbox.Option>
                                )}
                                    </Listbox.Options>
                            </Transition>
                        </div>
                    </Listbox>
                </div>
                <div>
                    <p className="text-xl my-3 font-semibold">Permissions :</p>
                    {permissionLists.map((e, k) => (
                        <div key={k} className="flex items-center mb-4 ml-5">
                            <input type="checkbox" value={filterPermission(e)} checked={data.permissions.includes(filterPermission(e))} onChange={handleCheckboxChange}  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                            <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{e}</label>
                        </div>
                    ))}
                </div>
                {progress > 0 && (
                    <div className="my-3 lg:col-span-2 w-[450px] mx-auto">
                        <p className="text-sm mt-2 font-medium text-blue-700 dark:text-white">{progress}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{width: progress + "%"}}></div>
                        </div>
                    </div>
                )}
                <div className="lg:col-span-2 text-center my-3">
                    <p className={`text-sm mb-2 font-medium text-center ${status.type ? "text-green-500" : "text-red-500"}`}>{status.message}</p>
                    <div className="flex items-center space-x-2 justify-center">
                        <button type="submit" disabled={loading} className="py-1 w-48 rounded bg-sky-600 hover:bg-sky-800 transition-all flex items-center justify-center space-x-1 text-white dark:text-gray-200 font-medium disabled:bg-sky-400">
                            {loading && <CgSpinner className="h-5 w-5 animate-spin" />}
                            {userInfo ? <p>{loading ? "Updating...." : "Update"}</p> : <p>{loading ? "Creating...." : "Create"}</p>}
                        </button>
                        {(userInfo && (userInfo.id !== session.user.id)) && (
                            <button type="button" onClick={() => setIsOpen(true)} className="py-1 w-48 rounded bg-red-500 hover:bg-red-700 transition-all text-white dark:text-gray-200 font-medium disabled:bg-red-300">
                                <p>Remove</p>
                            </button>
                        )}
                    </div>
                </div>
            </form>
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
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-red-500">Delete user</Dialog.Title>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">All of this user information and permissions will be deleted ! You&apos;r this action will also save in history.</p>
                                <button type="button" disabled={loading2} className="flex items-center space-x-2 justify-center rounded mt-4 bg-red-500/20 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/30 focus:outline-none transition-all disabled:bg-red-200/30" onClick={deleteUser}>
                                    {loading2 && <CgSpinner className="h-5 w-5 animate-spin" />}
                                    <p>{loading2 ? "Deleting..." : "Delete"}</p>
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
    const userId = query.id;
      
    if (!session?.user?.permissions?.includes("users-management")) {
        return {
          redirect: {
            permanent: false,
            destination: '/no-permission'
          },
          props: {}
        }
    }
      
    if (userId) {
        const userRef = await getDoc(doc(db, 'users', userId))
        if (userRef.exists()) {
          const userInfo = userRef.data()
          userInfo.timestamp = null
          return {
            props: {
              session,
              userInfo
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
    return {
        props: {
          session
        }
    }
}
