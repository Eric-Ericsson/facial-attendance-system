import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@components/firebase";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'custom',
      credentials: {},
      async authorize(credentials) {
        try {
          const { email, password } = credentials;
          const { user } = await signInWithEmailAndPassword(auth, email, password);
          if (user.email === email) {
            return {
              id: user.uid,
              name: user.displayName,
              email: user.email,
              image: '',
            }
          }
        } catch (error) {
          console.log('Authentication error:', error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.SECRET,

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },

    async session({ session, token }) {
      session.user.uid = token.sub;
      session.user.name = session.user.name
      return session;
    },
  },
};

export default NextAuth(authOptions)

