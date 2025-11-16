import { Module } from '@nestjs/common';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { City, CitySchema } from './entities/city.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CityListener } from './city.listener';
import { RabbitMQModule } from 'src/infrastructure/rabbitmq/rabbitmq.module';
import { KafkaModule } from 'src/infrastructure/kafka/kafka.module';


@Module({
  imports: [ KafkaModule,  RabbitMQModule, MongooseModule.forFeature([{ name: City.name, schema: CitySchema }])],
  controllers: [CityController, CityListener],
  providers: [CityService]
})
export class CityModule {}
