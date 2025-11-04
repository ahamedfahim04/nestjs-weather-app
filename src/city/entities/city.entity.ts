import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type CityDocument = City & Document;

@Schema({timestamps:true})
export class City {

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lon: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

}
export const CitySchema = SchemaFactory.createForClass(City);