import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CampanhasModule } from "../campanhas/campanhas.module.js";
import { RacaModel } from "./models/raca.model.js";
import { RacaController } from "./raca.controller.js";
import { RacaService } from "./raca.service.js";

@Module({
  imports: [SequelizeModule.forFeature([RacaModel]), CampanhasModule],
  controllers: [RacaController],
  providers: [RacaService],
})
export class RacasModule {}
