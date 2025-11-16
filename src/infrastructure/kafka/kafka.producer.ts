import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_CLIENT, KAFKA_TOPIC_WEATHER } from './kafka.constants';


export interface WeatherKafkaMessage {
  cityId: string;
  cityName: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  weather_description: string;
}

@Injectable()
export class KafkaProducer {
  constructor(
    @Inject(KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}


  async emitWeatherUpdate(data: WeatherKafkaMessage): Promise<void> {
    await this.kafkaClient.emit(KAFKA_TOPIC_WEATHER, {
      key: data.cityId,  
      value: data,
    });
  }


  async onModuleInit(): Promise<void> {
    await this.kafkaClient.connect();
  }
}
