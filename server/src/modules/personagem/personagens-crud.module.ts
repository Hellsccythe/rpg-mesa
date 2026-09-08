import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "./models/personagem.model.js";
import { PersonagensCrudController } from "./personagens-crud.controller.js";
import { PersonagensCrudService } from "./personagens-crud.service.js";

@Module({
  imports: [SequelizeModule.forFeature([PersonagemModel])],
  controllers: [PersonagensCrudController],
  providers: [PersonagensCrudService],
})
export class PersonagensCrudModule {}
