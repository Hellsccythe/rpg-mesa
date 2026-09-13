import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { CampanhasService } from "../campanhas/campanhas.service.js";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { garantirAcessoAoPersonagem } from "../personagem/personagem-acesso.js";
import { NpcModel } from "./models/npc.model.js";
import { NpcAcessoModel } from "./models/npc-acesso.model.js";
import type { CriarNpcDto, EditarNpcDto } from "./npcs.dto.js";

export type NpcApi = {
  id: number;
  nome: string;
  raca_id: number | null;
  raca_nome: string | null;
  descricao: string | null;
  foto_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AcessoDePersonagem = {
  character_id: number;
  nome: string;
  username: string | null;
  tem_acesso: boolean;
};

type LinhaDeNpc = {
  id: number;
  nome: string;
  raca_id: number | null;
  raca_nome: string | null;
  descricao: string | null;
  foto_url: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

/**
 * O nome da raça vinha de uma segunda consulta com um mapa em memória; um
 * LEFT JOIN resolve. É LEFT de propósito: NPC sem raça, ou com raça deletada,
 * continua aparecendo.
 */
const SQL_LISTAR_NPCS = `
  SELECT
    npcs.id,
    npcs.nome,
    npcs.raca_id,
    npcs.descricao,
    npcs.foto_url,
    npcs.created_at,
    npcs.updated_at,
    racas.nome AS raca_nome
  FROM npcs
  LEFT JOIN racas
    ON racas.id = npcs.raca_id
   AND racas.deleted_at IS NULL
  WHERE npcs.deleted_at IS NULL
`;

/**
 * Todos os personagens que já passaram da escolha de raça, marcando quais têm
 * acesso a este NPC. Antes eram duas consultas e um Set em memória.
 */
const SQL_ACESSOS_DO_NPC = `
  SELECT
    characters.id       AS character_id,
    characters.name     AS nome,
    characters.username AS username,
    (acesso.npc_id IS NOT NULL) AS tem_acesso
  FROM characters
  LEFT JOIN npc_acesso_player AS acesso
    ON acesso.character_id = characters.id
   AND acesso.npc_id = :npcId
  WHERE characters.deleted_at IS NULL
    AND characters.raca_id IS NOT NULL
    AND characters.campaign_id = :campanhaId
  ORDER BY characters.name
`;

@Injectable()
export class NpcsService {
  constructor(
    @InjectModel(NpcModel)
    private readonly modeloNpc: typeof NpcModel,
    @InjectModel(NpcAcessoModel)
    private readonly modeloAcesso: typeof NpcAcessoModel,
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
    private readonly sequelize: Sequelize,
    private readonly servicoCampanhas: CampanhasService,
  ) {}

  // ── Leitura ───────────────────────────────────────────────────────────────

  async listarParaMestre(): Promise<NpcApi[]> {
    const campanhaId = await this.servicoCampanhas.resolverCampanhaAtiva();
    const linhas = await this.sequelize.query<LinhaDeNpc>(
      `${SQL_LISTAR_NPCS} AND npcs.campaign_id = :campanhaId ORDER BY npcs.nome`,
      { replacements: { campanhaId }, type: QueryTypes.SELECT },
    );
    return linhas.map((linha) => this.converterLinha(linha));
  }

  /**
   * Só os NPCs que o mestre liberou para aquele personagem.
   *
   * A versão anterior autenticava mas não conferia o dono: qualquer jogador
   * podia passar um characterId alheio e ver quais NPCs os outros conhecem.
   */
  async listarParaPersonagem(
    personagemId: number,
    usuario: UsuarioAutenticado,
  ): Promise<NpcApi[]> {
    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }
    garantirAcessoAoPersonagem(personagem, usuario);

    const linhas = await this.sequelize.query<LinhaDeNpc>(
      `${SQL_LISTAR_NPCS}
         AND npcs.id IN (
           SELECT npc_id FROM npc_acesso_player WHERE character_id = :personagemId
         )
       ORDER BY npcs.nome`,
      { replacements: { personagemId }, type: QueryTypes.SELECT },
    );
    return linhas.map((linha) => this.converterLinha(linha));
  }

  // ── Escrita ───────────────────────────────────────────────────────────────

  async criar(dados: CriarNpcDto): Promise<NpcApi> {
    const criado = await this.modeloNpc.create({
      campaignId: await this.servicoCampanhas.resolverCampanhaAtiva(),
      nome: dados.nome.trim(),
      racaId: dados.raca_id ?? null,
      descricao: dados.descricao?.trim() || null,
      fotoUrl: this.armazenamentoArquivos.normalizarParaArmazenamento(dados.foto_url ?? null),
    });

    return this.buscarOuFalhar(criado.id);
  }

  async editar(id: number, dados: EditarNpcDto): Promise<NpcApi> {
    const npc = await this.modeloNpc.findByPk(id);
    if (!npc) {
      throw new NotFoundException("NPC não encontrado.");
    }

    if (dados.nome !== undefined) npc.nome = dados.nome.trim();
    if (dados.raca_id !== undefined) npc.racaId = dados.raca_id;
    if (dados.descricao !== undefined) npc.descricao = dados.descricao?.trim() || null;
    if (dados.foto_url !== undefined) {
      npc.fotoUrl = this.armazenamentoArquivos.normalizarParaArmazenamento(dados.foto_url);
    }

    await npc.save();
    return this.buscarOuFalhar(id);
  }

  async deletar(id: number): Promise<void> {
    const npc = await this.modeloNpc.findByPk(id);
    if (!npc) {
      throw new NotFoundException("NPC não encontrado.");
    }
    await npc.destroy();
  }

  // ── Acesso dos personagens ────────────────────────────────────────────────

  /** Só os personagens do mundo do NPC: liberar um NPC de um mundo para alguém de outro não faz sentido. */
  async listarAcessos(npcId: number): Promise<AcessoDePersonagem[]> {
    const npc = await this.garantirNpcExistente(npcId);

    return this.sequelize.query<AcessoDePersonagem>(SQL_ACESSOS_DO_NPC, {
      replacements: { npcId, campanhaId: npc.campaignId },
      type: QueryTypes.SELECT,
    });
  }

  async concederAcesso(npcId: number, personagemId: number): Promise<void> {
    const npc = await this.garantirNpcExistente(npcId);

    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }
    if (personagem.campaignId !== npc.campaignId) {
      throw new BadRequestException("O personagem é de outro mundo.");
    }

    const jaTem = await this.modeloAcesso.findOne({
      where: { npcId, characterId: personagemId },
    });
    if (jaTem) return;

    await this.modeloAcesso.create({ npcId, characterId: personagemId });
  }

  /** Apaga de verdade — ver a nota em NpcAcessoModel sobre o UNIQUE total. */
  async revogarAcesso(npcId: number, personagemId: number): Promise<void> {
    const acesso = await this.modeloAcesso.findOne({
      where: { npcId, characterId: personagemId },
    });
    if (!acesso) {
      throw new NotFoundException("Este personagem não tem acesso a este NPC.");
    }
    await acesso.destroy();
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  private async garantirNpcExistente(id: number): Promise<NpcModel> {
    const npc = await this.modeloNpc.findByPk(id);
    if (!npc) {
      throw new NotFoundException("NPC não encontrado.");
    }
    return npc;
  }

  private async buscarOuFalhar(id: number): Promise<NpcApi> {
    const linhas = await this.sequelize.query<LinhaDeNpc>(`${SQL_LISTAR_NPCS} AND npcs.id = :id`, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });

    if (linhas.length === 0) {
      throw new NotFoundException("NPC não encontrado.");
    }
    return this.converterLinha(linhas[0]);
  }

  /** O banco guarda o caminho relativo; a API responde com a URL completa. */
  private converterLinha(linha: LinhaDeNpc): NpcApi {
    return {
      id: linha.id,
      nome: linha.nome,
      raca_id: linha.raca_id,
      raca_nome: linha.raca_nome,
      descricao: linha.descricao,
      foto_url: this.armazenamentoArquivos.montarUrlPublica(linha.foto_url) || null,
      created_at: linha.created_at instanceof Date ? linha.created_at.toISOString() : null,
      updated_at: linha.updated_at instanceof Date ? linha.updated_at.toISOString() : null,
    };
  }
}
