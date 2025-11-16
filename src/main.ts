import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import 'dotenv/config';
import { KAFKA_CONSUMER_GROUP } from './infrastructure/kafka/kafka.constants';

async function bootstrap() {
  // Start the main HTTP app
  const app = await NestFactory.create(AppModule);
    
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


  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);

  console.log('🚀 App + RabbitMQ listener running on port 3000');
}
bootstrap();
