import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "./models/personagem.model.js";
import { PersonagensMestreController } from "./personagens-mestre.controller.js";
import { PersonagensMestreService } from "./personagens-mestre.service.js";

@Module({
  imports: [SequelizeModule.forFeature([PersonagemModel])],
  controllers: [PersonagensMestreController],
  providers: [PersonagensMestreService],
})
export class PersonagensMestreModule {}
