import { ForbiddenException } from "@nestjs/common";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import type { PersonagemModel } from "./models/personagem.model.js";

/**
 * Um personagem só pode ser lido ou alterado pelo próprio dono ou pelo mestre.
 *
 * Antes isto era decidido comparando o email do token com a lista da env var
 * MASTER_EMAILS, o que espalhava a definição de "quem é mestre" por dezenas de
 * arquivos e dependia de uma variável de ambiente estar certa em produção.
 * Agora vem de usuarios.tipo, que já viaja dentro do JWT.
 */
export function garantirAcessoAoPersonagem(
  personagem: PersonagemModel,
  usuario: UsuarioAutenticado,
): void {
  if (usuario.tipo === "gm") return;
  if (personagem.userId === usuario.usuarioId) return;

  throw new ForbiddenException("Sem permissão para acessar este personagem.");
}
