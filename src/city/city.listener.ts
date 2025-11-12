import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City } from './entities/city.entity';

@Controller()
export class CityListener {
  private readonly logger = new Logger(CityListener.name);

  constructor(@InjectModel(City.name) private cityModel: Model<City>) {}

  @EventPattern('weather_update')
  async handleWeatherUpdate(@Payload() data: any) {
    this.logger.log(`📩 Received weather update for ${data.cityName}`);

    await this.cityModel.findByIdAndUpdate(data.cityId, {
      lastWeather: {
        temperature: data.temperature,
        humidity: data.humidity,
        description: data.weather_description,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`✅ Weather data saved for ${data.cityName}`);
  }
}
