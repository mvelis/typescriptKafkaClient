import { KafkaClientInterface, KafkaMessage } from '../modules/kafka-queue/interfaces'
import { saveRefund } from '../use-cases'
import { makeRefundMongoRepository } from '../database/mongodb'
import logger from '../../utils/logger'

export default function serverStarter(queue: KafkaClientInterface): void {
  queue
    .on(
      `queue:new_message`,
      async (data: KafkaMessage): Promise<void> => {
        console.log('*************************************************************')
        const incomingMessage = data
        const messageToConsume = data.value.toString().replace(/[^\x20-\x7E]/g, '')
        console.log('queue:new_message', messageToConsume)
        const refundObject = {
          orderId: 'xxxx',
          amount: 100,
          state: 'received',
          createdAt: new Date(),
          metadata: messageToConsume,
        }
        await saveRefund(makeRefundMongoRepository(), refundObject)
        const messageToPublish = `answer for msge ${messageToConsume}`
        queue
          .publish(process.env.KAFKA_PRODUCER_TOPIC_NAME || '', messageToPublish)
          .then((data: number): void => {
            console.log('\t\t\there my published message', data)
            queue.acknowledgeMsg(incomingMessage)
          })
          .catch((err: Error): void => {
            console.log('\t\t\tAn error has ocurred trying to publish message to queue', err)
          })
      },
    )

    .on(`queue:error`, (err: Error): void => {
      logger.error(['error at kafka queue', err.toString()])
      process.exit(1)
    })
}
