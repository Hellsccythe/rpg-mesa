import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CampanhasModule } from "../campanhas/campanhas.module.js";
import { PassadoModel } from "./models/passado.model.js";
import { PassadosController } from "./passados.controller.js";
import { PassadosService } from "./passados.service.js";

@Module({
  imports: [SequelizeModule.forFeature([PassadoModel]), CampanhasModule],
  controllers: [PassadosController],
  providers: [PassadosService],
})
export class PassadosModule {}
