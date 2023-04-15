import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import clientPromise from '../../../lib/mongodb'
import { Expression, Word } from '../../../types'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })
  switch (req.method) {
    //get single expression by index ####################################################################
    case 'GET':
      try {
        const client = await clientPromise
        const db = client.db()
        if (req.query.index) {
          if (session && session.user.isAdmin) {
            const expression = await db
              .collection('expressions')
              .find({ _id: new ObjectId(req.query.index[0]) })
              .toArray()
            res.status(200).json(expression)
          } else {
            const expression = await db
              .collection('expressions')
              .find({
                _id: new ObjectId(req.query.index[0]),
                $or: [
                  { isVerified: true },
                  {
                    'created.userId': session
                      ? session.user._id
                      : new ObjectId(123),
                  },
                ],
              })
              .toArray()
            res.status(200).json(expression)
          }
        } else {
          throw new Error('Url not valid!')
        }
      } catch (error: any) {
        console.log(error)
        res.status(500).json({
          name: error.name,
          message: error.message,
        })
      }
      break

    case 'POST':
      try {
        if (!session) {
          res.status(401).json({
            name: 'Error',
            message: "Unautheticated user can't add/edit expressions",
          })
        } else {
          const expression = req.body.expression
          if (expression.words) {
            const newIds = expression.words.map((word: Word) => {
              return { _id: new ObjectId(word._id), clautano: word.clautano }
            })
            expression.words = newIds
          }
          const client = await clientPromise
          const db = client.db()
          if (expression._id == undefined) {
            expression.isVerified = session.user.isVerified
            expression.created = {
              userId: session.user._id,
              username: session.user.name,
              date: new Date(),
            }
            const insertResult = await db
              .collection('expressions')
              .insertOne(expression)
            res.status(201).json(insertResult) //CREATED
          } else {
            if (
              !session.user.isAdmin &&
              session.user._id !== expression.created?.userId
            ) {
              res.status(403).json({
                //FORBIDDEN
                name: 'Error',
                message: "Unhautorized user can't edit other's expressions",
              })
            }
            const updateResult = await db.collection('expressions').updateOne(
              { _id: new ObjectId(expression._id) },
              {
                $set: {
                  clautano: expression.clautano,
                  italiano: expression.italiano,
                  voc_claut_1996: expression.voc_claut_1996 ? true : false,
                  isVerified: session.user.isVerified,
                  words: expression.words,
                  updated: {
                    date: new Date(),
                    userId: session.user._id,
                    username: session.user.name,
                  },
                },
              },
              { upsert: true }
            )
            res.status(201).json(updateResult)
          }
        }
      } catch (error: any) {
        console.log(error)
        res.status(500).json({
          name: error.name,
          message: error.message,
        })
      }
      break
    case 'DELETE':
      try {
        const expression: Expression = req.body.expression

        if (!session) {
          res.status(401).json({
            name: 'Error',
            message: "Unautheticated user can't delete expressions",
          })
        } else if (
          !session.user.isAdmin &&
          session.user._id !== expression.created!.userId
        ) {
          res.status(401).json({
            name: 'Error',
            message: "Unhautorized user can't delete other's expressions",
          })
        } else {
          const client = await clientPromise
          const db = client.db()
          const deleteResult = await db
            .collection('expressions')
            .deleteOne({ _id: new ObjectId(expression._id) })

          res.status(201).json(deleteResult)
        }
      } catch (error: any) {
        console.log(error)
        res.status(500).json({
          name: error.name,
          message: error.message,
        })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
