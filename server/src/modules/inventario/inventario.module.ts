import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { InventarioController } from "./inventario.controller.js";
import { InventarioService } from "./inventario.service.js";

@Module({
  imports: [SequelizeModule.forFeature([PersonagemModel])],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService],
})
export class InventarioModule {}
