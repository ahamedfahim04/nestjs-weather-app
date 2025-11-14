
import { IsString, IsNumber, IsDate, IsOptional } from 'class-validator';

export class WeatherUpdateDto {
  @IsString()
  cityId: string;

  @IsString()
  cityName: string;

  @IsNumber()
  temperature: number;

  @IsNumber()
  humidity: number;

  @IsString()
  weather_description: string;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}
