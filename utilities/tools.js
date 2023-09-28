import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore"
import { db } from "@/firebase"

export const addHistory = async(...props) => {
    const docRef = await addDoc(collection(db, 'history'), {
        ...props,
        timestamp: serverTimestamp(),
    });
    await updateDoc(doc(db, "history", docRef.id), {
        id: docRef.id
    })
}