import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import 'dotenv/config';

console.log('🐇 RabbitMQ URL:', process.env.RABBITMQ_URL);
console.log('🐇 RabbitMQ Queue:', process.env.RABBITMQ_QUEUE);
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'WEATHER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL as string],
          queue: process.env.RABBITMQ_QUEUE,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule {}
