import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
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
  /** Devolvido explicitamente para o frontend não precisar decodificar o JWT. */
  usuario: {
    id: number;
    email: string;
    username: string | null;
  };
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
      usuario: {
        id: usuario.id,
        email: usuario.realEmail,
        username: usuario.username,
      },
    };
  }

  /**
   * Quem está logado, com a obrigação de trocar a senha lida do banco — e não
   * do token, que foi emitido antes de o mestre eventualmente resetá-la.
   */
  async quemSouEu(usuario: UsuarioAutenticado) {
    const registro = await this.modeloUsuario.findByPk(usuario.usuarioId, {
      attributes: ["requiresPasswordChange"],
    });
    return { ...usuario, precisaTrocarSenha: registro?.requiresPasswordChange === true };
  }

  /**
   * Troca da própria senha pelo usuário logado. Substitui o
   * supabase.auth.updateUser({ password }) que as telas usavam, e é o que
   * encerra a obrigação criada pelo "Reset Padrão" do mestre.
   */
  async trocarPropriaSenha(usuarioId: number, novaSenha: string): Promise<void> {
    const usuario = await this.modeloUsuario.findByPk(usuarioId);
    if (!usuario) {
      throw new NotFoundException("Usuário não encontrado");
    }

    usuario.passwordHash = await bcrypt.hash(novaSenha, 10);
    usuario.requiresPasswordChange = false;
    await usuario.save();
  }
}
