import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CampanhaModel } from "./models/campanha.model.js";
import { CampanhaGmModel } from "./models/campanha-gm.model.js";
import { CampanhasController } from "./campanhas.controller.js";
import { CampanhasService } from "./campanhas.service.js";

@Module({
  imports: [SequelizeModule.forFeature([CampanhaModel, CampanhaGmModel])],
  controllers: [CampanhasController],
  providers: [CampanhasService],
  // Outros módulos resolvem o mundo ativo por aqui (lore-notes hoje; os catálogos na fase 2).
  exports: [CampanhasService],
})
export class CampanhasModule {}
