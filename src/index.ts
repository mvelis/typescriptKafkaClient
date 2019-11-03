import { makeApp } from './app'
import { loadModules } from './app/modules'
import { MongoClientDb } from './app/database/mongodb/client/mongo-client'
import { KafkaClientInterface } from './app/modules/kafka-queue/interfaces'
import serverStarter from './app/server-starter'
const app = makeApp(loadModules)
app.boot()
app.on('application:booted', (): void => {
  app.start((): void => {
    const { connect } = app.context['mongoDB'].context as MongoClientDb
    connect()
    const kafkaClient = app.context['kafka-queue'].context as KafkaClientInterface
    serverStarter(kafkaClient)
    console.log('app started')
    // console.log(app.context)
  })
})

process.on('uncaughtException', (error): void => {
  console.error('Exiting program because of [Uncaught Exception Error]', error)
  process.exit(1)
})
process.on('unhandledRejection', (error): void => {
  console.error('Exiting program because of [Unhandled Promise rejection Error]::', error)
  process.exit(1)
})

process.on('SIGINT', app.close)
process.on('SIGTERM', app.close)
