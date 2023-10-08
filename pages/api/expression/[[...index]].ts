import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import clientPromise from '../../../lib/mongodb'
import { Expression, Word } from '../../../types'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
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
        res.status(500).json({ name: error.name, message: error.message })
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
              // if (!session.user.isVerified) {
              //   console.log('word.created.user_id ', word.created?.userId)
              //   console.log('user._id ', session.user._id.toString())

              //   if (
              //     word.created?.userId.toString() !==
              //     session.user._id.toString()
              //   )
              //     throw new Error(
              //       "L'utente non verificato può inserire solo parole 'sue'"
              //     )
              // }
              return { _id: new ObjectId(word._id), clautano: word.clautano } // aggiungere solo parole rispondenti al tipo di user
            })
            expression.words = newIds
          }
          const client = await clientPromise
          const db = client.db()
          if (!expression._id) {
            //NEW EXPRESSION
            expression.isVerified = session.user.isVerified
            expression.created = {
              userId: session.user._id,
              username: session.user.name,
              date: new Date(),
            }
            const insertResult = await db
              .collection('expressions')
              .insertOne(expression)
            res.status(201).json(insertResult)
          } else {
            /////EDITED EXPRESSION
            if (
              !session.user.isAdmin &&
              !session.user._id.equals(expression.created.userId)
            ) {
              //FORBIDDEN
              res.status(403).json({
                name: 'Error',
                message: "Unhautorized user can't edit other's expressions",
              })
            }
            const updateResult = await db
              .collection('expressions')
              .findOneAndUpdate(
                { _id: new ObjectId(expression._id) },
                {
                  $set: {
                    clautano: expression.clautano,
                    italiano: expression.italiano,
                    voc_claut_1996: expression.voc_claut_1996 ? true : false,
                    isVerified: session.user.isVerified || false,
                    words: expression.words,
                    updated: {
                      date: new Date(),
                      userId: session.user._id,
                      username: session.user.name,
                    },
                  },
                },
                { upsert: true, returnDocument: 'after' }
              )
            console.log('-------------------- ', updateResult)

            res.status(201).json(updateResult.value)
          }
        }
      } catch (error: any) {
        console.log('ERROR CATCHED: ', error)
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
          !session.user._id.equals(expression.created!.userId)
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
          error: {
            name: error.name,
            message: error.message,
          },
        })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
