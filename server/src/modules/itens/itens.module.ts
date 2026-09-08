import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CategoriaItemModel } from "./models/categoria-item.model.js";
import { ItemModel } from "./models/item.model.js";
import { ItensController } from "./itens.controller.js";
import { ItensService } from "./itens.service.js";

@Module({
  imports: [SequelizeModule.forFeature([ItemModel, CategoriaItemModel])],
  controllers: [ItensController],
  providers: [ItensService],
  exports: [ItensService],
})
export class ItensModule {}
