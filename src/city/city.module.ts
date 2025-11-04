import { Module } from '@nestjs/common';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { City, CitySchema } from './entities/city.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: City.name, schema: CitySchema }])],
  controllers: [CityController],
  providers: [CityService]
})
export class CityModule {}
