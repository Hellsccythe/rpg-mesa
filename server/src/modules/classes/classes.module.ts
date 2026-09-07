import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { LevelProgressionModule } from "../level-progression/level-progression.module.js";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { ClasseModel } from "./models/classe.model.js";
import { ClasseSecretaReveladaModel } from "./models/classe-secreta-revelada.model.js";
import { ProgressaoClasseModel } from "./models/progressao-classe.model.js";
import { ClassesController } from "./classes.controller.js";
import { ClassesService } from "./classes.service.js";

@Module({
  imports: [
    // PersonagemModel entra aqui só para conferir dono e status do personagem
    // ao revelar uma classe secreta e ao listar as classes de um jogador.
    SequelizeModule.forFeature([
      ClasseModel,
      ProgressaoClasseModel,
      ClasseSecretaReveladaModel,
      PersonagemModel,
    ]),
    LevelProgressionModule,
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
