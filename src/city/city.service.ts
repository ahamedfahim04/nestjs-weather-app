import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { City } from './entities/city.entity';
import { Model } from 'mongoose';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import axios from 'axios';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CityService {
  private readonly apiKey =  process.env.OPENWEATHER_API_KEY;

  constructor(@InjectModel(City.name) private cityModel: Model<City>,
   @Inject('WEATHER_SERVICE') private readonly weatherClient: ClientProxy,) {}

  async create(data: CreateCityDto): Promise<City> {
    const newCity = await new this.cityModel(data);
    return newCity.save();
  }

  async findAll(): Promise<City[]> {
    return this.cityModel.find().exec();
  }

  async findOne(id: string): Promise<any> {
  try {
    
    const city = await this.cityModel.findById(id).exec();
    if (!city) {
      throw new Error('City not found');
    }

    //api url
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${this.apiKey}&units=metric`;

    // the api url data is stored into a const 'data'
    const { data }: any = await axios.get(url);

    // Extract the data we need from the api
    const weather = {
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: data.wind.speed,
      weather_description: data.weather[0].description,
    };

    // ✅ Send weather data to RabbitMQ
    this.weatherClient.emit('weather_update', {
      cityId: city._id,
      cityName: city.city,
      ...weather,
    });

    //  Combine weather data and return
    return {
      _id: city._id,
      city: city.city,
      lat: city.lat,
      lon: city.lon,
      createdAt: city.createdAt,
      weather,
    };
  } catch (error) {
    console.error(' Error ', error.message || error);
    throw error;
  }
}


  async update(id: string, data: UpdateCityDto): Promise<City | null> {
    return await this.cityModel.findByIdAndUpdate(id, data, {new: true});
  }

  async remove(id: string): Promise<City | null> {
    return this.cityModel.findByIdAndDelete(id);
  }


}
