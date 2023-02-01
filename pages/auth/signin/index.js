import { useRouter } from "next/router"
import { signIn } from "next-auth/react"
import { AiOutlineGoogle } from "react-icons/ai";

export default function Login() {
  
  return (
    <div className="min-h-[700px] flex items-center justify-center">
      <button type="button" onClick={() => signIn('google', { callbackUrl: "/"})} className="py-1.5 font-semibold shadow-xl bg-white dark:bg-gray-900 text-black dark:text-gray-200 w-96 flex items-center justify-center space-x-2">
        <p>Continue with google</p>
        <AiOutlineGoogle className="h-5 w-5" />
      </button>
    </div>
  );
}