/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'events'
import Kafka, { HighLevelProducer, KafkaConsumer } from 'node-rdkafka'

export interface KafkaCommitMessage {
  topic: string
  offset: string
  partition: string
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
}

export function instanceKafkaClient(config: KafkaConfig): KafkaClientInterface {
  const clientInstance = new EventEmitter() as KafkaClientInterface
  const STATES_ENUM = {
    INITIALIZING: 'initializing',
    DISCONNECTED: 'disconnected',
    CONNECTED: 'connected',
  }
  const EVENT_ENUM = {
    CONNECTED: 'queue:connected',
    DISCONNECTED: 'queue:disconnected',
    ERROR: 'queue:error',
    NEW_MESSAGE: 'queue:new_message',
  }
  let currentState: string
  currentState = STATES_ENUM.INITIALIZING
  let producerClient: HighLevelProducer
  let consumerClient: KafkaConsumer
  let producerConnected = false
  let consumerConnected = false

  producerClient = new Kafka.HighLevelProducer({
    'metadata.broker.list': config.brokers,
  })
  producerClient.connect()
  producerClient
    .on('ready', (): void => {
      producerConnected = true
      /** just emit masked connected event when producer is ready to publish */
      currentState = STATES_ENUM.CONNECTED
      clientInstance.emit(`${EVENT_ENUM.CONNECTED}`)
    })
    .on('event.error', (err: Error): void => {
      /** emit masked error event when whenever consumer or producer emit an error event */
      clientInstance.emit(`${EVENT_ENUM.ERROR}`, err)
    })
    .on('disconnected', (arg: Error): void => {
      producerConnected = false
      currentState = STATES_ENUM.DISCONNECTED
      /** emit masked disconnected event when whenever consumer or producer emit an disconnected event */
      clientInstance.emit(`${EVENT_ENUM.DISCONNECTED}`, arg)
    })
  consumerClient = new Kafka.KafkaConsumer(
    {
      'metadata.broker.list': config.brokers,
      'group.id': config.groupid,
      'enable.auto.commit': false,
    },
    {},
  )
  consumerClient.connect()
  consumerClient
    .on('ready', (): void => {
      consumerConnected = true
      currentState = STATES_ENUM.CONNECTED
      /** automatically consumer subscribe when emit event ready */
      clientInstance.subscribe()
      /** just emit masked connected event when producer is ready to publish */
    })
    .on('data', (data: KafkaMessage | any): void => {
      /** emit masked new message event when consumer emit data event */
      clientInstance.emit(`${EVENT_ENUM.NEW_MESSAGE}`, data)
    })
    .on('event.error', (err: Error): void => {
      /** emit masked error event when whenever consumer or producer emit an error event */
      clientInstance.emit(`${EVENT_ENUM.ERROR}`, err)
    })
    .on('disconnected', (arg: Error): void => {
      consumerConnected = false
      currentState = STATES_ENUM.DISCONNECTED
      /** emit masked disconnected event when whenever consumer or producer emit an disconnected event */
      clientInstance.emit(`${EVENT_ENUM.DISCONNECTED}`, arg)
    })

  clientInstance.getState = (): string => currentState
  clientInstance.isProducerConnected = (): boolean => producerConnected
  clientInstance.isConsumerConnected = (): boolean => consumerConnected

  clientInstance.subscribe = (): void => {
    consumerClient.subscribe([config.consumerTopicName])
    consumerClient.consume()
  }

  clientInstance.publish = (topicName: string, message: string): Promise<number | never> => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return new Promise<number | never>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      producerClient.produce(topicName, null, Buffer.from(message), null, Date.now(), (err: any, offset: number) => {
        if (err) return reject(err)
        return resolve(offset)
      })
    })
  }

  clientInstance.disconnet = (): void => {
    if (producerClient && clientInstance.isProducerConnected()) producerClient.disconnect()
    if (consumerClient && clientInstance.isConsumerConnected()) {
      consumerClient.unsubscribe()
      consumerClient.disconnect()
    }
  }

  clientInstance.acknowledgeMsg = (message: KafkaMessage): void => {
    console.log('acknowlegeando mi data ', message)
    const { topic, offset, partition }: KafkaMessage = message
    try {
      consumerClient.commitMessage({ topic, offset, partition })
    } catch (err) {
      throw new Error('error at acknowledge message')
    }
  }
  return clientInstance
}
