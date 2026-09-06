import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";

/**
 * Exige que o usuário autenticado seja mestre (usuarios.tipo = 'gm').
 * Deve ser usado sempre DEPOIS do JwtAuthGuard na lista de @UseGuards(),
 * já que depende de requisicao.usuarioAutenticado já estar preenchido.
 */
@Injectable()
export class MasterGuard implements CanActivate {
  canActivate(contextoExecucao: ExecutionContext): boolean {
    const requisicao = contextoExecucao.switchToHttp().getRequest<Request>();
    if (requisicao.usuarioAutenticado?.tipo !== "gm") {
      throw new ForbiddenException("Acesso restrito ao mestre");
    }
    return true;
  }
}
