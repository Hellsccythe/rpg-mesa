import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "./models/personagem.model.js";
import { PericiasModule } from "../pericias/pericias.module.js";
import { PersonagensProgressaoController } from "./personagens-progressao.controller.js";
import { PersonagensProgressaoService } from "./personagens-progressao.service.js";

@Module({
  imports: [SequelizeModule.forFeature([PersonagemModel]), PericiasModule],
  controllers: [PersonagensProgressaoController],
  providers: [PersonagensProgressaoService],
})
export class PersonagensProgressaoModule {}
