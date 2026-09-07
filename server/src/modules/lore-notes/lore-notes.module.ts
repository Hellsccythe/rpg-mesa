import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { LoreNoteModel } from "./models/lore-note.model.js";
import { LoreNotesController } from "./lore-notes.controller.js";
import { LoreNotesService } from "./lore-notes.service.js";

@Module({
  imports: [SequelizeModule.forFeature([LoreNoteModel, PersonagemModel])],
  controllers: [LoreNotesController],
  providers: [LoreNotesService],
})
export class LoreNotesModule {}
