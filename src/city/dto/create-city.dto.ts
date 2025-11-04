import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCityDto {
  
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  lat: string;

  @IsNumber()
  @IsNotEmpty()
  lon: string;
}