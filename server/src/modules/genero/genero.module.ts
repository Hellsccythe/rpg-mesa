import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { GeneroModel } from "./models/genero.model.js";
import { GeneroController } from "./genero.controller.js";
import { GeneroService } from "./genero.service.js";

@Module({
  imports: [SequelizeModule.forFeature([GeneroModel])],
  controllers: [GeneroController],
  providers: [GeneroService],
})
export class GeneroModule {}
