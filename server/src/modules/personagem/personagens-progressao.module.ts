import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "./models/personagem.model.js";
import { PersonagensProgressaoController } from "./personagens-progressao.controller.js";
import { PersonagensProgressaoService } from "./personagens-progressao.service.js";

@Module({
  imports: [SequelizeModule.forFeature([PersonagemModel])],
  controllers: [PersonagensProgressaoController],
  providers: [PersonagensProgressaoService],
})
export class PersonagensProgressaoModule {}
