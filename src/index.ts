import { makeApp } from './app'
import { loadModules } from './app/modules'
import { instanceKafkaClient } from './utils/queue/kafkaClient'
//const KafkaClient = require('./utils/queue/KafkaClient')


const app = makeApp(loadModules)
app.boot()
app.on(
  'application:booted',
  (): void => {
    app.start(
      (): void => {

        
        const kafkaConsumerClient = instanceKafkaClient('consumer')
        kafkaConsumerClient.init()
        kafkaConsumerClient.on(`consumer-queue:connected`, (data: any) => {
            console.log(`consumer-queue:connected`)
        })
        .on(`consumer-queue:new-message`, (data: any) => {
          console.log('AJA MI DATA! ', data)
          kafkaConsumerClient.acknowledgeMsg(data);
        })


        const kafkaProducerClient = instanceKafkaClient('producer')
        kafkaProducerClient.init()
        kafkaProducerClient.on(`producer-queue:connected`, (data: any) => {
            console.log(`producer-queue:connected`)
        })
        .on(`producer-queue:connected`, () => {
            console.log('aqui evento connected')
              for(let i = 0; i < 3; i++){
                kafkaProducerClient.publish('aja', `${i} aqui mi mensajito`)
                .then()
                .catch( (err: any) => {
                  console.log('aqui mi error ', err)
                });
              }
        })
        .on('producer-queue:error', () => {
          console.log('producer aqui evento error')
        })
        .on('producer-queue:disconnected', () => {
          console.log('producer aqui evento disconnected')
        })


        // const kafkaClientType: string = 'consumer'
        // const kafkaClient = new KafkaClientClass(kafkaClientType)
        // .on(`${kafkaClientType}-queue:connected`, () => {
        //     console.log('aqui evento connected')
        //     if ( kafkaClientType === 'producer' ) {
        //       for(let i = 0; i < 3; i++){
        //         kafkaClient.publish('aja', `${i} aqui mi mensajito`)
        //         .then()
        //         .catch( (err: any) => {
        //           console.log('aqui mi error ', err)
        //         });
        //       }
        //     }
        // })
        // .on('consumer-queue:error', () => {
        //   console.log('aqui evento error')
        // })
        // .on('consumer-queue:disconnected', () => {
        //   console.log('aqui evento disconnected')
        // })
        // .on('consumer-queue:new-message', (data: any) => {
        //   console.log('AJA MI DATA! ', data)
        //   kafkaClient.acknowledgeMsg(data);
        // })

        console.log('app started')
        // console.log(app.context)
      },
    )
  },
)

process.on(
  'uncaughtException',
  (error): void => {
    console.error('Exiting program because of [Uncaught Exception Error]', error)
    process.exit(1)
  },
)
process.on(
  'unhandledRejection',
  (error): void => {
    console.error('Exiting program because of [Unhandled Promise rejection Error]::', error)
    process.exit(1)
  },
)

process.on('SIGINT', app.close)
process.on('SIGTERM', app.close)
