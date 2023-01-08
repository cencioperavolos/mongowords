import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'
import { Db, ObjectId } from 'mongodb'
import { getSession } from 'next-auth/react'
import { Word } from '../../../types'
import { _id } from '@next-auth/mongodb-adapter'
import { Session, SessionUser, User } from 'next-auth'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  switch (req.method) {
    //get single word by index
    case 'GET':
      try {
        const client = await clientPromise
        const db = client.db()
        if (req.query.index) {
          if (session && session.user.isAdmin) {
            const word = await db
              .collection('words')
              .aggregate([
                {
                  $match: { _id: new ObjectId(req.query.index[0]) }, //allwords
                },
                {
                  $lookup: {
                    from: 'expressions',
                    localField: '_id',
                    foreignField: 'words._id',
                    as: 'expressions',
                  },
                },
                // {
                //   $project: {
                //     clautano: 1,
                //     categoria: 1,
                //     traduzione: 1,
                //     isVerified: 1,
                //     created: 1,
                //     updated: 1,
                //     'expressions._id': 1,
                //     'expressions.clautano': 1,
                //     'expressions.italiano': 1,
                //   },
                // },
              ])
              .toArray()

            res.status(200).json(word[0]) //OK
          } else {
            const word = await db
              .collection('words')
              .aggregate([
                {
                  $match: {
                    _id: new ObjectId(req.query.index[0]),
                    $or: [
                      { isVerified: true }, //words veirified
                      {
                        'created.userId': session
                          ? session.user._id
                          : new ObjectId(123),
                      }, //or owned words
                    ],
                  },
                },
                {
                  $lookup: {
                    from: 'expressions',
                    localField: '_id',
                    foreignField: 'words._id',
                    as: 'expressions',
                  },
                },
                // {
                //   $project: {
                //     clautano: 1,
                //     categoria: 1,
                //     traduzione: 1,
                //     isVerified: 1,
                //     created: 1,
                //     updated: 1,
                //     'expressions._id': 1,
                //     'expressions.clautano': 1,
                //     'expressions.italiano': 1,
                //   },
                // },
              ])
              .toArray()
            res.status(200).json(word[0]) //OK
          }
        } else if (req.query.find) {
          if (session && session.user.isAdmin) {
            //all words
            const words = await db
              .collection('words')
              .find(
                { clautano: { $gte: req.query.find } },
                {
                  sort: { clautano: 1 },
                  collation: { locale: 'it', strength: 1 },
                  limit: 10,
                }
              )
              .toArray()
            res.status(200).send(words) //OK
          } else {
            const words = await db
              .collection('words')
              .find(
                {
                  clautano: { $gte: req.query.find },
                  $or: [
                    { isVerified: true }, //words veirified
                    {
                      'created.userId': session
                        ? session.user._id
                        : new ObjectId(123),
                    }, //or owned words
                  ],
                },
                {
                  sort: { clautano: 1 },
                  collation: { locale: 'it', strength: 1 },
                  limit: 10,
                }
              )
              .toArray()
            res.status(200).send(words) //OK
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

    case 'POST': //PUT
      try {
        const session = await getSession({ req })
        if (!session) {
          console.log('not session!!!!!!!!!!!!!!!!!!!!!')
          res.status(401).json({
            name: 'Error',
            message: "Unautheticated user can't add/edit words",
          })
        } else {
          console.log({ session })
          const word: Word = req.body.word
          const client = await clientPromise
          const db = client.db()
          if (!word._id) {
            ////// NEW WORD
            word.isVerified = session.user.isVerified
            word.created = {
              userId: session.user._id,
              username: session.user.name,
              date: new Date(),
            }
            const expressions = word.expressions
            delete word.expressions
            const insertResult = await db.collection('words').insertOne(word)
            word._id = insertResult.insertedId
            word.expressions = expressions
            updateExpressions(word, session.user, db)
            res.status(201).json(insertResult) //CREATED
          } else {
            ////// EDITED WORD
            if (
              !session.user.isAdmin &&
              session.user._id !== word.created.userId
            ) {
              res.status(403).json({
                //FORBIDDEN
                name: 'Error',
                message: "Unhautorized user can't edit other's words",
              })
            }
            updateExpressions(word, session.user, db)

            delete word.expressions
            const updateResult = await db.collection('words').updateOne(
              { _id: new ObjectId(word._id) },
              {
                $set: {
                  clautano: word.clautano,
                  alternativo: word.alternativo,
                  categoria: word.categoria,
                  traduzione: word.traduzione,
                  voc_claut_1996: word.voc_claut_1996 ? true : false,
                  isVerified: session.user.isVerified,
                  created: word.created,
                  updated: {
                    date: new Date(),
                    userId: session.user._id,
                    username: session.user.name,
                  },
                },
              }
              // { upsert: true }
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
        const word: Word = req.body.word
        const session = await getSession({ req })
        if (!session) {
          res.status(401).json({
            name: 'Error',
            message: "Unautheticated user can't delete words",
          })
        } else if (
          !session.user.isAdmin &&
          session.user._id !== word.created.userId
        ) {
          res.status(401).json({
            name: 'Error',
            message: "Unhautorized user can't delete other's words",
          })
        } else {
          const client = await clientPromise
          const db = client.db()
          const deleteResult = await db
            .collection('words')
            .deleteOne({ _id: new ObjectId(word._id) })

          const expressionsToEdit = await db
            .collection('expressions')
            .find({
              'words._id': new ObjectId(word._id),
            })
            .toArray()
          expressionsToEdit.forEach((expression) => {
            const newWords = expression.words.filter(
              (wd: Word) => !wd._id.equals(word._id)
            )
            db.collection('expressions').updateOne(
              { _id: new ObjectId(expression._id) },
              { $set: { words: newWords } } ///////////////////////////can leave orphan expression
            )
          })

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

function updateExpressions(word: Word, user: SessionUser, database: Db) {
  if (word.expressions) {
    try {
      word.expressions.forEach(async (exp) => {
        if (!exp._id) {
          ////// NEW EXPRESSION
          exp.created = {
            userId: user._id,
            username: user.name,
            date: new Date(),
          }
          exp.isVerified = user.isVerified
          exp.words = [{ _id: new ObjectId(word._id), clautano: word.clautano }]
          const insertResult = await database
            .collection('expressions')
            .insertOne(exp)
        } else {
          ////// UPDATE EXPRESSION

          const wordsSet = []
          const map = new Map()
          for (const item of exp.words ? exp.words : []) {
            if (!map.has(item._id)) {
              map.set(item._id, true) // set any value to Map
              wordsSet.push({
                _id: new ObjectId(item._id),
                clautano: item.clautano,
              })
            }
          }

          const updateResult = await database
            .collection('expressions')
            .updateOne(
              // { _id: new ObjectId(expId) },
              { _id: new ObjectId(exp._id) },
              {
                $set: {
                  clautano: exp.clautano,
                  italiano: exp.italiano,
                  voc_claut_1996: exp.voc_claut_1996,
                  isVerified: user.isVerified,
                  updated: {
                    userId: user._id,
                    username: user.name,
                    date: new Date(),
                  },
                  words: wordsSet,
                },
              }
              // { upsert: true }
            )
        }
        // else if (exp.markDelete){
        //   const expRemoved = await Expression.findByIdAndDelete(exp._id);
        // }
      })
    } catch (e) {
      console.log({ e })
      throw e
    }
  }

  return 'CIAO'
}
