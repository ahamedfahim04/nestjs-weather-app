import { Module } from '@nestjs/common';
import { CityModule } from './city/city.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './infrastructure/kafka/kafka.module';


@Module({
  imports: [ ConfigModule.forRoot({
      isGlobal: true, // ✅ Makes .env accessible everywhere
    }),
    RabbitMQModule,
    CityModule, 
    KafkaModule,
    MongooseModule.forRoot('mongodb://localhost/weather')
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
