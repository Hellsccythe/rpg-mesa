// server/src/modules/personagem/personagens.controller.ts
import { personagensService } from "./personagens.service.js";
import type {
  SalvarPersonagemDto,
  EditarPersonagemDto,
  ListarPersonagemDto,
} from "./personagens.dto.js";

const layoutPadrao = {
  titulo: "Caminho Sem Volta",
  subtitulo: "Escolha seu destino ou crie um novo herói",
  backgroundImage: "/login-bg.jpg",
};

export const personagensController = {
  /**
   * Retorna a configuração de layout + lista pública de personagens.
   * Não requer autenticação — qualquer visitante pode carregar a página.
   */
  async paginaInicial() {
    const personagens = await personagensService.listarTodosPublico();
    return { layout: layoutPadrao, personagens };
  },

  /**
   * Lista personagens do usuário logado (para tabelas com filtros/reload).
   */
  async listarMeus(filtro: ListarPersonagemDto = {}, accessToken?: string) {
    return personagensService.listarMeusPersonagens(filtro, accessToken);
  },

  /**
   * Retorna um personagem específico do usuário logado.
   */
  async obterMeu(characterId: string, accessToken?: string) {
    if (!characterId) throw new Error("ID do personagem é obrigatório");
    return personagensService.obterMeuPersonagemPorId(characterId, accessToken);
  },

  /**
   * Salva um novo personagem.
   */
  async salvar(dto: SalvarPersonagemDto, accessToken?: string) {
    if (!dto.name?.trim()) throw new Error("Nome do personagem é obrigatório");
    return personagensService.salvarPersonagem(dto, accessToken);
  },

  /**
   * Edita um personagem existente.
   */
  async editar(characterId: string, dto: EditarPersonagemDto, accessToken?: string) {
    if (!characterId) throw new Error("ID do personagem é obrigatório");
    return personagensService.editarPersonagem(characterId, dto, accessToken);
  },

  /**
   * Soft delete de personagem do usuário logado.
   */
  async deletar(characterId: string, accessToken?: string) {
    if (!characterId) throw new Error("ID do personagem é obrigatório");
    return personagensService.deletarMeuPersonagem(characterId, accessToken);
  },
};
