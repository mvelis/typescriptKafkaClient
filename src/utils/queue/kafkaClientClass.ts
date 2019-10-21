const EventEmitter = require('events');
const Kafka = require('node-rdkafka');

interface kafkaMessage {
    topic: string;
    offset: string;
    partition: string;
}



const STATES_ENUM = {
    'INITIALIZING': 'initializing',
    'DISCONNECTED': 'disconnected',
    'CONNECTED': 'connected'
};
const clientType: string[] = ['producer','consumer']

class KafkaClientClass extends EventEmitter {

    _client: any
    prefix: string = ''

    currentState = STATES_ENUM.INITIALIZING
    
    constructor(option: string) {
      super();
      this.initInstance(option)
    }


    initInstance(option: string): void {
        this.prefix = option
        switch(option) { 
            case 'producer': { 
                this._client = new Kafka.HighLevelProducer({
                    'metadata.broker.list': process.env.KAFKA_BROKERS,
                })
                this.connect()
               break; 
            } 
            case 'consumer': { 
                this._client = new Kafka.KafkaConsumer({
                    'metadata.broker.list': process.env.KAFKA_BROKERS,
                    'group.id': process.env.KAFKA_GROUP_ID,
                    'enable.auto.commit': false
                })
                this.connect()
               break; 
            } 
            default: { 
               //statements; 
               break; 
            } 
         } 
    }

    

    getState(): string {
        return this.currentState;
    }

    isValidClient(): Boolean {
        return ( clientType.indexOf(this.prefix) >= 0 )
    }

    connect(): void {
        const _this = this
        if ( !this.isValidClient() ) return 

        // Connect to the broker manually
        this._client.connect();

        this._client.on('ready', function() {
            _this.postConnectionOperations()
        });
          
          // Any errors we encounter, including connection errors
        this._client.on('event.error', function(err: any) {
            _this.emit(`${_this.prefix}-queue:error`);
            process.exit(1);
        })

        this._client.on('disconnected', function(arg: any) {
            console.log('producer disconnected. ' + JSON.stringify(arg));
            _this.currentState = STATES_ENUM.DISCONNECTED;  
            _this.emit(`${_this.prefix}-queue:disconnected`);
        });

        this._client.on('data', function(data: any) {
            _this.emit(`${_this.prefix}-queue:new-message`, data);
        })
    }


    postConnectionOperations() {
        switch(this.prefix) { 
            case 'producer': break; 
            case 'consumer': { 
                this.client.subscribe([process.env.KAFKA_TOPIC_NAME])
                this.client.consume();
               break; 
            } 
            default: { 
               //statements; 
               break; 
            } 
         }
         this.currentState = STATES_ENUM.CONNECTED;
         this.emit(`${this.prefix}-queue:connected`);
    }


    publish(topicName: string, message: string) {
        return new Promise((resolve, reject) => {
            if ( this.kafkaClientType !== 'producer' ) return reject(null)
            this._client.produce(topicName, null, Buffer.from(message), null, Date.now(), (err: any, offset: any) => {
                // The offset if our acknowledgement level allows us to receive delivery offsets
                console.log('produce!!!', Buffer.from(message), err, offset);
                if (err) return reject(err);
                return resolve(offset);
            });
          });
    }

    acknowledgeMsg(msg: kafkaMessage) {
        console.log('acknowlegeando mi data ', msg)
        const { topic, offset, partition }: kafkaMessage = msg ;
        try {
            this._client.commitMessage({ topic, offset, partition })
        } catch (err) {
            //logger.error(err);
        }
    }
}

module.exports = KafkaClientClass;