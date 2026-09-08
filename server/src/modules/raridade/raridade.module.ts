import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { RaridadeModel } from "./models/raridade.model.js";
import { RaridadeController } from "./raridade.controller.js";
import { RaridadeService } from "./raridade.service.js";

@Module({
  imports: [SequelizeModule.forFeature([RaridadeModel])],
  controllers: [RaridadeController],
  providers: [RaridadeService],
  exports: [RaridadeService],
})
export class RaridadeModule {}
