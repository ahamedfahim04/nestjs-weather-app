import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from 'src/infrastructure/rabbitmq/rabbitmq.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City } from './entities/city.entity';

@Injectable()
export class WeatherConsumer implements OnModuleInit {
  private readonly logger = new Logger(WeatherConsumer.name);

  constructor(
    private readonly rabbitService: RabbitMQService,
    @InjectModel(City.name) private cityModel: Model<City>,
  ) {}

  async onModuleInit() {
    const channel = this.rabbitService.channel;

    // Ensure the queue exists
    await channel.assertQueue('weather_updates', { durable: true });

    this.logger.log('WeatherConsumer listening on queue: weather_updates');

    // Consume messages
    channel.consume('weather_updates', async (msg) => {
      if (!msg) return;

      const data = JSON.parse(msg.content.toString());
      this.logger.log(`Received weather update for: ${data.cityName}`);

      await this.cityModel.findByIdAndUpdate(data.cityId, {
        lastWeather: {
          temperature: data.temperature,
          humidity: data.humidity,
          description: data.weather_description,
          updatedAt: new Date(),
        },
      });

      channel.ack(msg); // Acknowledge message

      this.logger.log(`✔ Weather updated in DB for: ${data.cityName}`);
    });
  }
}
