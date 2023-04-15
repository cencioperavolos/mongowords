import { ObjectId } from 'mongodb'
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: SessionUser
  }

  interface User {
    // aka database User (merge default naxt-auth user with properties: id email image )
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
    email: string
    name: string
    isVerified: boolean
    isAdmin: boolean
  }
}
