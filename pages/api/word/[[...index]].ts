import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'
import { Db, ObjectId } from 'mongodb'
import { getSession } from 'next-auth/react'
import { Word } from '../../../types'
import { _id } from '@next-auth/mongodb-adapter'
import { Session, SessionUser, User } from 'next-auth'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
  // console.log('request cookie ----------------> : ', req.cookies)

  switch (req.method) {
    //get single word by index ####################################################################
    //and corelated expressions
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
              ])
              .toArray()

            res.status(200).json(word) //OK
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
                          ? session.user._id.toString()
                          : '123',
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
              ])
              .toArray()
            res.status(200).json(word) //OK
          }
        } else if (req.query.find) {
          //get max 10 words by regex #############################################################
          const find = Array.isArray(req.query.find)
            ? diacriticSensitiveRegex(req.query.find[0])
            : diacriticSensitiveRegex(req.query.find)
          console.log('find=' + find)
          if (session && session.user.isAdmin) {
            //all words
            const words = await db
              .collection('words')
              .find(
                {
                  clautano: {
                    $regex: new RegExp(find, 'i'),
                  },
                },
                {
                  sort: { clautano: 1 },
                  collation: { locale: 'it', strength: 1 },
                  limit: 10,
                }
              )
              .toArray()
            res.status(200).send(words) //OK
          } else {
            let filter = []
            filter.push({
              'created.userId': session
                ? session.user._id.toString()
                : new ObjectId(123),
            }) //owned words
            if (session?.user.isVerified) {
              filter.push({ isVerified: true })
            }

            const words = await db
              .collection('words')
              .find(
                {
                  clautano: {
                    $regex: new RegExp(find, 'i'),
                  },
                  $or: filter,
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
        res.status(500).json({ name: error.name, message: error.message })
      }
      break

    case 'POST': //PUT
      try {
        if (!session) {
          console.log('not session!!!!!!!!!!!!!!!!!!!!!')
          res.status(401).json({
            name: 'Error',
            message: "Unautheticated user can't add/edit words",
          })
        } else {
          const word: Word = req.body.word
          const client = await clientPromise
          const db = client.db()
          if (!word._id) {
            ////// NEW WORD
            word.isVerified = session.user.isVerified
            word.created = {
              userId: new ObjectId(session.user._id),
              username: session.user.name,
              date: new Date(),
            }
            const expressions = word.expressions
            delete word.expressions
            const insertResult = await db.collection('words').insertOne(word)
            word._id = insertResult.insertedId
            word.expressions = expressions
            await updateExpressions(word, session.user, db) //UPDATE_EXPRESSIONS
            res.status(201).json(insertResult) //CREATED
          } else {
            ////// EDITED WORD
            if (
              !session.user.isAdmin &&
              !session.user._id.equals(word.created!.userId)
            ) {
              res.status(403).json({
                //FORBIDDEN
                name: 'Error',
                message: "Unhautorized user can't edit other's words",
              })
            }

            ///// UPDATE EXPRESSIONS
            await updateExpressions(word, session.user, db)

            delete word.expressions
            const updateResult = await db.collection('words').findOneAndUpdate(
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
                    userId: new ObjectId(session.user._id),
                    username: session.user.name,
                  },
                },
              },
              { returnDocument: 'after' }
            )
            console.log('UPDATE -------------------- ', updateResult)

            const updatedWord = await db
              .collection('words')
              .aggregate([
                {
                  $match: { _id: new ObjectId(word._id) }, //allwords
                },
                {
                  $lookup: {
                    from: 'expressions',
                    localField: '_id',
                    foreignField: 'words._id',
                    as: 'expressions',
                  },
                },
              ])
              .toArray()

            res.status(201).json(updatedWord[0]) //OK

            // res.status(201).json(updateResult)
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
        const word: Word = req.body.word
        if (!session) {
          res.status(401).json({
            name: 'Error',
            message: "Unautheticated user can't delete words",
          })
        } else if (
          !session.user.isAdmin &&
          !session.user._id.equals(word.created!.userId)
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
              (wd: Word) => !wd._id!.equals(word._id!)
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

async function updateExpressions(
  expressionsWord: Word,
  user: SessionUser,
  database: Db
) {
  try {
    // carica dal database le attuali espressioni con la parola
    //{"words._id": ObjectId('64cbccee9d7e21c19c653aa5')}
    const expressionsLinkedInDatabase = await database
      .collection('expressions')
      .find({ 'words._id': new ObjectId(expressionsWord._id) })
      .toArray()

    // clacola le espressioni rimosse, da modificare nel database
    const removedExpressions = expressionsLinkedInDatabase.filter((expr) => {
      const index = expressionsWord.expressions?.findIndex((item) => {
        console.log(
          '---',
          expr._id,
          '---',
          item._id,
          ' : ',
          expr._id.equals(item._id!)
        )
        return expr._id.equals(item._id!)
      })
      console.log(index)
      return index
    })

    console.log(
      'rrrrrrrremovedrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
      removedExpressions
    )

    //update expression in database removing link to word
    //words with filter
    removedExpressions.forEach(async (exp) => {
      const newWords = exp.words.filter((w: Word) => {
        return !w._id?.equals(expressionsWord._id!)
      })
      exp.words = newWords

      const updateResult = await database.collection('expressions').updateOne(
        // { _id: new ObjectId(expId) },
        { _id: exp._id },
        {
          $set: {
            // clautano: exp.clautano,
            // italiano: exp.italiano,
            // voc_claut_1996: exp.voc_claut_1996,
            // isVerified: user.isVerified,
            updated: {
              userId: user._id,
              username: user.name,
              date: new Date(),
            },
            words: newWords,
          },
        }
        // { upsert: true }
      )
    })

    if (expressionsWord.expressions) {
      expressionsWord.expressions.forEach(async (exp) => {
        if (!exp._id) {
          ////// NEW EXPRESSION
          console.log('ADDING NEW EXPRESSION---->', { exp })
          exp.created = {
            userId: user._id,
            username: user.name,
            date: new Date(),
          }
          exp.isVerified = user.isVerified
          let wordsForExpression = []
          wordsForExpression.push({
            _id: new ObjectId(expressionsWord._id),
            clautano: expressionsWord.clautano ?? '',
          })
          for (const item of exp.words ? exp.words : []) {
            wordsForExpression.push({
              _id: new ObjectId(item._id),
              clautano: item.clautano,
            })
          }
          exp.words = wordsForExpression
          const insertResult = await database
            .collection('expressions')
            .insertOne(exp)
        } else {
          ////// UPDATE EXPRESSION
          console.log('UPDATING EXPRESSION ---->', { exp })

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
    }
  } catch (e) {
    console.log({ e })
    throw e
  }

  return 'CIAO'
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
