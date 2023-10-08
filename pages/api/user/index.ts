import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ error: 'Unauthenticated user' })
  } else {
    switch (req.method) {
      //get user
      case 'GET':
        // res.status(200).json({ user: session.user, state: 'isAuthenticated' })
        try {
          const client = await clientPromise
          const db = client.db()
          const result = await db
            .collection('users')
            .findOne({ _id: new ObjectId(session.user._id) })
          console.log(result)
          res.status(201).json(result)
        } catch (error) {
          res.status(500).json(error)
        }
        break

      // modify session user's info
      case 'PUT':
        try {
          const client = await clientPromise
          const db = client.db()
          const result = await db
            .collection('users')
            .findOneAndUpdate(
              { _id: new ObjectId(session.user._id) },
              { $set: { info: req.body.info } },
              { returnDocument: 'after' }
            )
          res.status(201).json(result)
        } catch (error) {
          console.log({ error })
          res.status(500).json(error)
        }
        break
      default:
        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  }
}
