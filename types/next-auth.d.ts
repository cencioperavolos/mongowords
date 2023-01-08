import { ObjectId } from 'mongodb'
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: SessionUser & DefaultSession['user']
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    _id: ObjectId
    info: {
      firstname: string
      lastname: string
      surname: string
    }
    isVerified: boolean
    isAdmin: boolean
  }

  interface SessionUser {
    _id: ObjectId
    name: string
    isVerified: boolean
    isAdmin: boolean
  }
}
