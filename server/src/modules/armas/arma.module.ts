import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { EquipamentoModel } from "./models/equipamento.model.js";
import {
  CategoriaEquipamentoModel,
  ClasseEquipamentoModel,
  PropriedadeEquipamentoModel,
  TipoEquipamentoModel,
} from "./models/lookups-equipamento.model.js";
import { ArmaController } from "./arma.controller.js";
import { ArmaService } from "./arma.service.js";

@Module({
  imports: [
    SequelizeModule.forFeature([
      EquipamentoModel,
      CategoriaEquipamentoModel,
      ClasseEquipamentoModel,
      TipoEquipamentoModel,
      PropriedadeEquipamentoModel,
    ]),
  ],
  controllers: [ArmaController],
  providers: [ArmaService],
})
export class ArmasModule {}
