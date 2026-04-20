// server/src/modules/personagem/personagens.controller.ts
import { personagensService } from "./personagens.service.js";
import type {
  AdicionarNotaAventuraDto,
  AdicionarSkillPersonagemDto,
  AdicionarTituloPersonagemDto,
  SalvarPersonagemDto,
  EditarPersonagemDto,
  ListarPersonagemDto,
  RevisarSolicitacaoDto,
  SalvarCidadeMapaDto,
  SalvarClasseMestreDto,
  SalvarDeusDto,
  SalvarTituloMestreDto,
  SolicitarAlteracaoPersonagemDto,
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

  async obterComoMestre(characterId: string, accessToken?: string) {
    if (!characterId) throw new Error("ID do personagem é obrigatório");
    return personagensService.obterPersonagemPorIdComoMestre(characterId, accessToken);
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

  async solicitarAlteracao(
    characterId: string,
    dto: SolicitarAlteracaoPersonagemDto,
    accessToken?: string,
  ) {
    if (!characterId) throw new Error("ID do personagem é obrigatório");
    return personagensService.solicitarAlteracao(characterId, dto, accessToken);
  },

  async listarSolicitacoesPendentes(accessToken?: string) {
    return personagensService.listarSolicitacoesPendentes(accessToken);
  },

  async registrarECriar(dto: {
    email?: string
    username?: string
    senha?: string
    nome?: string
    data?: Record<string, any>
    avatarUrl?: string | null
  }) {
    if (!dto.email?.trim()) throw new Error("Email e obrigatorio")
    if (!dto.username?.trim()) throw new Error("Nome de usuario e obrigatorio")
    if (!dto.senha) throw new Error("Senha e obrigatoria")
    if (!dto.nome?.trim()) throw new Error("Nome do personagem e obrigatorio")
    return personagensService.registrarECriarPersonagem({
      email: dto.email,
      username: dto.username,
      senha: dto.senha,
      nome: dto.nome,
      data: dto.data,
      avatarUrl: dto.avatarUrl ?? null,
    })
  },

  async listarEmailsPermitidosCriacaoPersonagem(accessToken?: string) {
    return personagensService.listarEmailsPermitidosCriacaoPersonagem(accessToken);
  },

  async adicionarEmailPermitidoCriacaoPersonagem(email: string, accessToken?: string) {
    if (!email?.trim()) throw new Error("Email e obrigatorio para liberacao");
    return personagensService.adicionarEmailPermitidoCriacaoPersonagem(email, accessToken);
  },

  async removerEmailPermitidoCriacaoPersonagem(email: string, accessToken?: string) {
    if (!email?.trim()) throw new Error("Email e obrigatorio para remocao");
    return personagensService.removerEmailPermitidoCriacaoPersonagem(email, accessToken);
  },

  async revisarSolicitacao(characterId: string, dto: RevisarSolicitacaoDto, accessToken?: string) {
    if (!characterId) throw new Error("ID do personagem é obrigatório");
    return personagensService.revisarSolicitacao(characterId, dto, accessToken);
  },

  async salvarDeus(dto: SalvarDeusDto, accessToken?: string) {
    if (!dto.name?.trim()) throw new Error("Nome do deus é obrigatório");
    return personagensService.salvarDeus(dto, accessToken);
  },

  async salvarCidadeMapa(dto: SalvarCidadeMapaDto, accessToken?: string) {
    if (!dto.name?.trim()) throw new Error("Nome da cidade é obrigatório");
    if (!dto.mapReference?.trim()) throw new Error("Referência do mapa é obrigatória");
    return personagensService.salvarCidadeMapa(dto, accessToken);
  },

  async salvarClasseMestre(dto: SalvarClasseMestreDto, accessToken?: string) {
    if (!dto.name?.trim()) throw new Error("Nome da classe é obrigatório");
    if (!dto.tier?.trim()) throw new Error("Tier da classe é obrigatório");
    if (!dto.description?.trim()) throw new Error("Descrição da classe é obrigatória");
    return personagensService.salvarClasseMestre(dto, accessToken);
  },

  async salvarTituloMestre(dto: SalvarTituloMestreDto, accessToken?: string) {
    if (!dto.name?.trim()) throw new Error("Nome do título é obrigatório");
    if (!dto.tier?.trim()) throw new Error("Tier do título é obrigatório");
    if (!dto.description?.trim()) throw new Error("Descrição do título é obrigatória");
    return personagensService.salvarTituloMestre(dto, accessToken);
  },

  async adicionarSkillEmPersonagem(
    characterId: string,
    dto: AdicionarSkillPersonagemDto,
    accessToken?: string,
  ) {
    if (!characterId) throw new Error("ID do personagem é obrigatório");
    if (!dto.skillName?.trim()) throw new Error("Nome da skill é obrigatório");
    return personagensService.adicionarSkillEmPersonagem(characterId, dto, accessToken);
  },

  async adicionarTituloEmPersonagem(
    characterId: string,
    dto: AdicionarTituloPersonagemDto,
    accessToken?: string,
  ) {
    if (!characterId) throw new Error("ID do personagem é obrigatório");
    if (!dto.titleName?.trim()) throw new Error("Nome do título é obrigatório");
    return personagensService.adicionarTituloEmPersonagem(characterId, dto, accessToken);
  },

  async adicionarNotaAventura(
    characterId: string,
    dto: AdicionarNotaAventuraDto,
    accessToken?: string,
  ) {
    if (!characterId) throw new Error("ID do personagem é obrigatório");
    if (!dto.note?.trim()) throw new Error("Nota de aventura é obrigatória");
    return personagensService.adicionarNotaAventura(characterId, dto, accessToken);
  },

  /**
   * Soft delete de personagem do usuário logado.
   */
  async deletar(characterId: string, accessToken?: string) {
    if (!characterId) throw new Error("ID do personagem é obrigatório");
    return personagensService.deletarMeuPersonagem(characterId, accessToken);
  },

  /**
   * Soft delete do registro + hard delete da imagem. Apenas mestre.
   */
  async deletarComoMestre(characterId: string, accessToken?: string) {
    if (!characterId) throw new Error("ID do personagem é obrigatório");
    return personagensService.deletarPersonagemComoMestre(characterId, accessToken);
  },
};
