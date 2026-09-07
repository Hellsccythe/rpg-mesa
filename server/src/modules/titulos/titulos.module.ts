import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { TituloModel } from "./models/titulo.model.js";
import { TitulosController } from "./titulos.controller.js";
import { TitulosService } from "./titulos.service.js";

@Module({
  // PersonagemModel entra para conceder título avulso a um personagem.
  imports: [SequelizeModule.forFeature([TituloModel, PersonagemModel])],
  controllers: [TitulosController],
  providers: [TitulosService],
})
export class TitulosModule {}
