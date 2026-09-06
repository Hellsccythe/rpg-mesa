import { Body, Controller, Post } from "@nestjs/common";
import { AuthService, type RespostaLogin } from "./auth.service.js";
import { LoginDto } from "./login.dto.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly servicoAuth: AuthService) {}

  @Post("login")
  async login(@Body() dadosLogin: LoginDto): Promise<RespostaLogin> {
    return this.servicoAuth.login(dadosLogin.identificador, dadosLogin.senha);
  }
}
