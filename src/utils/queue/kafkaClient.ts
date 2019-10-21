import { EventEmitter } from 'events'
const Kafka = require('node-rdkafka');

export interface kafkaMessage {
    topic: string;
    offset: string;
    partition: string;
}

export interface kafkaClientInterface extends EventEmitter {
    init: () => void
    connect: () => void
    isValidClient: () => Boolean
    getState: () => string
    postConnectionOperations: () => void
    publish: (topicName: string, message: string) => Promise<any>
    acknowledgeMsg: (message: kafkaMessage) => void
}


  
export function instanceKafkaClient(option: string): kafkaClientInterface {
    const clientInstance = new EventEmitter() as kafkaClientInterface
    const STATES_ENUM = {
        'INITIALIZING': 'initializing',
        'DISCONNECTED': 'disconnected',
        'CONNECTED': 'connected'
    };
    let currentState: string
    let clientType: string = option
    let client: any

    clientInstance.init = (): void => {
        console.log('clientInstance.init clientType', clientType)
        currentState = STATES_ENUM.INITIALIZING
        switch(clientType) { 
            case 'producer': { 
                client = new Kafka.HighLevelProducer({
                    'metadata.broker.list': process.env.KAFKA_BROKERS,
                })
                clientInstance.connect()
               break; 
            } 
            case 'consumer': { 
                client = new Kafka.KafkaConsumer({
                    'metadata.broker.list': process.env.KAFKA_BROKERS,
                    'group.id': process.env.KAFKA_GROUP_ID,
                    'enable.auto.commit': false
                })
                clientInstance.connect()
               break; 
            } 
            default: break; 
         } 
    }

    clientInstance.getState = (): string => {
        return currentState;
    }

    clientInstance.isValidClient  = (): Boolean => {
        return clientType.indexOf(clientType) >= 0
    }


    clientInstance.connect = (): void  => {
        
        if ( !clientInstance.isValidClient() ) return 

        // Connect to the broker manually
        client.connect();
        console.log('clientInstance.connect');
        client.on('ready', function() {
            console.log('clientInstance on ready');
            clientInstance.postConnectionOperations()
        });
          
          // Any errors we encounter, including connection errors
        client.on('event.error', function(err: any) {
            clientInstance.emit(`${clientType}-queue:error`);
            process.exit(1);
        })

        client.on('disconnected', function(arg: any) {
            console.log('producer disconnected. ' + JSON.stringify(arg));
            currentState = STATES_ENUM.DISCONNECTED;  
            clientInstance.emit(`${clientType}-queue:disconnected`);
        });

        client.on('data', function(data: any) {
            clientInstance.emit(`${clientType}-queue:new-message`, data);
        })
    }

    clientInstance.postConnectionOperations = () => {
        console.log('clientInstance.postConnectionOperations ', clientType)
        switch(clientType) { 
            case 'producer': break; 
            case 'consumer': { 
                client.subscribe([process.env.KAFKA_TOPIC_NAME])
                client.consume();
               break; 
            } 
            default: break
         }
         currentState = STATES_ENUM.CONNECTED;
         clientInstance.emit(`${clientType}-queue:connected`);
    }

    clientInstance.publish = (topicName: string, message: string) => {
        return new Promise((resolve, reject) => {
            if ( clientType !== 'producer' ) return reject(null)
            client.produce(topicName, null, Buffer.from(message), null, Date.now(), (err: any, offset: any) => {
                // The offset if our acknowledgement level allows us to receive delivery offsets
                console.log('produce!!!', Buffer.from(message), err, offset);
                if (err) return reject(err);
                return resolve(offset);
            });
          });
    }

    clientInstance.acknowledgeMsg = (message: kafkaMessage) => {
        console.log('acknowlegeando mi data ', message)
        const { topic, offset, partition }: kafkaMessage = message ;
        try {
            client.commitMessage({ topic, offset, partition })
        } catch (err) {
            //logger.error(err);
        }
    }

    return clientInstance
  }