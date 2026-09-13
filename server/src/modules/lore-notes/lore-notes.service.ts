import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, QueryTypes, type Transaction } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { CampanhasService } from "../campanhas/campanhas.service.js";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { garantirAcessoAoPersonagem } from "../personagem/personagem-acesso.js";
import { LoreNoteAcessoModel } from "./models/lore-note-acesso.model.js";
import { LoreNoteModel, type FormatoDaNota, type VisibilidadeDaNota } from "./models/lore-note.model.js";
import type { CriarLoreNoteDto, EditarLoreNoteDto } from "./lore-notes.dto.js";

export type LoreNoteApi = {
  id: number;
  campaign_id: number;
  title: string;
  subtitle: string | null;
  content: string;
  pdf_url: string | null;
  ordem: number;
  visibilidade: VisibilidadeDaNota;
  /** Quem lê quando a visibilidade é 'escolhidos'. Só na resposta do mestre. */
  character_ids: number[];
  formato: FormatoDaNota;
  /** URLs públicas; nulas quando o mestre não subiu imagem. */
  capa_url: string | null;
  contracapa_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

/** Um personagem do mundo da nota, marcado se está na lista de acesso. */
export type AcessoDaNotaApi = {
  character_id: number;
  nome: string;
  username: string | null;
  tem_acesso: boolean;
};

type LinhaDeAcesso = { character_id: number; nome: string; username: string | null; tem_acesso: boolean };

function formatarData(valor: unknown): string | null {
  return valor instanceof Date ? valor.toISOString() : null;
}

function textoOuNulo(valor: string | null | undefined): string | null {
  const texto = typeof valor === "string" ? valor.trim() : "";
  return texto === "" ? null : texto;
}

/**
 * Todos os personagens vivos do mundo, com a marca de quem já tem acesso.
 * Sem o filtro de raça que a lista de NPCs usa: um personagem que ainda não
 * fez o onboarding pode receber a carta de boas-vindas.
 */
const SQL_ACESSOS_DA_NOTA = `
  SELECT characters.id AS character_id,
         characters.name AS nome,
         characters.username,
         (acesso.lore_note_id IS NOT NULL) AS tem_acesso
  FROM characters
  LEFT JOIN lore_note_acesso acesso
    ON acesso.character_id = characters.id AND acesso.lore_note_id = :notaId
  WHERE characters.deleted_at IS NULL
    AND characters.campaign_id = :campanhaId
  ORDER BY characters.name
`;

@Injectable()
export class LoreNotesService {
  constructor(
    @InjectModel(LoreNoteModel)
    private readonly modeloLoreNote: typeof LoreNoteModel,
    @InjectModel(LoreNoteAcessoModel)
    private readonly modeloAcesso: typeof LoreNoteAcessoModel,
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly sequelize: Sequelize,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
    private readonly servicoCampanhas: CampanhasService,
  ) {}

  /**
   * O que um jogador vê: as notas do mundo do personagem dele que são para
   * todos, mais as que o mestre liberou para ele por lista. O mundo sai do
   * personagem, nunca do cliente.
   *
   * O mestre pode chamar sem personagem para espiar a prateleira do mundo
   * ativo — aí vê tudo, rascunhos inclusive.
   */
  async listarParaPersonagem(
    personagemId: number | undefined,
    usuario: UsuarioAutenticado,
  ): Promise<LoreNoteApi[]> {
    if (personagemId === undefined) {
      if (usuario.tipo !== "gm") {
        throw new BadRequestException("Informe o personagem (characterId).");
      }
      return this.listarParaMestre(undefined);
    }

    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }
    garantirAcessoAoPersonagem(personagem, usuario);
    if (personagem.campaignId === null) {
      throw new BadRequestException("Este personagem não está em nenhum mundo.");
    }

    const encontradas = await this.modeloLoreNote.findAll({
      where: {
        campaignId: personagem.campaignId,
        [Op.or]: [
          { visibilidade: "todos" },
          {
            visibilidade: "escolhidos",
            id: {
              [Op.in]: this.sequelize.literal(
                `(SELECT lore_note_id FROM lore_note_acesso WHERE character_id = ${Number(personagemId)})`,
              ),
            },
          },
        ],
      },
      order: [
        ["ordem", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    return encontradas.map((nota) => this.mapear(nota, []));
  }

  /** O mestre vê tudo do mundo, com a lista de acesso de cada nota. */
  async listarParaMestre(campanhaId: number | undefined): Promise<LoreNoteApi[]> {
    const campanha = await this.servicoCampanhas.resolverCampanhaAtiva(campanhaId);
    const encontradas = await this.modeloLoreNote.findAll({
      where: { campaignId: campanha },
      order: [
        ["ordem", "ASC"],
        ["createdAt", "ASC"],
      ],
    });
    const acessos = await this.acessosDasNotas(encontradas.map((nota) => nota.id));
    return encontradas.map((nota) => this.mapear(nota, acessos.get(nota.id) ?? []));
  }

  async listarAcessos(id: number): Promise<AcessoDaNotaApi[]> {
    const nota = await this.buscarOuFalhar(id);
    return this.consultarAcessos(nota.id, nota.campaignId);
  }

  /** A mesma lista para uma nota que ainda não existe: ninguém marcado. */
  async listarPersonagensDoMundo(campanhaId: number | undefined): Promise<AcessoDaNotaApi[]> {
    const campanha = await this.servicoCampanhas.resolverCampanhaAtiva(campanhaId);
    return this.consultarAcessos(0, campanha);
  }

  async criar(dados: CriarLoreNoteDto): Promise<LoreNoteApi> {
    const campanhaId = await this.servicoCampanhas.resolverCampanhaAtiva(dados.campaignId);
    const visibilidade = dados.visibilidade ?? "todos";
    const personagens = visibilidade === "escolhidos" ? dados.characterIds ?? [] : [];
    await this.garantirPersonagensDoMundo(personagens, campanhaId);

    const criada = await this.sequelize.transaction(async (transacao) => {
      const nota = await this.modeloLoreNote.create(
        {
          campaignId: campanhaId,
          title: dados.title.trim(),
          subtitle: textoOuNulo(dados.subtitle),
          // content é NOT NULL com default '' — não gravar null.
          content: dados.content ?? "",
          pdfUrl: this.armazenamentoArquivos.normalizarParaArmazenamento(dados.pdfUrl),
          ordem: dados.ordem ?? 0,
          visibilidade,
          formato: dados.formato ?? "livro",
          capaUrl: this.armazenamentoArquivos.normalizarParaArmazenamento(dados.capaUrl),
          contracapaUrl: this.armazenamentoArquivos.normalizarParaArmazenamento(dados.contracapaUrl),
        },
        { transaction: transacao },
      );
      await this.gravarAcessos(nota.id, personagens, transacao);
      return nota;
    });

    return this.mapear(criada, personagens);
  }

  /**
   * PATCH parcial campo a campo. A lista de acesso segue a visibilidade
   * final: só existe quando ela é 'escolhidos' — marcar 'todos' ou 'ninguem'
   * apaga as linhas, para nunca haver um estado ambíguo de "todos, mas com
   * uma lista guardada".
   */
  async editar(id: number, dados: EditarLoreNoteDto): Promise<LoreNoteApi> {
    const nota = await this.buscarOuFalhar(id);

    if (dados.title !== undefined) nota.title = dados.title.trim();
    if (dados.subtitle !== undefined) nota.subtitle = textoOuNulo(dados.subtitle);
    if (dados.content !== undefined) nota.content = dados.content ?? "";
    if (dados.pdfUrl !== undefined) {
      nota.pdfUrl = this.armazenamentoArquivos.normalizarParaArmazenamento(dados.pdfUrl);
    }
    if (dados.ordem !== undefined) nota.ordem = dados.ordem;
    if (dados.visibilidade !== undefined) nota.visibilidade = dados.visibilidade;
    if (dados.formato !== undefined) nota.formato = dados.formato;
    if (dados.capaUrl !== undefined) {
      nota.capaUrl = this.armazenamentoArquivos.normalizarParaArmazenamento(dados.capaUrl);
    }
    if (dados.contracapaUrl !== undefined) {
      nota.contracapaUrl = this.armazenamentoArquivos.normalizarParaArmazenamento(dados.contracapaUrl);
    }

    const mexeuNaLista = dados.characterIds !== undefined || dados.visibilidade !== undefined;
    let personagens: number[] | undefined;
    if (mexeuNaLista) {
      personagens =
        nota.visibilidade === "escolhidos"
          ? dados.characterIds ?? (await this.acessosDasNotas([nota.id])).get(nota.id) ?? []
          : [];
      await this.garantirPersonagensDoMundo(personagens, nota.campaignId);
    }

    await this.sequelize.transaction(async (transacao) => {
      await nota.save({ transaction: transacao });
      if (personagens !== undefined) {
        await this.gravarAcessos(nota.id, personagens, transacao);
      }
    });

    return this.mapear(nota, personagens ?? (await this.acessosDasNotas([nota.id])).get(nota.id) ?? []);
  }

  /** A nota é soft delete; os acessos são detalhe dela e somem de verdade. */
  async deletar(id: number): Promise<void> {
    const nota = await this.buscarOuFalhar(id);
    await this.sequelize.transaction(async (transacao) => {
      await this.modeloAcesso.destroy({ where: { loreNoteId: nota.id }, transaction: transacao });
      await nota.destroy({ transaction: transacao });
    });
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  /** notaId 0 não casa com nenhuma linha de acesso: todo mundo vem desmarcado. */
  private async consultarAcessos(notaId: number, campanhaId: number): Promise<AcessoDaNotaApi[]> {
    const linhas = await this.sequelize.query<LinhaDeAcesso>(SQL_ACESSOS_DA_NOTA, {
      replacements: { notaId, campanhaId },
      type: QueryTypes.SELECT,
    });
    return linhas.map((linha) => ({
      character_id: Number(linha.character_id),
      nome: linha.nome,
      username: linha.username,
      tem_acesso: Boolean(linha.tem_acesso),
    }));
  }

  private async buscarOuFalhar(id: number): Promise<LoreNoteModel> {
    const nota = await this.modeloLoreNote.findByPk(id);
    if (!nota) {
      throw new NotFoundException("Nota de lore não encontrada.");
    }
    return nota;
  }

  /**
   * Todo personagem da lista precisa existir, estar vivo e ser do mesmo mundo
   * da nota. Sem FOREIGN KEY nada impede um id de outro mundo — e um
   * personagem do mundo B lendo um livro do mundo A é o vazamento mais fácil
   * de acontecer num site multi-mundo.
   */
  private async garantirPersonagensDoMundo(ids: number[], campanhaId: number): Promise<void> {
    const unicos = [...new Set(ids)];
    if (unicos.length === 0) return;
    const encontrados = await this.modeloPersonagem.count({
      where: { id: { [Op.in]: unicos }, campaignId: campanhaId },
    });
    if (encontrados !== unicos.length) {
      throw new BadRequestException("Há personagem inexistente ou de outro mundo na lista de acesso.");
    }
  }

  /** Substitui o conjunto inteiro, na transação de quem chamou. */
  private async gravarAcessos(notaId: number, ids: number[], transacao: Transaction): Promise<void> {
    await this.modeloAcesso.destroy({ where: { loreNoteId: notaId }, transaction: transacao });
    for (const characterId of new Set(ids)) {
      await this.modeloAcesso.create({ loreNoteId: notaId, characterId }, { transaction: transacao });
    }
  }

  private async acessosDasNotas(notaIds: number[]): Promise<Map<number, number[]>> {
    const mapa = new Map<number, number[]>();
    if (notaIds.length === 0) return mapa;
    const linhas = await this.modeloAcesso.findAll({ where: { loreNoteId: { [Op.in]: notaIds } } });
    for (const linha of linhas) {
      const lista = mapa.get(linha.loreNoteId) ?? [];
      lista.push(linha.characterId);
      mapa.set(linha.loreNoteId, lista);
    }
    return mapa;
  }

  private mapear(nota: LoreNoteModel, characterIds: number[]): LoreNoteApi {
    return {
      id: nota.id,
      campaign_id: nota.campaignId,
      title: nota.title,
      subtitle: nota.subtitle,
      content: nota.content,
      pdf_url: this.armazenamentoArquivos.montarUrlPublica(nota.pdfUrl) || null,
      ordem: nota.ordem,
      visibilidade: nota.visibilidade ?? "todos",
      character_ids: characterIds,
      formato: nota.formato ?? "livro",
      capa_url: this.armazenamentoArquivos.montarUrlPublica(nota.capaUrl) || null,
      contracapa_url: this.armazenamentoArquivos.montarUrlPublica(nota.contracapaUrl) || null,
      created_at: formatarData(nota.get("createdAt")),
      updated_at: formatarData(nota.get("updatedAt")),
    };
  }
}
