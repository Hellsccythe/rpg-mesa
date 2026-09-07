import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { PlayerTelaModel } from "./models/player-tela.model.js";
import { PlayerTelasController } from "./player-telas.controller.js";
import { PlayerTelasService } from "./player-telas.service.js";

@Module({
  imports: [SequelizeModule.forFeature([PlayerTelaModel, PersonagemModel])],
  controllers: [PlayerTelasController],
  providers: [PlayerTelasService],
})
export class PlayerTelasModule {}
