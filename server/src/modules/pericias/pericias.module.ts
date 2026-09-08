import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PericiaModel } from "./models/pericia.model.js";
import { PericiasController } from "./pericias.controller.js";
import { PericiasService } from "./pericias.service.js";

@Module({
  imports: [SequelizeModule.forFeature([PericiaModel])],
  controllers: [PericiasController],
  providers: [PericiasService],
  // Exportado para o modulo de personagem: e ele quem grava data.pericias.
  exports: [PericiasService],
})
export class PericiasModule {}
