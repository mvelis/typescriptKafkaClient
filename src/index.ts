import { makeApp } from './app'
import { loadModules } from './app/modules'
import { KafkaConfig, instanceKafkaClient } from './utils/queue/kafkaClient'
import logger from './utils/logger'
import { addRefunderEvent } from './app/use-cases'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function aja() {
  const refunderInfo = {
    content: 'aja',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  await addRefunderEvent({
    ...refunderInfo,
  })
}

const app = makeApp(loadModules)
app.boot()
app.on('application:booted', (): void => {
  app.start((): void => {
    aja()
    const kafkaConfig: KafkaConfig = {
      consumerTopicName: process.env.KAFKA_CONSUMER_TOPIC_NAME || '',
      producerTopicName: process.env.KAFKA_PRODUCER_TOPIC_NAME || '',
      brokers: process.env.KAFKA_BROKERS || '',
      groupid: process.env.KAFKA_GROUP_ID || '',
    }
    const kafkaClient = instanceKafkaClient(kafkaConfig)
    kafkaClient
      .on(`queue:disconnected`, (arg: any): void => {
        console.log('queue:disconnected', arg)
        // process.exit(1)
      })
      .on(`queue:error`, (err: Error): void => {
        console.log('queue:error', err)
        logger.error(['error connecting to kafka queue'])
        process.exit(1)
      })
    // .on(`queue:new_message`, (data: any): void => {
    //   console.log(`my message  ${data.value.toString()} ===> ${JSON.stringify(data.value)}`)
    //   // kafkaClient.acknowledgeMsg(data)
    //   kafkaClient.disconnet()
    // })
    // .on(`queue:connected`, (): void => {
    //   console.log('queue:producer_connected')
    //   for (let i = 0; i < 10; i++) {
    //     kafkaClient
    //       .publish(process.env.KAFKA_PRODUCER_TOPIC_NAME || '', `${i} aqui mi mensajito`)
    //       .then((data: number): void => {
    //         console.log('here my published message', data)
    //       })
    //       .catch((err: Error): void => {
    //         console.log('An error has ocurred trying to publish message to queue', err)
    //       })
    //   }
    //   kafkaClient.disconnet()
    // })

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
