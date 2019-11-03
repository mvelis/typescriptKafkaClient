import { ModuleBooter, Module, AModule } from '../index'
import logger from '../../../utils/logger'
import { instanceKafkaClient } from './client'
import { KafkaConfig } from './interfaces'

export const boot: ModuleBooter = (): Module<AModule> => {
  try {
    const name = 'kafka-queue'
    const kafkaConfig: KafkaConfig = {
      consumerTopicName: process.env.KAFKA_CONSUMER_TOPIC_NAME || '',
      producerTopicName: process.env.KAFKA_PRODUCER_TOPIC_NAME || '',
      brokers: process.env.KAFKA_BROKERS || '',
      groupid: process.env.KAFKA_GROUP_ID || '',
    }
    const kafkaClient = instanceKafkaClient(kafkaConfig)
    return {
      name,
      context: kafkaClient,
      close: (): Promise<void> => {
        kafkaClient.disconnet()
        logger.info(`${name} closed`)
        return Promise.resolve()
      },
    }
  } catch (error) {
    logger.error(error.toString())
    throw error
  }
}
