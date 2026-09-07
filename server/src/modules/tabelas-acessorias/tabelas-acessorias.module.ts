import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsoEquipamentoModel } from "./models/uso-equipamento.model.js";
import { CategoriaArmaModel } from "./models/categoria-arma.model.js";
import { CategoriaArmaduraModel } from "./models/categoria-armadura.model.js";
import { CategoriaVariadosModel } from "./models/categoria-variados.model.js";
import { PropriedadeArmaModel } from "./models/propriedade-arma.model.js";
import { ClasseArmaModel } from "./models/classe-arma.model.js";
import { PropriedadeArmaduraModel } from "./models/propriedade-armadura.model.js";
import { ClasseArmaduraModel } from "./models/classe-armadura.model.js";
import { PropriedadeVariadosModel } from "./models/propriedade-variados.model.js";
import { ClasseVariadosModel } from "./models/classe-variados.model.js";
import { TabelasAcessoriasController } from "./tabelas-acessorias.controller.js";
import { TabelasAcessoriasService } from "./tabelas-acessorias.service.js";

@Module({
  imports: [
    SequelizeModule.forFeature([
      UsoEquipamentoModel,
      CategoriaArmaModel,
      CategoriaArmaduraModel,
      CategoriaVariadosModel,
      PropriedadeArmaModel,
      ClasseArmaModel,
      PropriedadeArmaduraModel,
      ClasseArmaduraModel,
      PropriedadeVariadosModel,
      ClasseVariadosModel,
    ]),
  ],
  controllers: [TabelasAcessoriasController],
  providers: [TabelasAcessoriasService],
})
export class TabelasAcessoriasModule {}
