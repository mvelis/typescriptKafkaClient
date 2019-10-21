import { EventEmitter } from 'events'
import Kafka, { HighLevelProducer, KafkaConsumer } from 'node-rdkafka'

export interface KafkaMessage {
  topic: string
  offset: string
  partition: string
}

export interface KafkaClient extends EventEmitter {
  init: () => void
  connect: () => void
  isValidClient: () => boolean
  getState: () => string
  postConnectionOperations: (topic: string) => void
  publish: (topicName: string, message: string) => Promise<any>
  acknowledgeMsg: (message: kafkaMessage) => void
}

export function instanceKafkaClient(clientType: 'producer' | 'consumer'): KafkaClient {
  const clientInstance = new EventEmitter() as KafkaClient
  const STATES_ENUM = {
    INITIALIZING: 'initializing',
    DISCONNECTED: 'disconnected',
    CONNECTED: 'connected',
  }
  let currentState: string
  let client: HighLevelProducer | KafkaConsumer

  clientInstance.init = (): void => {
    console.log('clientInstance.init clientType', clientType)
    currentState = STATES_ENUM.INITIALIZING
    switch (clientType) {
      case 'producer': {
        client = new Kafka.HighLevelProducer({ 'metadata.broker.list': process.env.KAFKA_BROKERS })
        break
      }
      case 'consumer': {
        client = new Kafka.KafkaConsumer(
          {
            'metadata.broker.list': process.env.KAFKA_BROKERS,
            'group.id': process.env.KAFKA_GROUP_ID,
            'enable.auto.commit': false,
          },
          {},
        )
      }
    }

    clientInstance.connect()
  }

  clientInstance.getState = (): string => currentState

  clientInstance.isValidClient = (): boolean => clientType.indexOf(clientType) >= 0

  clientInstance.connect = (): void => {
    if (!clientInstance.isValidClient()) throw new Error('Kafka Client invalid')

    // Connect to the broker manually
    client.connect()
    console.log('clientInstance.connect')
    client.on(
      'ready',
      (): void => {
        currentState = STATES_ENUM.CONNECTED
        console.log('clientInstance on ready')
        if (process.env.KAFKA_TOPIC_NAME) {
          clientInstance.postConnectionOperations(process.env.KAFKA_TOPIC_NAME)
        }
      },
    )

    // Any errors we encounter, including connection errors
    client.on(
      'event.error',
      (err: Error): void => {
        clientInstance.emit(`${clientType}-queue:error`, err)
        process.exit(1)
      },
    )

    client.on(
      'disconnected',
      (...args: any[]): void => {
        console.log('producer disconnected. ' + JSON.stringify(args))
        currentState = STATES_ENUM.DISCONNECTED
        clientInstance.emit(`${clientType}-queue:disconnected`)
      },
    )

    client.on(
      'data',
      (data: any): void => {
        clientInstance.emit(`${clientType}-queue:new-message`, data)
      },
    )
  }

  // este metodo no queda claro cual es su objetivo
  clientInstance.postConnectionOperations = (topic: string = ''): void => {
    console.log('clientInstance.postConnectionOperations ', clientType)
    if (clientType === 'consumer') {
      ;(client as KafkaConsumer).subscribe([topic])
      ;(client as KafkaConsumer).consume()
    }

    clientInstance.emit(`${clientType}-queue:connected`) // es confuso este evento ??
  }

  clientInstance.publish = (topicName: string, message: string): Promise<any> => {
    return new Promise(
      (resolve, reject): void => {
        if (clientType !== 'producer') {
          return reject(new Error('this client is not a producer'))
        }

        ;(client as HighLevelProducer).produce(
          topicName,
          null,
          Buffer.from(message),
          null,
          Date.now(),
          (err: Error, offset: any): void => {
            // The offset if our acknowledgement level allows us to receive delivery offsets
            console.log('produce!!!', Buffer.from(message), err, offset)
            if (err) return reject(err)
            return resolve(offset)
          },
        )
      },
    )
  }

  clientInstance.acknowledgeMsg = (message: kafkaMessage): void => {
    console.log('acknowlegeando mi data ', message)
    const { topic, offset, partition }: kafkaMessage = message
    try {
      ;(client as KafkaConsumer).commitMessage({ topic, offset, partition })
    } catch (err) {
      console.error(err)
    }
  }

  return clientInstance
}
