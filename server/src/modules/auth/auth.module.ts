import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsuarioModel } from "../usuarios/models/usuario.model.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

@Module({
  imports: [SequelizeModule.forFeature([UsuarioModel])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
