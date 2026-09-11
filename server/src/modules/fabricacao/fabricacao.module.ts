import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { PericiaModel } from "../pericias/models/pericia.model.js";
import { ReceitasModule } from "../receitas/receitas.module.js";
import { InventarioModule } from "../inventario/inventario.module.js";
import { FabricacaoModel } from "./models/fabricacao.model.js";
import { FabricacaoController } from "./fabricacao.controller.js";
import { FabricacaoService } from "./fabricacao.service.js";

@Module({
  imports: [
    SequelizeModule.forFeature([FabricacaoModel, PersonagemModel, PericiaModel]),
    ReceitasModule,
    InventarioModule,
  ],
  controllers: [FabricacaoController],
  providers: [FabricacaoService],
})
export class FabricacaoModule {}
