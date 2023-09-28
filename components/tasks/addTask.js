import { useState } from "react";
import { addDoc, updateDoc, doc, collection, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useForm } from "react-hook-form";
import { addHistory } from "@/utilities/tools";
import { CgSpinner } from "react-icons/cg";


export default function AddTask({ session, fetchTasks }) {

    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
          expireDate: (new Date()).toISOString().slice(0, 10)
        }
    });

    const onSubmit = async(e) => {
        setLoading(true);
        const docRef = await addDoc(collection(db, "tasks"), {
          title: e.title,
          expireDate: Timestamp.fromDate(new Date(e.expireDate)),
          timestamp: serverTimestamp(),
          completed: []
        });
        await updateDoc(doc(db, "tasks", docRef.id), {
          id: docRef.id
        });
        await addHistory(`[${session?.user?.id}] ${session?.user?.fullName}`, `Added task ${e.title}`);
        fetchTasks();
        setLoading(false);
    }
    
    const validateDate = (value) => {
    const inputDate = new Date(value);
    const today = new Date();

    if (inputDate > today) {
        return true;
    } else {
        return "Date must be greater than today";
    }
    }

    return (
        <section>
            <div className="text-center py-4 mb-8">
                <p className="text-xl lg:text-2xl font-medium text-black dark:text-gray-200 text-center pb-4 px-2 border-b-2 inline-block">Add Task</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div  className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-2 mx-auto">
                        <label className="font-medium text-black dark:text-gray-200 block">Name :</label>
                        <input type="text" {...register("title", {required: {value: true, message: "Enter task name"}, minLength: {value: 3, message: "Minimum 3 character required"}, maxLength: { value: 48, message: "Maximum 48 character allowed"}})} className={`w-96 outline-none border-b-2  dark:text-gray-200 bg-transparent ${errors.title ? "border-red-500" : "border-gray-800 dark:border-gray-200 focus:border-green-500"}`}></input>
                        <p className="text-sm text-red-500">{errors.title?.message}</p>
                    </div>
                    <div className="space-y-2 mx-auto">
                        <label className="font-medium text-black dark:text-gray-200 block">Expire date :</label>
                        <input type="date" {...register("expireDate", {required: {value: true, message: "Enter expire date"}, validate: validateDate})} className={`w-96 outline-none border-b-2  dark:text-gray-200 bg-transparent ${errors.expireDate ? "border-red-500" : "border-gray-800 dark:border-gray-200 focus:border-green-500"}`}></input>
                        <p className="text-sm text-red-500">{errors.expireDate?.message}</p>
                    </div>
                    <div className="text-right">
                        <button type="submit" disabled={loading} className="px-8 mx-auto py-1.5 rounded-sm font-medium text-white dark:text-gray-200 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-700/50 flex items-center space-x-2">
                            {loading && <CgSpinner className="h-5 w-5 animate-spin" />}
                            <p>{loading ? "Adding task..." : "Add task"}</p>
                        </button>
                    </div>
                </div>
                
            </form>
        </section>
    );
}