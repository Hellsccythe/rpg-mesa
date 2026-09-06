import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { LevelProgressionModel } from "./models/level-progression.model.js";
import { LevelProgressionController } from "./level-progression.controller.js";
import { LevelProgressionService } from "./level-progression.service.js";

@Module({
  imports: [SequelizeModule.forFeature([LevelProgressionModel])],
  controllers: [LevelProgressionController],
  providers: [LevelProgressionService],
  exports: [LevelProgressionService],
})
export class LevelProgressionModule {}
