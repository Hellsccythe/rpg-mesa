import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { PassadoModel, type AtributoBonus } from "./models/passado.model.js";
import type { CriarPassadoDto, EditarPassadoDto } from "./passados.dto.js";

export type SkillResumo = { id: number; name: string };
export type TituloResumo = { id: number; name: string; bonuses: unknown | null; skills: SkillResumo[] };

export type PassadoApi = {
  id: number;
  nome: string;
  descricao: string | null;
  foto_url: string | null;
  skill_ids: number[];
  titulo_ids: number[];
  skills: SkillResumo[];
  titulos: TituloResumo[];
  atributo_bonus: AtributoBonus | null;
  created_at: string;
  updated_at: string;
};

/**
 * Leitura em SQL cru: resolve num único SELECT o que a versão anterior fazia
 * em 3 consultas + montagem de mapas em JavaScript (buscar passados, buscar
 * títulos referenciados, buscar skills dos passados e dos títulos).
 *
 * Cada LEFT JOIN LATERAL expande um array de IDs em linhas (unnest ... WITH
 * ORDINALITY preserva a ordem original do array) e reagrupa como JSON. Os
 * JOINs são LEFT de propósito: se uma skill/título referenciado tiver sido
 * deletado, o registro continua aparecendo com o rótulo "Skill #12" —
 * exatamente o comportamento que o código antigo tinha.
 */
const SQL_LISTAR_PASSADOS = `
  SELECT
    passados.id,
    passados.nome,
    passados.descricao,
    passados.foto_url,
    passados.skill_ids,
    passados.titulo_ids,
    passados.atributo_bonus,
    passados.created_at,
    passados.updated_at,
    COALESCE(skills_do_passado.lista, '[]'::json) AS skills,
    COALESCE(titulos_do_passado.lista, '[]'::json) AS titulos
  FROM passados
  LEFT JOIN LATERAL (
    SELECT json_agg(
             json_build_object(
               'id', skill_referenciada.skill_id,
               'name', COALESCE(skills.name, 'Skill #' || skill_referenciada.skill_id)
             ) ORDER BY skill_referenciada.posicao
           ) AS lista
    FROM unnest(passados.skill_ids) WITH ORDINALITY AS skill_referenciada(skill_id, posicao)
    LEFT JOIN skills
      ON skills.id = skill_referenciada.skill_id
     AND skills.deleted_at IS NULL
  ) AS skills_do_passado ON TRUE
  LEFT JOIN LATERAL (
    SELECT json_agg(
             json_build_object(
               'id', titulo_referenciado.titulo_id,
               'name', COALESCE(titles.name, 'Título #' || titulo_referenciado.titulo_id),
               'bonuses', titles.bonuses,
               'skills', COALESCE(skills_do_titulo.lista, '[]'::json)
             ) ORDER BY titulo_referenciado.posicao
           ) AS lista
    FROM unnest(passados.titulo_ids) WITH ORDINALITY AS titulo_referenciado(titulo_id, posicao)
    LEFT JOIN titles
      ON titles.id = titulo_referenciado.titulo_id
     AND titles.deleted_at IS NULL
    LEFT JOIN LATERAL (
      SELECT json_agg(
               json_build_object(
                 'id', skill_do_titulo.skill_id,
                 'name', COALESCE(skills.name, 'Skill #' || skill_do_titulo.skill_id)
               ) ORDER BY skill_do_titulo.posicao
             ) AS lista
      FROM unnest(COALESCE(titles.skill_ids, '{}'::integer[])) WITH ORDINALITY AS skill_do_titulo(skill_id, posicao)
      LEFT JOIN skills
        ON skills.id = skill_do_titulo.skill_id
       AND skills.deleted_at IS NULL
    ) AS skills_do_titulo ON TRUE
  ) AS titulos_do_passado ON TRUE
  WHERE passados.deleted_at IS NULL
`;

@Injectable()
export class PassadosService {
  constructor(
    @InjectModel(PassadoModel)
    private readonly modeloPassado: typeof PassadoModel,
    private readonly sequelize: Sequelize,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  // ── Leitura (SQL cru com JOIN) ────────────────────────────────────────────

  async listar(): Promise<PassadoApi[]> {
    const encontrados = await this.sequelize.query<PassadoApi>(
      `${SQL_LISTAR_PASSADOS} ORDER BY passados.nome`,
      { type: QueryTypes.SELECT },
    );
    return encontrados.map((passado) => this.comUrlDeImagem(passado));
  }

  private async buscarEnriquecidoOuFalhar(id: number): Promise<PassadoApi> {
    const encontrados = await this.sequelize.query<PassadoApi>(
      `${SQL_LISTAR_PASSADOS} AND passados.id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );

    if (encontrados.length === 0) {
      throw new NotFoundException("Passado não encontrado.");
    }
    return this.comUrlDeImagem(encontrados[0]);
  }

  /** O banco guarda o caminho relativo; a API responde com a URL completa. */
  private comUrlDeImagem(passado: PassadoApi): PassadoApi {
    return {
      ...passado,
      foto_url: this.armazenamentoArquivos.montarUrlPublica(passado.foto_url) || null,
    };
  }

  // ── Escrita (ORM, pra os hooks de auditoria dispararem) ───────────────────

  async criar(dados: CriarPassadoDto): Promise<PassadoApi> {
    const criado = await this.modeloPassado.create({
      nome: dados.nome.trim(),
      descricao: dados.descricao?.trim() ?? null,
      fotoUrl: this.armazenamentoArquivos.normalizarParaArmazenamento(dados.foto_url),
      skillIds: dados.skill_ids ?? [],
      tituloIds: dados.titulo_ids ?? [],
      atributoBonus: dados.atributo_bonus ?? null,
    });

    return this.buscarEnriquecidoOuFalhar(criado.id);
  }

  async editar(id: number, dados: EditarPassadoDto): Promise<PassadoApi> {
    const registro = await this.modeloPassado.findByPk(id);
    if (!registro) {
      throw new NotFoundException("Passado não encontrado.");
    }

    if (dados.nome !== undefined) registro.nome = dados.nome.trim();
    if (dados.descricao !== undefined) registro.descricao = dados.descricao?.trim() ?? null;
    if (dados.foto_url !== undefined) {
      registro.fotoUrl = this.armazenamentoArquivos.normalizarParaArmazenamento(dados.foto_url);
    }
    if (dados.skill_ids !== undefined) registro.skillIds = dados.skill_ids;
    if (dados.titulo_ids !== undefined) registro.tituloIds = dados.titulo_ids;
    if (dados.atributo_bonus !== undefined) registro.atributoBonus = dados.atributo_bonus ?? null;

    await registro.save();
    return this.buscarEnriquecidoOuFalhar(id);
  }

  async deletar(id: number): Promise<void> {
    const registro = await this.modeloPassado.findByPk(id);
    if (!registro) {
      throw new NotFoundException("Passado não encontrado.");
    }
    // Soft delete (paranoid). A imagem em disco é preservada de propósito:
    // o registro pode ser restaurado, e o arquivo não voltaria.
    await registro.destroy();
  }
}
