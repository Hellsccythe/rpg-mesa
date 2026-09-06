import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CityMapModel } from "./models/city-map.model.js";
import { CityMapsController } from "./city-maps.controller.js";
import { CityMapsService } from "./city-maps.service.js";

@Module({
  imports: [SequelizeModule.forFeature([CityMapModel])],
  controllers: [CityMapsController],
  providers: [CityMapsService],
})
export class CityMapsModule {}
