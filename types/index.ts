import { ObjectId, WithId } from 'mongodb'

export interface Word {
  _id?: ObjectId
  clautano?: string
  alternativo?: string
  categoria?: string
  traduzione?: string
  voc_claut_1996?: boolean
  isVerified?: boolean
  expressions?: Expression[]
  created?: {
    date: Date
    userId: ObjectId
    username: string
  }
  updated?: {
    date: Date
    userId: ObjectId
    username: string
  }
}

export interface Expression {
  _id?: ObjectId
  clautano?: string
  italiano?: string
  voc_claut_1996?: boolean
  isVerified?: boolean
  words?: { _id: ObjectId; clautano: string }[]
  created?: {
    date: Date
    userId: ObjectId
    username: string
  }
  updated?: {
    date: Date
    userId: ObjectId
    username: string
  }
}
