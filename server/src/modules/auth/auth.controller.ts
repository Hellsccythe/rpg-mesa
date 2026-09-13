import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { UsuarioLogado } from "../../common/auth/usuario-logado.decorator.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { AuthService, type RespostaLogin } from "./auth.service.js";
import { LoginDto, TrocarSenhaDto } from "./login.dto.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly servicoAuth: AuthService) {}

  @Post("login")
  async login(@Body() dadosLogin: LoginDto): Promise<RespostaLogin> {
    return this.servicoAuth.login(dadosLogin.identificador, dadosLogin.senha);
  }

  /**
   * Confirma que o token ainda vale e devolve quem está logado. O frontend
   * usa isto ao abrir o app para restaurar a sessão sem precisar de senha.
   */
  @UseGuards(JwtAuthGuard)
  @Get("eu")
  quemSouEu(@UsuarioLogado() usuario: UsuarioAutenticado) {
    return this.servicoAuth.quemSouEu(usuario);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("trocar-senha")
  async trocarSenha(
    @UsuarioLogado() usuario: UsuarioAutenticado,
    @Body() dadosTroca: TrocarSenhaDto,
  ) {
    await this.servicoAuth.trocarPropriaSenha(usuario.usuarioId, dadosTroca.novaSenha);
    return { success: true };
  }
}
