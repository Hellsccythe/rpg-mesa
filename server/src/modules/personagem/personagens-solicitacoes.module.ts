import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "./models/personagem.model.js";
import { PersonagensSolicitacoesController } from "./personagens-solicitacoes.controller.js";
import { PersonagensSolicitacoesService } from "./personagens-solicitacoes.service.js";

@Module({
  imports: [SequelizeModule.forFeature([PersonagemModel])],
  controllers: [PersonagensSolicitacoesController],
  providers: [PersonagensSolicitacoesService],
})
export class PersonagensSolicitacoesModule {}
