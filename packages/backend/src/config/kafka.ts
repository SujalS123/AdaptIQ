import { Kafka } from 'kafkajs';
import { env } from './env';
import EventEmitter from 'events';

let kafka: any = null;
let producer: any = null;
let consumer: any = null;

// Local Mock Kafka Event Emitter
class MockKafkaProducer extends EventEmitter {
  async connect() {
    console.log('💚 Connected to Local Mock Kafka Producer');
  }
  async disconnect() {}
  async send(payload: { topic: string; messages: Array<{ value: string }> }) {
    console.log(`[Mock Kafka Pub] Topic: ${payload.topic}, Message:`, payload.messages.map(m => JSON.parse(m.value)));
    this.emit('message', payload.topic, payload.messages);
  }
}

export const connectKafka = async (): Promise<void> => {
  try {
    kafka = new Kafka({
      clientId: env.KAFKA_CLIENT_ID,
      brokers: env.KAFKA_BROKERS,
      connectionTimeout: 1000,
      retry: {
        retries: 0,
      }
    });

    producer = kafka.producer();
    await producer.connect();
    console.log('💚 Connected to Kafka Broker successfully.');
  } catch (error) {
    console.warn('⚠️ Kafka connection failed. Falling back to local Mock Kafka Event Bus.');
    producer = new MockKafkaProducer();
  }
};

export const getKafkaProducer = () => {
  if (!producer) {
    producer = new MockKafkaProducer();
  }
  return producer;
};
