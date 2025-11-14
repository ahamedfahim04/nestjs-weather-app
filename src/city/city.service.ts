import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { City, CityDocument } from './entities/city.entity';
import { Model } from 'mongoose';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import axios from 'axios';
import { ClientProxy } from '@nestjs/microservices';
import { KafkaProducer } from 'src/infrastructure/kafka/kafka.producer';

type OpenWeatherResponse = {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  weather: { description: string }[];
};

type CityWeatherResponse = {
  _id: string;
  city: string;
  lat: number;
  lon: number;
  createdAt?: Date | string;
  weather: {
    temperature: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    weather_description: string;
  };
};

@Injectable()
export class CityService {
  private readonly apiKey =  process.env.OPENWEATHER_API_KEY;

  constructor(@InjectModel(City.name) private cityModel: Model<CityDocument>,
   @Inject('WEATHER_SERVICE') private readonly weatherClient: ClientProxy,
   private readonly kafkaProducer: KafkaProducer,
  ) {}

  async create(data: CreateCityDto): Promise<City> {
    const newCity = await new this.cityModel(data);
    return newCity.save();
  }

  async findAll(): Promise<City[]> {
    return this.cityModel.find().exec();
  }

  

  
  async findOne(id: string): Promise<CityWeatherResponse> {
    const city = await this.getCityById(id);
    const data = await this.fetchWeatherData(city.lat, city.lon);

    const weather = {
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: data.wind.speed,
      weather_description: data.weather[0].description,
    };

    
    this.weatherClient.emit('weather_update', {
      cityId: city._id,
      cityName: city.city,
      ...weather,
    });

    await this.kafkaProducer.emitWeatherUpdate({
      cityId: city._id as string,
      cityName: city.city,
      ...weather,
    });

    
    return {
      _id: city._id as string,
      city: city.city,
      lat: city.lat,
      lon: city.lon,
      createdAt: city.createdAt,
      weather,
    };
  }

  
  private async getCityById(id: string): Promise<CityDocument> {
    const city = await this.cityModel.findById(id).exec();
    if (!city) throw new Error('City not found');
    return city;
  }

  
  private async fetchWeatherData(lat: number, lon: number): Promise<OpenWeatherResponse> {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    const { data } = await axios.get<OpenWeatherResponse>(url);
    return data;
  }




  async update(id: string, data: UpdateCityDto): Promise<City | null> {
    return await this.cityModel.findByIdAndUpdate(id, data, {new: true});
  }

  async remove(id: string): Promise<City | null> {
    return this.cityModel.findByIdAndDelete(id);
  }


}
