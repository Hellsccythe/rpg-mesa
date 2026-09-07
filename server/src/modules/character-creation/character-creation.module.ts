import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { UsuarioModel } from "../usuarios/models/usuario.model.js";
import { UsuariosModule } from "../usuarios/usuarios.module.js";
import { SolicitacaoCriacaoModel } from "./models/solicitacao-criacao.model.js";
import { CharacterCreationController } from "./character-creation.controller.js";
import { CharacterCreationService } from "./character-creation.service.js";

@Module({
  imports: [
    SequelizeModule.forFeature([SolicitacaoCriacaoModel, PersonagemModel, UsuarioModel]),
    // UsuariosService cria a conta do jogador ao aprovar a solicitação.
    UsuariosModule,
  ],
  controllers: [CharacterCreationController],
  providers: [CharacterCreationService],
})
export class CharacterCreationModule {}
