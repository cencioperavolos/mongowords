import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import clientPromise from '../../../../lib/mongodb'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })
  switch (req.method) {
    case 'GET':
      const perPage = 10
      const page: number = parseInt(req.query.page as string)
      const current = isNaN(page) || page < 1 ? 0 : page - 1 // default page to 1
      const k = current === 0 ? 0 : 1 // if not first page (k=1) read last word of previous page for first letter BCD... title
      let totale
      let words

      try {
        const client = await clientPromise
        const db = client.db()
        if (session && session.user.isAdmin) {
          totale = await db.collection('words').estimatedDocumentCount()
          words = await db
            .collection('words')
            .find(
              {},
              {
                collation: {
                  locale: 'it',
                  strength: 1,
                },
                sort: { clautano: 1 },
                skip: perPage * current - k,
                limit: perPage + k,
              }
            )
            .toArray()
        } else {
          //collect only words owned or inserted by verified user
          const filter = {
            $or: [
              { isVerified: true },
              {
                'created.userId': session?.user
                  ? new ObjectId(session.user.id)
                  : new ObjectId(123),
              },
            ],
          }
          totale = await db.collection('words').countDocuments(filter)
          console.log(totale)
          words = await db
            .collection('words')
            .find(filter, {
              collation: {
                locale: 'it',
                strength: 1,
              },
              sort: { clautano: 1 },
              skip: perPage * current - k,
              limit: perPage + k,
            })
            .toArray()
        }

        if (k === 0) {
          // if fist page add fake empty word for A title
          words.unshift({ _id: new ObjectId(123), clautano: ' ' })
        }
        res.json({
          words: words,
          page: current + 1,
          pages: Math.ceil(totale / perPage),
        })
      } catch (error: any) {
        console.log(error)
        res.status(500).json({
          name: error.name,
          message: error.message,
        })
      }
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
