import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CityService, CityWeatherResponse } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { City } from './entities/city.entity';
import { UpdateCityDto } from './dto/update-city.dto';


@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  async createCity(@Body() data: CreateCityDto): Promise<City> {
    return this.cityService.create(data);
  }

  @Get()
  async getAllCity(): Promise<City[]> {
    return this.cityService.findAll()
  }

  @Get(':id')
  async getCityById(@Param('id') id: string): Promise<CityWeatherResponse> {
    return this.cityService.findOne(id);
  }

  @Put(':id')
  async updateCity(
    @Param('id') id: string,
    @Body() data: UpdateCityDto
  ): Promise<City | null> {
    return this.cityService.update(id, data)
  }

  @Delete(':id')
  async removeCity(@Param('id') id:string ): Promise<City | null> {
    return this.cityService.remove(id);
  }
}
