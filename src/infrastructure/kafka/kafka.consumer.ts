import { Controller, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Model } from 'mongoose';

import { KAFKA_TOPIC_WEATHER } from 'src/infrastructure/kafka/kafka.constants';
import { City, CityDocument } from 'src/city/entities/city.entity';
import { WeatherUpdateDto } from 'src/city/dto/weather-update.dto';

@Controller()
export class KafkaConsumer {
  private readonly logger = new Logger(KafkaConsumer.name);

  constructor(@InjectModel(City.name) private cityModel: Model<CityDocument>) {}

  @MessagePattern(KAFKA_TOPIC_WEATHER)   // ⬅️ Using the constant
  async handleKafkaWeatherUpdate(@Payload() data: WeatherUpdateDto) {
    this.logger.log(`🔥 Kafka Received weather update for ${data.cityName}`);

    await this.cityModel.findByIdAndUpdate(data.cityId, {
      lastWeather: {
        temperature: data.temperature,
        humidity: data.humidity,
        description: data.weather_description,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`✅ Kafka Weather data saved for ${data.cityName}`);
  }
}
