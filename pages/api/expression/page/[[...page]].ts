import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import clientPromise from '../../../../lib/mongodb'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })
  const user = session?.user

  switch (req.method) {
    case 'GET':
      const perPage = 10
      const page = parseInt(req.query.page as string)
      const current = isNaN(page) || page < 1 ? 0 : page - 1 // default page to 1

      const find = Array.isArray(req.query.find)
        ? req.query.find[0]
        : req.query.find

      let searchFilter: any = find
        ? {
            clautano: {
              $regex: new RegExp(diacriticSensitiveRegex(find), 'i'),
            },
          }
        : {}
      if (!user?.isAdmin) {
        //collect only verified or owned expressions
        searchFilter.$or = [
          { isVerified: true },
          {
            'created.userId': user ? new ObjectId(user._id) : new ObjectId(123),
          },
        ]
      }

      let expressions
      let totale

      try {
        const client = await clientPromise
        const db = client.db()

        expressions = await db
          .collection('expressions')
          .find(searchFilter, {
            sort: { 'created.date': 1 },
            skip: perPage * current,
            limit: perPage,
          })
          .toArray()

        totale = await db
          .collection('expressions')
          .countDocuments(searchFilter, {})
        totale = Math.ceil(totale / perPage)

        res.json({
          page: current + 1,
          pages: totale,
          expressions: expressions,
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

  req.statusCode = 200
}

function diacriticSensitiveRegex(string = '') {
  return string
    .replace(/a/g, '[a,á,à,ä]')
    .replace(/e/g, '[e,é,è,ë]')
    .replace(/i/g, '[i,í,ï]')
    .replace(/o/g, '[o,ó,ö,ò]')
    .replace(/u/g, '[u,ü,ú,ù]')
    .replace(/A/g, '[a,á,à,ä]')
    .replace(/E/g, '[e,é,è,ë]')
    .replace(/I/g, '[i,í,ï]')
    .replace(/O/g, '[o,ó,ö,ò]')
    .replace(/U/g, '[u,ü,ú,ù]')
}
