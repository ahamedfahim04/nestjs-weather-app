import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_CLIENT, KAFKA_CONSUMER_GROUP } from './kafka.constants';
import { KafkaProducer } from './kafka.producer';
import { KafkaConsumer } from './kafka.consumer';
import { MongooseModule } from '@nestjs/mongoose';
import { City, CitySchema } from 'src/city/entities/city.entity';




@Module({
  imports: [
     MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    ClientsModule.register([
      {
        name: KAFKA_CLIENT,                // Unique Kafka client name
        transport: Transport.KAFKA,        // We are using Kafka transport
        options: {
          client: {
            brokers: ['localhost:9092'],    // Kafka broker URL
          },
          consumer: {
            groupId: KAFKA_CONSUMER_GROUP,  // Consumer group ID
          },
        },
      },
    ]),
  ],

  // Providers that this module will create
  controllers: [KafkaConsumer],
  providers: [KafkaProducer],

  // Export producer so other modules can emit Kafka messages
  exports: [KafkaProducer],
})
export class KafkaModule {}
