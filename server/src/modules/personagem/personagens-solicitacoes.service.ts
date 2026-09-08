import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { PersonagemModel } from "./models/personagem.model.js";
import { garantirAcessoAoPersonagem } from "./personagem-acesso.js";
import { mapearPersonagemParaApi, type PersonagemApi } from "./personagem-api.mapper.js";
import type { SolicitarAlteracaoDto } from "./personagens-solicitacoes.dto.js";

type AlteracaoPendente = {
  requestedAt: string;
  requestedByUserId: number;
  requestedByEmail: string | null;
  name?: string;
  avatarUrl?: string;
  history?: string;
  historyDocumentPath?: string;
  historyDocumentName?: string;
  historyDocumentMimeType?: string | null;
  indoleId?: number;
  deusId?: number | null;
};

export type SolicitacaoPendenteApi = {
  characterId: number;
  currentName: string;
  currentAvatarUrl: string | null;
  currentHistory: string | null;
  currentHistoryDocumentPath: string | null;
  currentHistoryDocumentName: string | null;
  requestedName: string | null;
  requestedAvatarUrl: string | null;
  requestedHistory: string | null;
  requestedHistoryDocumentPath: string | null;
  requestedHistoryDocumentName: string | null;
  requestedAt: string;
  requestedByEmail: string | null;
  currentIndoleId: number | null;
  requestedIndoleId: number | null;
  currentDeusId: number | null;
  requestedDeusId: number | null | undefined;
};

/**
 * Só os personagens com pedido em aberto. O filtro está no SQL para aproveitar
 * o índice parcial idx_characters_pending_request, em vez de trazer todo mundo
 * e peneirar em memória.
 */
const SQL_PERSONAGENS_COM_SOLICITACAO = `
  SELECT id
  FROM characters
  WHERE deleted_at IS NULL
    AND data ? 'pendingChangeRequest'
  ORDER BY updated_at DESC
`;

@Injectable()
export class PersonagensSolicitacoesService {
  constructor(
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
    private readonly sequelize: Sequelize,
  ) {}

  /** O jogador registra o que quer mudar; nada é aplicado até o mestre revisar. */
  async solicitarAlteracao(
    personagemId: number,
    dados: SolicitarAlteracaoDto,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }
    garantirAcessoAoPersonagem(personagem, usuario);

    const pedido: AlteracaoPendente = {
      requestedAt: new Date().toISOString(),
      requestedByUserId: usuario.usuarioId,
      requestedByEmail: usuario.email,
    };

    if (dados.name?.trim()) pedido.name = dados.name.trim();
    if (dados.avatarUrl?.trim()) {
      pedido.avatarUrl =
        this.armazenamentoArquivos.normalizarParaArmazenamento(dados.avatarUrl) ?? undefined;
    }
    if (dados.history !== undefined) pedido.history = dados.history;
    if (dados.historyDocumentPath !== undefined) {
      pedido.historyDocumentPath =
        this.armazenamentoArquivos.normalizarParaArmazenamento(dados.historyDocumentPath) ?? "";
      pedido.historyDocumentName = dados.historyDocumentName?.trim() ?? "";
      pedido.historyDocumentMimeType = dados.historyDocumentMimeType ?? null;
    }
    if (dados.indoleId !== undefined) pedido.indoleId = dados.indoleId;
    if (dados.deusId !== undefined) pedido.deusId = dados.deusId ?? null;

    const temAlgumCampo = Object.keys(pedido).length > 3;
    if (!temAlgumCampo) {
      throw new BadRequestException("Informe ao menos um campo para solicitar alteração.");
    }

