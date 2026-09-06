import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "./models/personagem.model.js";
import { PersonagensOnboardingController } from "./personagens-onboarding.controller.js";
import { PersonagensOnboardingService } from "./personagens-onboarding.service.js";

@Module({
  imports: [SequelizeModule.forFeature([PersonagemModel])],
  controllers: [PersonagensOnboardingController],
  providers: [PersonagensOnboardingService],
})
export class PersonagensOnboardingModule {}
