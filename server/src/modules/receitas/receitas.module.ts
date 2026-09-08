import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ReceitaIngredienteModel } from "./models/receita-ingrediente.model.js";
import { ReceitaModel } from "./models/receita.model.js";
import { ReceitasController } from "./receitas.controller.js";
import { ReceitasService } from "./receitas.service.js";

@Module({
  imports: [SequelizeModule.forFeature([ReceitaModel, ReceitaIngredienteModel])],
  controllers: [ReceitasController],
  providers: [ReceitasService],
  exports: [ReceitasService],
})
export class ReceitasModule {}
