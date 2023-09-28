import { useRouter } from "next/router"
import Image from "next/image";
import { useState } from 'react'
import { signIn } from "next-auth/react"
import { useForm } from 'react-hook-form';
import { CgSpinner } from 'react-icons/cg';
import backgroundImage from "@/components/assets/5559852.jpg";
import headerLogo from "@/components/assets/headerLogo.png"

export default function Login() {
 
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ code: 0, message: "" });
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const router = useRouter();
    
  const onSubmit = async(data) => {
    setLoading(true);
    setStatus({ code: 0, message: "" });
    await signIn('credentials', {
      email: data.nbcid,
      password: data.password,
      redirect: false,
    })
    .then((e) => {
      if (e.ok) {
        router.push('/admin');
      } else {
        setStatus({ code: e.status, message: e.error });
        setLoading(false);
      }
    });
  }
  
  return (
    <div style={{ backgroundImage: `url(${backgroundImage.src})`}} className="h-screen flex items-center justify-center text-white dark:text-gray-200 bg-center bg-cover bg-no-repeat">
      <form onSubmit={handleSubmit(onSubmit)} className="w-[400px] lg:w-[550px] backdrop-blur-sm border border-blue-400 shadow-md p-3 lg:p-10 rounded-lg">
        <div className="flex justify-center mb-1 items-center space-x-2">
          <Image src={headerLogo.src} alt-="" height="70" width="70" />
          <p className="text-2xl font-semibold text-sky-400">Narsingdi Biggan Club</p>
        </div>
        <p className="italic text-center">Admin signin only</p>
        <div className="mb-3">
          <label className="block text-lg p-1 font-medium">NBC ID :</label>
          <input type="text" {...register("nbcid", {required: { value: true, message: "NBC ID is required"}, pattern: /^[0-9]+$/})} placeholder="Get from nbc admin panel" className={`p-2 border-b-2 bg-transparent w-full outline-none transition-all ring-0 ${errors.nbcid ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-green-500 focus:outline-none"}`} />
          <p className="text-red-400 mt-1 text-sm">{errors.nbcid?.message}</p>
        </div>
        <div className="mb-3">
          <label className="block text-lg p-1 font-medium">Password :</label>
          <input type="password" placeholder="Password" {...register("password", {required: { value: true, message: "Password is required"}, minLength: { value: 3, message: "Minimum 3 character required" }, maxLength: { value: 32, message: "Maximum 3 character allowed" }})} className={`p-2 border-b-2 bg-transparent w-full outline-none transition-all ring-0 ${errors.password ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-green-500"}`} />
          <p className="text-red-400 mt-1 text-sm">{errors.password?.message}</p>
        </div>
        <div className="mb-2">
          <label>Show password</label>
        </div>
        <p className={`text-sm mb-3 text-center ${status.code < 400 ? "text-green-500" : "text-red-400"}`}>{status.message}</p>
        <button type="submit" disabled={loading} className="mt-8 py-1.5 bg-sky-500 hover:bg-sky-700 transition-all font-semibold shadow-lg text-white dark:text-gray-200 w-full flex items-center rounded justify-center space-x-2 mx-auto disabled:bg-sky-500/50">
          {loading && <CgSpinner className="h-5 w-5 animate-spin" />}
          <p>{loading ? "Logging in..." : "Login"}</p>
        </button>
      </form>
    </div>
  );
}