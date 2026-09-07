import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsuarioModel } from "./models/usuario.model.js";
import { UsuariosController } from "./usuarios.controller.js";
import { UsuariosService } from "./usuarios.service.js";

@Module({
  imports: [SequelizeModule.forFeature([UsuarioModel])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  // Exportado porque o módulo de personagens vai precisar criar e remover
  // contas ao criar/excluir personagem.
  exports: [UsuariosService],
})
export class UsuariosModule {}
