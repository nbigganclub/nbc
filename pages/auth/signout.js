import { getServerSession } from "next-auth/next"
import Image from 'next/image'
import { authOptions } from "../api/auth/[...nextauth]"
import { useSession, signOut } from "next-auth/react"

export default function SignOut() {
  
  const { data: session } = useSession();
  
  return (
    <div className="min-h-[700px] flex items-center justify-center">
      <div className="w-96">
        <p className="mb-2">You are signed in with :</p>
        <Image src={session.user.image} alt="" height="50" width="50" className="mx-auto rounded-full" />
        <p className="text-sm mb-5 text-center">{session.user.email}</p>
        <button type="button" onClick={() => signOut({ callbackUrl: "/"})} className="py-1.5 font-semibold shadow-xl bg-pink-500 text-white px-10 flex items-center mx-auto rounded justify-center space-x-2">
          <p>SignOut</p>
   
        </button>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(
        context.req,
        context.res,
        authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
      }
    }
  }
  return {
    props: {
      session: session.user,
    },
  }
}
