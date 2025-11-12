import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CityModule } from './city/city.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ ConfigModule.forRoot({
      isGlobal: true, // ✅ Makes .env accessible everywhere
    }),
    RabbitMQModule,
    CityModule, 
    MongooseModule.forRoot('mongodb://localhost/weather')
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
