import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { NpcModel } from "./models/npc.model.js";
import { NpcAcessoModel } from "./models/npc-acesso.model.js";
import { NpcsController } from "./npcs.controller.js";
import { NpcsService } from "./npcs.service.js";

@Module({
  imports: [SequelizeModule.forFeature([NpcModel, NpcAcessoModel, PersonagemModel])],
  controllers: [NpcsController],
  providers: [NpcsService],
})
export class NpcsModule {}
