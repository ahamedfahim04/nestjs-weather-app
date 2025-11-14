import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import 'dotenv/config';
import { KAFKA_CONSUMER_GROUP } from './infrastructure/kafka/kafka.constants';

async function bootstrap() {
  // Start the main HTTP app
  const app = await NestFactory.create(AppModule);

  // Connect the RabbitMQ microservice listener
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL as string],
      queue: process.env.RABBITMQ_QUEUE,
      queueOptions: {
        durable: true,
      },
    },
  });

    
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],    
      },
      consumer: {
        groupId: KAFKA_CONSUMER_GROUP,   
      },
    },
  });

  // 3️⃣ Start both HTTP app + microservice listener
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);

  console.log('🚀 App + RabbitMQ listener running on port 3000');
}
bootstrap();
