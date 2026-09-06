import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { definirUsuarioAutenticadoNoContexto } from "../cls/contexto-requisicao.js";
import type { UsuarioAutenticado } from "../cls/usuario-autenticado.interface.js";

function extrairTokenBearer(cabecalhoAutorizacao?: string): string | undefined {
  if (!cabecalhoAutorizacao) return undefined;
  const [esquema, token] = cabecalhoAutorizacao.split(" ");
  if (esquema?.toLowerCase() !== "bearer") return undefined;
  return token;
}

/**
 * Valida o JWT emitido pelo nosso próprio /auth/login (substitui o
 * supabase.auth.getUser() de antes). Além de proteger a rota, guarda o
 * usuário autenticado no contexto da requisição (AsyncLocalStorage) — é
 * isso que os hooks de auditoria do Sequelize leem pra preencher
 * created_by/updated_by automaticamente, sem precisar passar o usuário
 * manualmente em cada service.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly servicoJwt: JwtService) {}

  canActivate(contextoExecucao: ExecutionContext): boolean {
    const requisicao = contextoExecucao.switchToHttp().getRequest<Request>();
    const token = extrairTokenBearer(requisicao.headers.authorization);

    if (!token) {
      throw new UnauthorizedException("Usuário não autenticado");
    }

    try {
      const usuarioAutenticado = this.servicoJwt.verify<UsuarioAutenticado>(token);
      definirUsuarioAutenticadoNoContexto(usuarioAutenticado);
      requisicao.usuarioAutenticado = usuarioAutenticado;
      return true;
    } catch {
      throw new UnauthorizedException("Token inválido ou expirado");
    }
  }
}
