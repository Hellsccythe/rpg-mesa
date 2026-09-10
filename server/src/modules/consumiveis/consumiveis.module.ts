import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CategoriaConsumivelModel } from "./models/categoria-consumivel.model.js";
import { ConsumivelModel } from "./models/consumivel.model.js";
import { ConsumivelCondicaoModel } from "./models/consumivel-condicao.model.js";
import { ConsumiveisController } from "./consumiveis.controller.js";
import { ConsumiveisService } from "./consumiveis.service.js";

@Module({
  imports: [
    SequelizeModule.forFeature([
      ConsumivelModel,
      CategoriaConsumivelModel,
      ConsumivelCondicaoModel,
    ]),
  ],
  controllers: [ConsumiveisController],
  providers: [ConsumiveisService],
  exports: [ConsumiveisService],
})
export class ConsumiveisModule {}
