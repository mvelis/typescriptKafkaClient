import { EventEmitter } from 'events'
import Kafka, { HighLevelProducer, KafkaConsumer } from 'node-rdkafka'
import { KafkaConfig, KafkaCommitMessage, KafkaMessage, KafkaClientInterface } from './interfaces'
import { STATES_ENUM, EVENT_ENUM } from './enums'

export function instanceKafkaClient(config: KafkaConfig): KafkaClientInterface {
  const clientInstance = new EventEmitter() as KafkaClientInterface
  let currentState = STATES_ENUM.INITIALIZING
  let producerConnected = false
  let consumerConnected = false

  let producerClient: HighLevelProducer = new Kafka.HighLevelProducer({
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
  let consumerClient: KafkaConsumer = new Kafka.KafkaConsumer(
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
    console.log('\t\t\tacknowlegeando mi data ', message)
    const { topic, offset, partition }: KafkaCommitMessage = message
    try {
      consumerClient.commitMessage({ topic, offset, partition })
    } catch (err) {
      throw new Error('error at acknowledge message')
    }
  }
  return clientInstance
}
