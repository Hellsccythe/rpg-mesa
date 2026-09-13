import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { SequelizeModule } from "@nestjs/sequelize";
import { CampanhaModel } from "./models/campanha.model.js";
import { CampanhaGmModel } from "./models/campanha-gm.model.js";
import { CampanhaAtivaInterceptor } from "./campanha-ativa.interceptor.js";
import { CampanhasController } from "./campanhas.controller.js";
import { CampanhasService } from "./campanhas.service.js";

@Module({
  imports: [SequelizeModule.forFeature([CampanhaModel, CampanhaGmModel])],
  controllers: [CampanhasController],
  providers: [
    CampanhasService,
    // Global: toda requisição passa por ele e ganha o mundo do header X-Campanha no contexto.
    { provide: APP_INTERCEPTOR, useClass: CampanhaAtivaInterceptor },
  ],
  // Outros módulos resolvem o mundo ativo por aqui (lore-notes hoje; os catálogos na fase 2).
  exports: [CampanhasService],
})
export class CampanhasModule {}
