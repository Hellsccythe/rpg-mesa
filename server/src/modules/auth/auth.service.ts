import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { JwtService } from "@nestjs/jwt";
import { Op } from "sequelize";
import * as bcrypt from "bcryptjs";
import { UsuarioModel } from "../usuarios/models/usuario.model.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";

export interface RespostaLogin {
  tokenAcesso: string;
  tipo: "gm" | "player";
  precisaTrocarSenha: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UsuarioModel)
    private readonly modeloUsuario: typeof UsuarioModel,
    private readonly servicoJwt: JwtService,
  ) {}

  async login(identificador: string, senha: string): Promise<RespostaLogin> {
    const identificadorNormalizado = identificador.trim().toLowerCase();

    const usuario = await this.modeloUsuario.findOne({
      where: {
        [Op.or]: [
          { username: identificadorNormalizado },
          { realEmail: identificadorNormalizado },
        ],
      },
    });

    // passwordHash nulo significa pré-registro: o mestre liberou o email, mas
    // a conta só passa a existir quando o jogador cria o personagem.
    if (!usuario || !usuario.ativo || !usuario.passwordHash) {
      throw new UnauthorizedException("Usuário ou senha inválidos");
    }

    const senhaValida = await bcrypt.compare(senha, usuario.passwordHash);
    if (!senhaValida) {
      throw new UnauthorizedException("Usuário ou senha inválidos");
    }

    const usuarioAutenticado: UsuarioAutenticado = {
      usuarioId: usuario.id,
      email: usuario.realEmail,
      tipo: usuario.tipo,
    };

    return {
      tokenAcesso: this.servicoJwt.sign(usuarioAutenticado),
      tipo: usuario.tipo,
      precisaTrocarSenha: usuario.requiresPasswordChange,
    };
  }
}