    const dadosPersonagem = this.lerDados(personagem);
    personagem.data = { ...dadosPersonagem, pendingChangeRequest: pedido };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  async listarPendentes(): Promise<SolicitacaoPendenteApi[]> {
    const linhas = await this.sequelize.query<{ id: number }>(SQL_PERSONAGENS_COM_SOLICITACAO, {
      type: QueryTypes.SELECT,
    });
    if (linhas.length === 0) return [];

    const personagens = await this.modeloPersonagem.findAll({
      where: { id: linhas.map((linha) => linha.id) },
    });

    // Preserva a ordem da consulta (mais recentes primeiro).
    const porId = new Map(personagens.map((personagem) => [personagem.id, personagem]));

    return linhas
      .map((linha) => porId.get(linha.id))
      .filter((personagem): personagem is PersonagemModel => personagem !== undefined)
      .map((personagem) => this.montarResumo(personagem))
      .filter((resumo): resumo is SolicitacaoPendenteApi => resumo !== null);
  }

  /**
   * Aprovar aplica o que foi pedido; rejeitar só descarta. Nos dois casos o
   * pedido sai de `data` e fica um recibo em changeRequestResponse, que o
   * dashboard mostra ao jogador uma vez.
   */
  async revisar(personagemId: number, aprovar: boolean): Promise<PersonagemApi> {
    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }

    const dados = this.lerDados(personagem);
    const pedido = this.lerPedido(dados);
    if (!pedido) {
      throw new NotFoundException("Não há solicitação pendente para este personagem.");
    }

    delete dados.pendingChangeRequest;
    dados.changeRequestResponse = {
      status: aprovar ? "aprovado" : "rejeitado",
      respondidoEm: new Date().toISOString(),
      visto: false,
    };

    if (aprovar) {
      if (pedido.name?.trim()) personagem.name = pedido.name.trim();
      if (pedido.avatarUrl?.trim()) personagem.avatarUrl = pedido.avatarUrl.trim();
      if (pedido.indoleId) personagem.indoleId = pedido.indoleId;
      if (pedido.deusId !== undefined) personagem.deusId = pedido.deusId ?? null;
      if (pedido.history !== undefined) dados.history = pedido.history;
      if (pedido.historyDocumentPath !== undefined) {
        dados.historyDocumentPath = pedido.historyDocumentPath;
        dados.historyDocumentName = pedido.historyDocumentName ?? "";
        dados.historyDocumentMimeType = pedido.historyDocumentMimeType ?? null;
      }
    }

    personagem.data = { ...dados };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  private montarResumo(personagem: PersonagemModel): SolicitacaoPendenteApi | null {
    const dados = this.lerDados(personagem);
    const pedido = this.lerPedido(dados);
    if (!pedido) return null;

    const urlPublica = (caminho: string | null | undefined) =>
      this.armazenamentoArquivos.montarUrlPublica(caminho) || null;

    return {
      characterId: personagem.id,
      currentName: personagem.name,
      currentAvatarUrl: urlPublica(personagem.avatarUrl),
      currentHistory: (dados.history as string) ?? null,
      currentHistoryDocumentPath: urlPublica(
        (dados.historyDocumentPath as string) ?? (dados.historyDocumentUrl as string) ?? null,
      ),
      currentHistoryDocumentName: (dados.historyDocumentName as string) ?? null,
      requestedName: pedido.name ?? null,
      requestedAvatarUrl: urlPublica(pedido.avatarUrl),
      requestedHistory: pedido.history ?? null,
      requestedHistoryDocumentPath: urlPublica(pedido.historyDocumentPath),
      requestedHistoryDocumentName: pedido.historyDocumentName ?? null,
      requestedAt: pedido.requestedAt,
      requestedByEmail: pedido.requestedByEmail,
      currentIndoleId: personagem.indoleId,
      requestedIndoleId: pedido.indoleId ?? null,
      currentDeusId: personagem.deusId,
      requestedDeusId: pedido.deusId !== undefined ? (pedido.deusId ?? null) : undefined,
    };
  }

  private lerDados(personagem: PersonagemModel): Record<string, unknown> {
    const dados = personagem.data;
    return dados && typeof dados === "object" ? { ...dados } : {};
  }

  private lerPedido(dados: Record<string, unknown>): AlteracaoPendente | null {
    const pedido = dados.pendingChangeRequest;
    if (!pedido || typeof pedido !== "object") return null;
    return pedido as AlteracaoPendente;
  }
}
