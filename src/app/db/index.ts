import mongodb from 'mongodb'

const MongoClient = mongodb.MongoClient
const url = process.env.DB_URL || ''
const dbName = process.env.DB_NAME
const dbClient = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true })

export default async function makeDatabase() {
  if (!dbClient.isConnected()) await dbClient.connect()
  return dbClient.db(dbName)
}
