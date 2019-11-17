import { KafkaClientInterface } from '../modules/kafka-queue/interfaces'
import logger from '../../utils/logger'
import cuid from 'cuid'
import readline from 'readline'

function askQuestion(query: any): Promise<any> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close()
      resolve(ans)
    }),
  )
}

export default function serverStarter(queue: KafkaClientInterface): void {
  queue.on(
    'queue:connected',
    async (): Promise<void> => {
      console.log('queue:connected')
      while (true) {
        await askQuestion('\npress ENTER to publish a message')
        const message: any = {
          requestid: `requestid-${cuid()}`,
          orderid: `orderid-${cuid()}`,
          amount: Math.floor(Math.random() * 1000) + 1,
          metadata: {},
        }
        await queue
          .publish(process.env.KAFKA_PRODUCER_TOPIC_NAME || '', JSON.stringify(message))
          .then((data: number): void => {
            console.log('\r\t\there my published message', data, message)
          })
          .catch((err: Error): void => {
            console.log('\t\t\tAn error has ocurred trying to publish message to queue', err)
          })
      }
    },
  )

  queue.on(`queue:error`, (err: Error): void => {
    queue.disconnet()
    logger.error(['error at kafka queue', err.toString()])
    process.exit(1)
  })
}
