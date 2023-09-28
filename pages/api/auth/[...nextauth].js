import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";



const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const userSnapshot = await getDoc(doc(db, 'users', credentials.email));
        const userData = userSnapshot.data();
        const passwordMatched = await compare(credentials.password, userData.password);
        if (!userData || !passwordMatched) {
          throw new Error("Invalid email or password");
        }
        return {
          id: userData.id,
          name: userData.id,
          email: userData.email,
          image: userData.profilePic,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      const userSnapshot = await getDoc(doc(db, 'users', session.user.name));
      session.user = userSnapshot.data();
      session.user.password = null;
      return session;
    },
  },
};

export default NextAuth(authOptions);
