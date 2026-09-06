import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "./models/personagem.model.js";
import { PersonagensConsultaController } from "./personagens-consulta.controller.js";
import { PersonagensConsultaService } from "./personagens-consulta.service.js";

@Module({
  imports: [SequelizeModule.forFeature([PersonagemModel])],
  controllers: [PersonagensConsultaController],
  providers: [PersonagensConsultaService],
  exports: [PersonagensConsultaService],
})
export class PersonagensConsultaModule {}
