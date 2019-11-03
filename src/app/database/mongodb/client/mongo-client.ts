import mongoose, { Mongoose } from 'mongoose'
import { MongoError } from 'mongodb'

export interface MongoClientDb {
  connect(): Promise<Mongoose>
  disconnect(): Promise<void>
}

export function MongoClient(): MongoClientDb {
  const connect = (): Promise<Mongoose> => {
    const cnx = process.env.DB_URL || ''
    return mongoose.connect(cnx, { useNewUrlParser: true, useUnifiedTopology: true }, (error: MongoError): void => {
      if (error) {
        console.log('error con la connect ')
        console.log(error)
      } else {
        console.log('DB connected')
      }
    })
  }

  const disconnect = async (): Promise<void> => {
    try {
      await mongoose.connection.close()
      console.info(`[database] BD Disconnected\n`)
    } catch (error) {
      console.error(error)
    }
  }

  return { connect, disconnect }
}
