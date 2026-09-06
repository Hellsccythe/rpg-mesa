import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
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
    p.id,
    p.nome,
    p.descricao,
    p.foto_url,
    p.skill_ids,
    p.titulo_ids,
    p.atributo_bonus,
    p.created_at,
    p.updated_at,
    COALESCE(skills_do_passado.lista, '[]'::json) AS skills,
    COALESCE(titulos_do_passado.lista, '[]'::json) AS titulos
  FROM passados p
  LEFT JOIN LATERAL (
    SELECT json_agg(
             json_build_object(
               'id', entrada.skill_id,
               'name', COALESCE(s.name, 'Skill #' || entrada.skill_id)
             ) ORDER BY entrada.posicao
           ) AS lista
    FROM unnest(p.skill_ids) WITH ORDINALITY AS entrada(skill_id, posicao)
    LEFT JOIN skills s ON s.id = entrada.skill_id AND s.deleted_at IS NULL
  ) AS skills_do_passado ON TRUE
  LEFT JOIN LATERAL (
    SELECT json_agg(
             json_build_object(
               'id', entrada.titulo_id,
               'name', COALESCE(t.name, 'Título #' || entrada.titulo_id),
               'bonuses', t.bonuses,
               'skills', COALESCE(skills_do_titulo.lista, '[]'::json)
             ) ORDER BY entrada.posicao
           ) AS lista
    FROM unnest(p.titulo_ids) WITH ORDINALITY AS entrada(titulo_id, posicao)
    LEFT JOIN titles t ON t.id = entrada.titulo_id AND t.deleted_at IS NULL
    LEFT JOIN LATERAL (
      SELECT json_agg(
               json_build_object(
                 'id', entrada_skill.skill_id,
                 'name', COALESCE(s2.name, 'Skill #' || entrada_skill.skill_id)
               ) ORDER BY entrada_skill.posicao
             ) AS lista
      FROM unnest(COALESCE(t.skill_ids, '{}'::integer[])) WITH ORDINALITY AS entrada_skill(skill_id, posicao)
      LEFT JOIN skills s2 ON s2.id = entrada_skill.skill_id AND s2.deleted_at IS NULL
    ) AS skills_do_titulo ON TRUE
  ) AS titulos_do_passado ON TRUE
  WHERE p.deleted_at IS NULL
`;

@Injectable()
export class PassadosService {
  constructor(
    @InjectModel(PassadoModel)
    private readonly modeloPassado: typeof PassadoModel,
    private readonly sequelize: Sequelize,
  ) {}

  // ── Leitura (SQL cru com JOIN) ────────────────────────────────────────────

  async listar(): Promise<PassadoApi[]> {
    return this.sequelize.query<PassadoApi>(`${SQL_LISTAR_PASSADOS} ORDER BY p.nome`, {
      type: QueryTypes.SELECT,
    });
  }

  private async buscarEnriquecidoOuFalhar(id: number): Promise<PassadoApi> {
    const encontrados = await this.sequelize.query<PassadoApi>(
      `${SQL_LISTAR_PASSADOS} AND p.id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );

    if (encontrados.length === 0) {
      throw new NotFoundException("Passado não encontrado.");
    }
    return encontrados[0];
  }

  // ── Escrita (ORM, pra os hooks de auditoria dispararem) ───────────────────

  async criar(dados: CriarPassadoDto): Promise<PassadoApi> {
    const criado = await this.modeloPassado.create({
      nome: dados.nome.trim(),
      descricao: dados.descricao?.trim() ?? null,
      fotoUrl: dados.foto_url?.trim() || null,
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
    if (dados.foto_url !== undefined) registro.fotoUrl = dados.foto_url?.trim() || null;
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
