import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CampanhasModule } from "../campanhas/campanhas.module.js";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { LoreNoteAcessoModel } from "./models/lore-note-acesso.model.js";
import { LoreNoteModel } from "./models/lore-note.model.js";
import { LoreNotesController } from "./lore-notes.controller.js";
import { LoreNotesService } from "./lore-notes.service.js";

@Module({
  imports: [
    SequelizeModule.forFeature([LoreNoteModel, LoreNoteAcessoModel, PersonagemModel]),
    // O mundo de uma nota sem personagem (as rotas do mestre) é resolvido pelo módulo de campanhas.
    CampanhasModule,
  ],
  controllers: [LoreNotesController],
  providers: [LoreNotesService],
})
export class LoreNotesModule {}
