import type { NextFunction, Request, Response } from "express";
import { armazenamentoContextoRequisicao } from "./contexto-requisicao.js";

/** Abre um contexto novo (vazio) de AsyncLocalStorage pra cada requisição. */
export function contextoRequisicaoMiddleware(
  _requisicao: Request,
  _resposta: Response,
  proximo: NextFunction,
): void {
  armazenamentoContextoRequisicao.run({}, proximo);
}
