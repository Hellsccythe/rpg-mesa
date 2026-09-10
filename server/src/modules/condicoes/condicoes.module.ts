import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CondicaoModel } from "./models/condicao.model.js";
import { CondicoesController } from "./condicoes.controller.js";
import { CondicoesService } from "./condicoes.service.js";

@Module({
  imports: [SequelizeModule.forFeature([CondicaoModel])],
  controllers: [CondicoesController],
  providers: [CondicoesService],
  exports: [CondicoesService],
})
export class CondicoesModule {}
