import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

/**
 * Injeta o usuário autenticado (extraído do JWT pelo JwtAuthGuard) direto
 * como parâmetro do controller. Exemplo: metodo(@UsuarioLogado() usuario) {}
 */
export const UsuarioLogado = createParamDecorator(
  (_dadoIgnorado: unknown, contextoExecucao: ExecutionContext) => {
    const requisicao = contextoExecucao.switchToHttp().getRequest<Request>();
    return requisicao.usuarioAutenticado;
  },
);
