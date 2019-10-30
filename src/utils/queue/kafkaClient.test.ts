// var sinon = require('sinon')
import * as sinon from 'sinon'

import { KafkaConfig, instanceKafkaClient, KafkaMessage } from './kafkaClient'
// import { EventEmitter } from 'events'

// Create a fake client for testing purposes.
const EventEmitter = require('events').EventEmitter
// class Client extends EventEmitter {}

// The test case.
fdescribe('test typescript kafka client', (): void => {
  let kafkaClient: any
  let kafkaConsumerClient: any
  let kafkaProducerClient: any

  beforeEach((): void => {
    // mockClient = new EventEmitter()
    kafkaConsumerClient = new EventEmitter()
    kafkaProducerClient = new EventEmitter()
    const kafkaConfig: KafkaConfig = {
      consumerTopicName: 'test',
      producerTopicName: 'test',
      brokers: 'localhost:9092',
      groupid: 'testgroup',
    }
    kafkaClient = instanceKafkaClient(kafkaConfig)
    sinon.stub(kafkaClient, 'getKafkaConsumer').returns(kafkaConsumerClient)
    sinon.stub(kafkaClient, 'getProducerConsumer').returns(kafkaProducerClient)
  })

  afterEach((): void => {
    // Restore the original.
    // kafkaClient.restore()
    // kafkaConsumerClient.restore()
  })

  // it('should call subscribe on ready event', (): void => {
  //   sinon.stub(kafkaClient, 'connect')
  //   kafkaClient.connect()
  //   sinon.stub(kafkaClient, 'subscribe')
  //   kafkaConsumerClient.emit('ready', (): void => {
  //     kafkaClient.subscribe()
  //   })
  //   expect(kafkaClient.connect).toHaveBeenCalled()
  //   expect(kafkaClient.subscribe).toBeCalled()
  //   kafkaClient.subscribe.restore()
  // })

  it('should call connect method an emit event', (): void => {
    kafkaConsumerClient.on('ready', stub)
    kafkaConsumerClient.emit('ready')
    sinon.assert.calledOnce(stub)
    stub.restore()
  })
  it('should call subscribe on ready event', (): void => {
    let stub = sinon.stub(kafkaClient, 'subscribe')
    kafkaConsumerClient.on('ready', stub)
    kafkaConsumerClient.emit('ready')
    sinon.assert.calledOnce(stub)
    stub.restore()
  })
  // it('should call publish when event connect is triggered', (): void => {
  //   const message: KafkaMessage = {
  //     value: 'aja',
  //     size: 121231,
  //     key: '',
  //     timestamp: 111111111,
  //     topic: 'test',
  //     offset: 0,
  //     partition: 0,
  //   }

  //   let stub = sinon.stub(kafkaClient, 'publish')

  //   kafkaProducerClient.on('ready', stub)
  //   kafkaConsumerClient.emit('ready')
  //   sinon.assert.calledOnce(stub)
  //   stub.restore()
  // })
})
