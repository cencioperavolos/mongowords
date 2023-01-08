import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import clientPromise from '../../../../lib/mongodb'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = getSession({ req })
  switch (req.method) {
    case 'GET':
      try {
        const perPage = 5
        const page = req.query.page ? parseInt(req.query.page[0]) - 1 : 0
        let expressions
        let totale
        const text = req.query.text
          ? typeof req.query.text === 'string'
            ? req.query.text
            : req.query.text[0]
          : ''
        const search = text
          ? {
              clautano: {
                $regex: new RegExp(diacriticSensitiveRegex(text)),
              },
            }
          : {}

        const client = await clientPromise
        const db = client.db()

        expressions = await db
          .collection('expressions')
          .find(search, {
            collation: {
              locale: 'it',
              strength: 1,
            },
            sort: { 'created.date': 1 },
            skip: perPage * page,
            limit: perPage,
          })
          .toArray()

        totale = await db.collection('expressions').countDocuments(search, {
          collation: {
            locale: 'it',
            strength: 1,
          },
        })
        totale = Math.ceil(totale / perPage)

        res.json({ page: page, pages: totale, expressions: expressions })
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
    .replace(/e/g, '[e,é,ë]')
    .replace(/i/g, '[i,í,ï]')
    .replace(/o/g, '[o,ó,ö,ò]')
    .replace(/u/g, '[u,ü,ú,ù]')
}
