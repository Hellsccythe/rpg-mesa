import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { IndoleModel } from "./models/indole.model.js";
import { IndoleController } from "./indole.controller.js";
import { IndoleService } from "./indole.service.js";

@Module({
  imports: [SequelizeModule.forFeature([IndoleModel])],
  controllers: [IndoleController],
  providers: [IndoleService],
})
export class IndoleModule {}
