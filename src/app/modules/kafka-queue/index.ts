import { ModuleBooter, Module } from '../index'
import logger from '../../../utils/logger'
import { instanceKafkaClient } from './client'
import { KafkaConfig, KafkaClientInterface } from './interfaces'

export const boot: ModuleBooter = (): Module<KafkaClientInterface> => {
  try {
    console.log('process.env.KAFKA_CONSUMER_TOPIC_NAME ', process.env.KAFKA_CONSUMER_TOPIC_NAME)
    const name = 'kafka-queue'
    const kafkaConfig: KafkaConfig = {
      consumerTopicName: process.env.KAFKA_CONSUMER_TOPIC_NAME || '',
      producerTopicName: process.env.KAFKA_CONSUMER_TOPIC_NAME || '',
      brokers: process.env.KAFKA_BROKERS || '',
      groupid: process.env.KAFKA_GROUP_ID || '',
      producerClientId: process.env.KAFKA_PRODUCER_CLIENT_ID || '',
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
