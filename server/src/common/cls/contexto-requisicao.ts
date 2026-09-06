import { AsyncLocalStorage } from "node:async_hooks";
import type { UsuarioAutenticado } from "./usuario-autenticado.interface.js";

/**
 * Substitui um pacote de CLS externo por AsyncLocalStorage nativo do Node.
 * Cada requisição HTTP ganha seu próprio contexto (armazenado aqui pelo
 * ContextoRequisicaoMiddleware), acessível de qualquer lugar do código
 * durante aquela requisição — inclusive de dentro dos hooks do Sequelize,
 * que não têm acesso direto ao objeto de request do Express.
 */
interface ContextoRequisicao {
  usuarioAutenticado?: UsuarioAutenticado;
}

export const armazenamentoContextoRequisicao = new AsyncLocalStorage<ContextoRequisicao>();

export function obterUsuarioAutenticadoDoContexto(): UsuarioAutenticado | undefined {
  return armazenamentoContextoRequisicao.getStore()?.usuarioAutenticado;
}

export function definirUsuarioAutenticadoNoContexto(usuarioAutenticado: UsuarioAutenticado): void {
  const contextoAtual = armazenamentoContextoRequisicao.getStore();
  if (contextoAtual) {
    contextoAtual.usuarioAutenticado = usuarioAutenticado;
  }
}
