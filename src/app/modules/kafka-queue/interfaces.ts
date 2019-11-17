import { EventEmitter } from 'events'

export interface KafkaCommitMessage {
  topic: string
  offset: number
  partition: number
}

export interface KafkaMessage {
  value: string
  size: number
  key: string
  timestamp: number
  topic: string
  offset: number
  partition: number
}

export interface KafkaClientInterface extends EventEmitter {
  getState: () => string
  acknowledgeMsg: (message: KafkaMessage) => void
  subscribe: () => void
  publish: (topicName: string, message: string) => Promise<number>
  disconnet: () => void
  connect: () => void
  isProducerConnected: () => boolean
  isConsumerConnected: () => boolean
}

export interface KafkaConfig {
  consumerTopicName: string
  producerTopicName: string
  brokers: string
  groupid: string
  producerClientId: string
}
