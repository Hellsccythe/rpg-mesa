import type { Model, ModelStatic } from "sequelize";
import { obterUsuarioAutenticadoDoContexto } from "../cls/contexto-requisicao.js";

/**
 * Hooks globais do Sequelize (registrados uma vez na conexão) que preenchem
 * automaticamente created_by/updated_by/deleted_by com o email do usuário
 * autenticado na requisição atual — sem precisar passar isso manualmente em
 * cada service. O usuário atual fica disponível via AsyncLocalStorage
 * (contexto por requisição), preenchido pelo JwtAuthGuard assim que o
 * token é validado.
 */

function obterEmailUsuarioAutenticado(): string {
  return obterUsuarioAutenticadoDoContexto()?.email ?? "sistema";
}

function modeloPossuiAtributo(instancia: Model, nomeAtributo: string): boolean {
  const construtor = instancia.constructor as ModelStatic<Model>;
  return nomeAtributo in construtor.getAttributes();
}

export function preencherCriadoPorEAtualizadoPor(instancia: Model): void {
  const emailUsuarioAtual = obterEmailUsuarioAutenticado();
  if (modeloPossuiAtributo(instancia, "createdBy")) {
    instancia.set("createdBy", emailUsuarioAtual);
  }
  if (modeloPossuiAtributo(instancia, "updatedBy")) {
    instancia.set("updatedBy", emailUsuarioAtual);
  }
}

export function preencherAtualizadoPor(instancia: Model): void {
  if (modeloPossuiAtributo(instancia, "updatedBy")) {
    instancia.set("updatedBy", obterEmailUsuarioAutenticado());
  }
}

export function preencherDeletadoPor(instancia: Model): void {
  if (modeloPossuiAtributo(instancia, "deletedBy")) {
    instancia.set("deletedBy", obterEmailUsuarioAutenticado());
  }
}
