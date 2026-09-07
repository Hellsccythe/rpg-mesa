import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { SkillModel } from "./models/skill.model.js";
import { SkillNivelModel } from "./models/skill-nivel.model.js";
import { SkillOverrideModel } from "./models/skill-override.model.js";
import {
  SkillCategoriaModel,
  SkillNaturezaModel,
  SkillTipoDanoModel,
  SkillTipoModel,
} from "./models/lookups-skill.model.js";
import { SkillController } from "./skill.controller.js";
import { SkillService } from "./skill.service.js";

@Module({
  imports: [
    // PersonagemModel entra para conceder skill a um personagem e para conferir
    // que o personagem existe ao criar um ajuste.
    SequelizeModule.forFeature([
      SkillModel,
      SkillNivelModel,
      SkillOverrideModel,
      SkillNaturezaModel,
      SkillTipoModel,
      SkillCategoriaModel,
      SkillTipoDanoModel,
      PersonagemModel,
    ]),
  ],
  controllers: [SkillController],
  providers: [SkillService],
})
export class SkillsModule {}
