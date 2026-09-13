import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CampanhasModule } from "../campanhas/campanhas.module.js";
import { GodModel } from "./models/god.model.js";
import { GodController } from "./god.controller.js";
import { GodService } from "./god.service.js";

@Module({
  imports: [SequelizeModule.forFeature([GodModel]), CampanhasModule],
  controllers: [GodController],
  providers: [GodService],
})
export class GodsModule {}
