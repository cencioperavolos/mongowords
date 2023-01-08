import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import clientPromise from '../../../../lib/mongodb'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession()
  const perPage = 10
  let position
  let words
  let page

  switch (req.method) {
    case 'GET':
      try {
        const client = await clientPromise
        const db = client.db()

        if (session && session.user.isAdmin) {
          position = await db.collection('words').countDocuments(
            {
              clautano: { $lte: req.query.text }, // Great / Less than equal find index position of word
            },
            {
              collation: {
                locale: 'it',
                strength: 1,
              },
            }
          )
          page = Math.ceil(position / perPage)
          const current = isNaN(page) || page < 1 ? 0 : page - 1 // default page to 1
          const k = current === 0 ? 0 : 1 // if not first page (k=1) read last word of previous page for first letter BCD... title
          console.log(current, k)
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
          position = await db.collection('words').countDocuments(
            {
              clautano: { $lte: req.query.text },
              $or: [
                { isVerified: true },
                {
                  'created.userId': session
                    ? session.user.id
                    : new ObjectId('123456789012345678901234'),
                },
              ],
            },
            {
              collation: {
                locale: 'it',
                strength: 1,
              },
            }
          )
          page = Math.ceil(position / perPage)
          const current = isNaN(page) || page < 1 ? 0 : page - 1 // default page to 1
          const k = current === 0 ? 0 : 1 // if not first page (k=1) read last word of previous page for first letter BCD... title
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
        }

        res.json({ page: page, position: position, words: words })
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
