import NextAuth from 'next-auth'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import EmailProvider from 'next-auth/providers/email'
import MongoClientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

const THIRTY_DAYS = 30 * 24 * 60 * 60
const THIRTY_MINUTES = 30 * 60

export default NextAuth({
  secret: process.env.SECRET,
  session: {
    maxAge: THIRTY_DAYS,
    updateAge: THIRTY_MINUTES,
  },
  adapter: MongoDBAdapter(MongoClientPromise),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      console.log('called Session callback: ', new Date(Date.now()))

      // delete session.user.email

      session.user._id = new ObjectId(user.id)
      session.user.email = user.email!
      session.user.isAdmin = user.isAdmin
      session.user.isVerified = user.isVerified
      session.user.name = `${user.info.firstname} ${user.info.lastname} '${user.info.surname}'`

      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      console.log('--------signing in----------------------> ', user, email)
      const isAllowedToSignIn = true
      if (isAllowedToSignIn) {
        return true
      } else {
        // Return false to display a default error message
        return false
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
  },
  pages: {
    newUser: '/user/userProfile', // New users will be directed here on first sign in (leave the property out if not of interest)
  },
})
