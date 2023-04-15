import { Filter, ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { SessionUser } from 'next-auth'
import { getSession } from 'next-auth/react'
import clientPromise from '../../../../lib/mongodb'
import { Word } from '../../../../types'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })
  const user = session?.user

  switch (req.method) {
    case 'GET':
      //get page of words [calculated by find query, otherwise from url page parameter] #########################################
      const perPage = 10
      let page: number = parseInt(req.query.page as string)
      const find = Array.isArray(req.query.find)
        ? req.query.find[0] //? diacriticSensitiveRegex(req.query.find[0])
        : req.query.find //: diacriticSensitiveRegex(req.query.find)
      if (find) {
        page = await searchPage(find, perPage, user)
      }
      const current = isNaN(page) || page < 1 ? 0 : page - 1 // default page to 1
      const k = current === 0 ? 0 : 1 // if not first page (k=1) read last word of previous page for first letter BCD... title

      let totale
      let words

      try {
        const client = await clientPromise
        const db = client.db()
        if (user?.isAdmin) {
          //all words
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
                'created.userId': user
                  ? new ObjectId(user._id)
                  : new ObjectId(123),
              },
            ],
          }
          totale = await db.collection('words').countDocuments(filter)
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
          page: current + 1,
          pages: Math.ceil(totale / perPage),
          words: words,
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

// function diacriticSensitiveRegex(string = '') {
//   return string
//     .replace(/a/g, '[a,á,à,ä]')
//     .replace(/e/g, '[e,é,è,ë]')
//     .replace(/i/g, '[i,í,ï]')
//     .replace(/o/g, '[o,ó,ö,ò]')
//     .replace(/u/g, '[u,ü,ú,ù]')
//     .replace(/A/g, '[a,á,à,ä]')
//     .replace(/E/g, '[e,é,è,ë]')
//     .replace(/I/g, '[i,í,ï]')
//     .replace(/O/g, '[o,ó,ö,ò]')
//     .replace(/U/g, '[u,ü,ú,ù]')
// }

async function searchPage(
  find: string,
  perPage: number,
  user:
    | (SessionUser & {
        name?: string | null | undefined
        email?: string | null | undefined
        image?: string | null | undefined
      })
    | undefined
): Promise<number> {
  let position: number
  let searchFilter: Filter<Word> = {
    clautano: { $lte: find }, // Great / Less than equal find index position of word
  }
  if (!user?.isAdmin) {
    //collect only verified or owned words
    searchFilter.$or = [
      { isVerified: true },
      {
        'created.userId': user ? user._id : new ObjectId(123),
      },
    ]
  }

  const client = await clientPromise
  const db = client.db()
  position = await db.collection('words').countDocuments(searchFilter, {
    collation: {
      locale: 'it',
      strength: 1,
    },
  })

  return Math.ceil(position / perPage)
}
