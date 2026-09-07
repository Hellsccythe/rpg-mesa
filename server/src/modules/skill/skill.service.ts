import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { obterUsuarioAutenticadoDoContexto } from "../../common/cls/contexto-requisicao.js";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { mapearPersonagemParaApi, type PersonagemApi } from "../personagem/personagem-api.mapper.js";
import { SkillModel } from "./models/skill.model.js";
import { SkillNivelModel } from "./models/skill-nivel.model.js";
import { SkillOverrideModel } from "./models/skill-override.model.js";
import {
  SkillCategoriaModel,
  SkillNaturezaModel,
  SkillTipoDanoModel,
  SkillTipoModel,
} from "./models/lookups-skill.model.js";
import type {
  AdicionarSkillPersonagemDto,
  CriarSkillCatalogoDto,
  CriarSkillNivelDto,
  CriarSkillOverrideDto,
  EditarSkillCatalogoDto,
  EditarSkillNivelDto,
  EditarSkillOverrideDto,
} from "./skill.dto.js";

export type SkillApi = Record<string, unknown>;
export type LookupSkillApi = { item: number; descricao: string };

export type NivelDeSkillApi = {
  id: number;
  skill_id: number;
  skill_name: string | null;
  nivel: number;
  damage_multiplier_pct: number | null;
  nome_override: string | null;
  damage_base_override: string | null;
  multiplicador_override: string | null;
  effect_description_override: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ReferenciasDaSkill = {
  passados: { id: number; nome: string }[];
  titulos: { id: number; nome: string }[];
  classes: { id: number; nome: string }[];
};

export type ModeloLookupSkill =
  | typeof SkillNaturezaModel
  | typeof SkillTipoModel
  | typeof SkillCategoriaModel
  | typeof SkillTipoDanoModel;

function formatarData(valor: unknown): string | null {
  return valor instanceof Date ? valor.toISOString() : null;
}

function textoOuNulo(valor: string | null | undefined): string | null {
  const texto = typeof valor === "string" ? valor.trim() : "";
  return texto === "" ? null : texto;
}

function listaOuNulo<T>(valor: T[] | null | undefined): T[] | null {
  return valor && valor.length > 0 ? valor : null;
}

/**
 * Quem referencia esta skill. A versão anterior trazia passados, títulos e
 * classes inteiros para a memória e filtrava em JavaScript; aqui cada
 * subconsulta já devolve só o que casa, com o Postgres usando os operadores
 * de array.
 *
 * Note que classes referenciam a skill pelo NOME (starting_skills é text[]),
 * enquanto passados e títulos referenciam pelo id.
 */
const SQL_REFERENCIAS_DA_SKILL = `
  SELECT
    COALESCE((
      SELECT json_agg(json_build_object('id', passados.id, 'nome', passados.nome) ORDER BY passados.nome)
      FROM passados
      WHERE passados.deleted_at IS NULL
        AND :skillId = ANY(passados.skill_ids)
    ), '[]'::json) AS passados,
    COALESCE((
      SELECT json_agg(json_build_object('id', titles.id, 'nome', titles.name) ORDER BY titles.name)
      FROM titles
      WHERE titles.deleted_at IS NULL
        AND :skillId = ANY(titles.skill_ids)
    ), '[]'::json) AS titulos,
    COALESCE((
      SELECT json_agg(json_build_object('id', classes.id, 'nome', classes.name) ORDER BY classes.name)
      FROM classes
      WHERE classes.deleted_at IS NULL
        AND :skillName = ANY(classes.starting_skills)
    ), '[]'::json) AS classes
`;

/** Níveis já com o nome da skill, que antes vinha de uma segunda consulta. */
const SQL_NIVEIS_COM_NOME_DA_SKILL = `
  SELECT
    skill_niveis.id,
    skill_niveis.skill_id,
    skill_niveis.nivel,
    skill_niveis.damage_multiplier_pct,
    skill_niveis.nome_override,
    skill_niveis.damage_base_override,
    skill_niveis.multiplicador_override,
    skill_niveis.effect_description_override,
    skill_niveis.created_at,
    skill_niveis.updated_at,
    skills.name AS skill_name
  FROM skill_niveis
  LEFT JOIN skills
    ON skills.id = skill_niveis.skill_id
   AND skills.deleted_at IS NULL
`;

@Injectable()
export class SkillService {
  constructor(
    @InjectModel(SkillModel)
    private readonly modeloSkill: typeof SkillModel,
    @InjectModel(SkillNivelModel)
    private readonly modeloNivel: typeof SkillNivelModel,
    @InjectModel(SkillOverrideModel)
    private readonly modeloOverride: typeof SkillOverrideModel,
    @InjectModel(SkillNaturezaModel)
    private readonly modeloNatureza: typeof SkillNaturezaModel,
    @InjectModel(SkillTipoModel)
    private readonly modeloTipo: typeof SkillTipoModel,
    @InjectModel(SkillCategoriaModel)
    private readonly modeloCategoria: typeof SkillCategoriaModel,
    @InjectModel(SkillTipoDanoModel)
    private readonly modeloTipoDano: typeof SkillTipoDanoModel,
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly sequelize: Sequelize,
  ) {}

  // ── Catálogo ──────────────────────────────────────────────────────────────

  async listarCatalogo(): Promise<SkillApi[]> {
    const encontradas = await this.modeloSkill.findAll({ order: [["name", "ASC"]] });
    return encontradas.map((skill) => this.mapearSkill(skill));
  }

  async criarNoCatalogo(dados: CriarSkillCatalogoDto): Promise<SkillApi> {
    const criada = await this.modeloSkill.create({
      name: dados.name.trim(),
      // description é NOT NULL no banco. A versão anterior gravava null quando
      // o campo vinha vazio, e o insert quebrava com violação de not-null.
      description: dados.description?.trim() ?? "",
      racaVinculada: listaOuNulo(dados.raca_vinculada),
      skillNaturezaItem: dados.skill_natureza_item ?? null,
      skillTipoItem: dados.skill_tipo_item ?? null,
      skillCategoriaItem: listaOuNulo(dados.skill_categoria_item),
      skillTipoDanoItem: listaOuNulo(dados.skill_tipo_dano_item),
      multiplicadorAtributo: listaOuNulo(dados.multiplicador_atributo),
      damageBase: textoOuNulo(dados.damage_base),
      effectDescription: textoOuNulo(dados.effect_description),
      custo: dados.custo ?? null,
      cooldown: dados.cooldown ?? null,
      range: textoOuNulo(dados.range),
      requiredClass: textoOuNulo(dados.required_class),
    });

    return this.mapearSkill(criada);
  }

  async editarNoCatalogo(id: number, dados: EditarSkillCatalogoDto): Promise<SkillApi> {
    const skill = await this.buscarSkillOuFalhar(id);

    if (dados.name !== undefined) skill.name = dados.name.trim();
    if (dados.description !== undefined) skill.description = dados.description?.trim() ?? "";
    if (dados.raca_vinculada !== undefined) skill.racaVinculada = listaOuNulo(dados.raca_vinculada);
    if (dados.skill_natureza_item !== undefined) skill.skillNaturezaItem = dados.skill_natureza_item;
    if (dados.skill_tipo_item !== undefined) skill.skillTipoItem = dados.skill_tipo_item;
    if (dados.skill_categoria_item !== undefined) {
      skill.skillCategoriaItem = listaOuNulo(dados.skill_categoria_item);
    }
    if (dados.skill_tipo_dano_item !== undefined) {
      skill.skillTipoDanoItem = listaOuNulo(dados.skill_tipo_dano_item);
    }
    if (dados.multiplicador_atributo !== undefined) {
      skill.multiplicadorAtributo = listaOuNulo(dados.multiplicador_atributo);
    }
    if (dados.damage_base !== undefined) skill.damageBase = textoOuNulo(dados.damage_base);
    if (dados.effect_description !== undefined) {
      skill.effectDescription = textoOuNulo(dados.effect_description);
    }
    if (dados.custo !== undefined) skill.custo = dados.custo;
    if (dados.cooldown !== undefined) skill.cooldown = dados.cooldown;
    if (dados.range !== undefined) skill.range = textoOuNulo(dados.range);
    if (dados.required_class !== undefined) {
      skill.requiredClass = textoOuNulo(dados.required_class);
    }

    await skill.save();
    return this.mapearSkill(skill);
  }

  async listarReferencias(id: number): Promise<ReferenciasDaSkill> {
    const skill = await this.buscarSkillOuFalhar(id);
    return this.buscarReferencias(skill.id, skill.name);
  }

  /**
   * Faz o soft delete da skill e a remove de quem a referenciava: passados,
   * títulos (por id) e classes (por nome). As skills já concedidas a
   * personagens em data.skills[] ficam — são histórico pessoal.
   */
  async deletarDoCatalogo(id: number): Promise<void> {
    const skill = await this.buscarSkillOuFalhar(id);
    const skillId = skill.id;
    const skillName = skill.name;

    await skill.destroy();

    // array_remove resolve a limpeza no banco. A versão anterior trazia as
    // três tabelas inteiras, filtrava em JavaScript e disparava um UPDATE por
    // registro afetado.
    const emailDoAutor = obterUsuarioAutenticadoDoContexto()?.email ?? "sistema";
    const substituicoes = { skillId, skillName, emailDoAutor };

    await this.sequelize.query(
      `UPDATE passados
          SET skill_ids = array_remove(skill_ids, :skillId), updated_by = :emailDoAutor
        WHERE deleted_at IS NULL AND :skillId = ANY(skill_ids)`,
      { replacements: substituicoes, type: QueryTypes.UPDATE },
    );

    await this.sequelize.query(
      `UPDATE titles
          SET skill_ids = array_remove(skill_ids, :skillId), updated_by = :emailDoAutor
        WHERE deleted_at IS NULL AND :skillId = ANY(skill_ids)`,
      { replacements: substituicoes, type: QueryTypes.UPDATE },
    );

    await this.sequelize.query(
      `UPDATE classes
          SET starting_skills = array_remove(starting_skills, :skillName), updated_by = :emailDoAutor
        WHERE deleted_at IS NULL AND :skillName = ANY(starting_skills)`,
      { replacements: substituicoes, type: QueryTypes.UPDATE },
    );
  }

  // ── Tabelas de apoio ──────────────────────────────────────────────────────

  listarNaturezas = () => this.listarLookup(this.modeloNatureza);
  criarNatureza = (descricao: string) => this.criarLookup(this.modeloNatureza, descricao);
  editarNatureza = (item: number, descricao: string) =>
    this.editarLookup(this.modeloNatureza, item, descricao);
  deletarNatureza = (item: number) => this.deletarLookup(this.modeloNatureza, item);

  listarTipos = () => this.listarLookup(this.modeloTipo);
  criarTipo = (descricao: string) => this.criarLookup(this.modeloTipo, descricao);
  editarTipo = (item: number, descricao: string) =>
    this.editarLookup(this.modeloTipo, item, descricao);
  deletarTipo = (item: number) => this.deletarLookup(this.modeloTipo, item);

  listarCategorias = () => this.listarLookup(this.modeloCategoria);
  criarCategoria = (descricao: string) => this.criarLookup(this.modeloCategoria, descricao);
  editarCategoria = (item: number, descricao: string) =>
    this.editarLookup(this.modeloCategoria, item, descricao);
  deletarCategoria = (item: number) => this.deletarLookup(this.modeloCategoria, item);

  listarTiposDano = () => this.listarLookup(this.modeloTipoDano);
  criarTipoDano = (descricao: string) => this.criarLookup(this.modeloTipoDano, descricao);
  editarTipoDano = (item: number, descricao: string) =>
    this.editarLookup(this.modeloTipoDano, item, descricao);
  deletarTipoDano = (item: number) => this.deletarLookup(this.modeloTipoDano, item);

  // ── Overrides por personagem ──────────────────────────────────────────────

  async listarOverrides(personagemId: number) {
    const encontrados = await this.modeloOverride.findAll({
      where: { characterId: personagemId },
      order: [["skillName", "ASC"]],
    });
    return encontrados.map((override) => this.mapearOverride(override));
  }

  async criarOverride(dados: CriarSkillOverrideDto) {
    await this.garantirPersonagemExistente(dados.character_id);

    const jaExiste = await this.modeloOverride.findOne({
      where: { skillName: dados.skill_name.trim(), characterId: dados.character_id },
    });
    if (jaExiste) {
      throw new ConflictException("Já existe um ajuste desta skill para este personagem.");
    }

    const criado = await this.modeloOverride.create({
      skillName: dados.skill_name.trim(),
      characterId: dados.character_id,
      damageBaseOverride: textoOuNulo(dados.damage_base_override),
      multiplicadorOverride: listaOuNulo(dados.multiplicador_override),
    });

    return this.mapearOverride(criado);
  }

  async editarOverride(id: number, dados: EditarSkillOverrideDto) {
    const override = await this.modeloOverride.findByPk(id);
    if (!override) {
      throw new NotFoundException("Ajuste de skill não encontrado.");
    }

    if (dados.damage_base_override !== undefined) {
      override.damageBaseOverride = textoOuNulo(dados.damage_base_override);
    }
    if (dados.multiplicador_override !== undefined) {
      override.multiplicadorOverride = listaOuNulo(dados.multiplicador_override);
    }

    await override.save();
    return this.mapearOverride(override);
  }

  /** Apaga de verdade — ver a nota em SkillOverrideModel sobre o UNIQUE total. */
  async deletarOverride(id: number): Promise<void> {
    const override = await this.modeloOverride.findByPk(id);
    if (!override) {
      throw new NotFoundException("Ajuste de skill não encontrado.");
    }
    await override.destroy();
  }

  // ── Skill concedida a um personagem ───────────────────────────────────────

  async adicionarEmPersonagem(
    personagemId: number,
    dados: AdicionarSkillPersonagemDto,
  ): Promise<PersonagemApi> {
    const personagem = await this.garantirPersonagemExistente(personagemId);

    const dadosPersonagem = (personagem.data ?? {}) as Record<string, unknown>;
    const skills = Array.isArray(dadosPersonagem.skills)
      ? [...(dadosPersonagem.skills as Array<Record<string, unknown>>)]
      : [];

    const nomeDaSkill = dados.skillName.trim();
    const jaTem = skills.some(
      (skill) => String(skill?.name ?? "").toLowerCase() === nomeDaSkill.toLowerCase(),
    );

    if (!jaTem) {
      skills.push({
        name: nomeDaSkill,
        addedBy: obterUsuarioAutenticadoDoContexto()?.email ?? "master",
        addedAt: new Date().toISOString(),
      });
    }

    personagem.data = { ...dadosPersonagem, skills };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  // ── Níveis de skill ───────────────────────────────────────────────────────

  async listarNiveis(skillId?: number): Promise<NivelDeSkillApi[]> {
    const filtro = skillId === undefined ? "" : " WHERE skill_niveis.skill_id = :skillId";

    const linhas = await this.sequelize.query<
      Omit<NivelDeSkillApi, "created_at" | "updated_at"> & {
        created_at: Date | null;
        updated_at: Date | null;
      }
    >(
      `${SQL_NIVEIS_COM_NOME_DA_SKILL}${filtro}
       ORDER BY skill_niveis.skill_id, skill_niveis.nivel`,
      { replacements: { skillId }, type: QueryTypes.SELECT },
    );

    return linhas.map((linha) => ({
      ...linha,
      created_at: formatarData(linha.created_at),
      updated_at: formatarData(linha.updated_at),
    }));
  }

  async criarNivel(dados: CriarSkillNivelDto) {
    await this.buscarSkillOuFalhar(dados.skill_id);

    const jaExiste = await this.modeloNivel.findOne({
      where: { skillId: dados.skill_id, nivel: dados.nivel },
    });
    if (jaExiste) {
      throw new ConflictException("Já existe uma evolução desta skill para este nível.");
    }

    const criado = await this.modeloNivel.create({
      skillId: dados.skill_id,
      nivel: dados.nivel,
      damageMultiplierPct: dados.damage_multiplier_pct ?? null,
      nomeOverride: textoOuNulo(dados.nome_override),
      damageBaseOverride: textoOuNulo(dados.damage_base_override),
      multiplicadorOverride: textoOuNulo(dados.multiplicador_override),
      effectDescriptionOverride: textoOuNulo(dados.effect_description_override),
    });

    return (await this.listarNiveis(criado.skillId)).find((nivel) => nivel.id === criado.id)!;
  }

  async editarNivel(id: number, dados: EditarSkillNivelDto) {
    const nivel = await this.modeloNivel.findByPk(id);
    if (!nivel) {
      throw new NotFoundException("Evolução de skill não encontrada.");
    }

    if (dados.damage_multiplier_pct !== undefined) {
      nivel.damageMultiplierPct = dados.damage_multiplier_pct;
    }
    if (dados.nome_override !== undefined) nivel.nomeOverride = textoOuNulo(dados.nome_override);
    if (dados.damage_base_override !== undefined) {
      nivel.damageBaseOverride = textoOuNulo(dados.damage_base_override);
    }
    if (dados.multiplicador_override !== undefined) {
      nivel.multiplicadorOverride = textoOuNulo(dados.multiplicador_override);
    }
    if (dados.effect_description_override !== undefined) {
      nivel.effectDescriptionOverride = textoOuNulo(dados.effect_description_override);
    }

    await nivel.save();
    return (await this.listarNiveis(nivel.skillId)).find((entrada) => entrada.id === id)!;
  }

  /** Apaga de verdade — ver a nota em SkillNivelModel sobre o UNIQUE total. */
  async deletarNivel(id: number): Promise<void> {
    const nivel = await this.modeloNivel.findByPk(id);
    if (!nivel) {
      throw new NotFoundException("Evolução de skill não encontrada.");
    }
    await nivel.destroy();
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  private async buscarSkillOuFalhar(id: number): Promise<SkillModel> {
    const skill = await this.modeloSkill.findByPk(id);
    if (!skill) {
      throw new NotFoundException("Skill não encontrada.");
    }
    return skill;
  }

  private async garantirPersonagemExistente(id: number): Promise<PersonagemModel> {
    const personagem = await this.modeloPersonagem.findByPk(id);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }
    return personagem;
  }

  private async buscarReferencias(skillId: number, skillName: string): Promise<ReferenciasDaSkill> {
    const encontradas = await this.sequelize.query<ReferenciasDaSkill>(SQL_REFERENCIAS_DA_SKILL, {
      replacements: { skillId, skillName },
      type: QueryTypes.SELECT,
    });
    return encontradas[0];
  }

  private async listarLookup(modelo: ModeloLookupSkill): Promise<LookupSkillApi[]> {
    const encontrados = await modelo.findAll({ order: [["item", "ASC"]] });
    return encontrados.map((registro) => ({
      item: registro.item,
      descricao: registro.descricao,
    }));
  }

  private async criarLookup(
    modelo: ModeloLookupSkill,
    descricao: string,
  ): Promise<LookupSkillApi> {
    const criado = await modelo.create({ descricao: descricao.trim() });
    return { item: criado.item, descricao: criado.descricao };
  }

  private async editarLookup(
    modelo: ModeloLookupSkill,
    item: number,
    descricao: string,
  ): Promise<LookupSkillApi> {
    const registro = await modelo.findByPk(item);
    if (!registro) {
      throw new NotFoundException("Item não encontrado.");
    }
    registro.descricao = descricao.trim();
    await registro.save();
    return { item: registro.item, descricao: registro.descricao };
  }

  private async deletarLookup(modelo: ModeloLookupSkill, item: number): Promise<void> {
    const registro = await modelo.findByPk(item);
    if (!registro) {
      throw new NotFoundException("Item não encontrado.");
    }
    await registro.destroy();
  }

  private mapearOverride(override: SkillOverrideModel) {
    return {
      id: override.id,
      skill_name: override.skillName,
      character_id: override.characterId,
      damage_base_override: override.damageBaseOverride,
      multiplicador_override: override.multiplicadorOverride,
      created_at: formatarData(override.get("createdAt")),
      created_by: override.createdBy,
      updated_at: formatarData(override.get("updatedAt")),
      updated_by: override.updatedBy,
    };
  }

  /**
   * Devolve o mesmo conjunto de colunas que o SELECT * anterior entregava,
   * em snake_case — inclusive as legadas, que algumas telas ainda leem.
   */
  private mapearSkill(skill: SkillModel): SkillApi {
    return {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      raca_vinculada: skill.racaVinculada,
      skill_natureza_item: skill.skillNaturezaItem,
      skill_tipo_item: skill.skillTipoItem,
      skill_categoria_item: skill.skillCategoriaItem,
      skill_tipo_dano_item: skill.skillTipoDanoItem,
      multiplicador_atributo: skill.multiplicadorAtributo,
      damage_base: skill.damageBase,
      effect_description: skill.effectDescription,
      custo: skill.custo,
      cooldown: skill.cooldown,
      range: skill.range,
      required_class: skill.requiredClass,
      nivel_minimo_classe: skill.nivelMinimoClasse,
      damage_modifier: skill.damageModifier,
      damage_type: skill.damageType,
      cost: skill.cost,
      is_secret: skill.isSecret,
      required_class_id: skill.requiredClassId,
      created_at: formatarData(skill.get("createdAt")),
      updated_at: formatarData(skill.get("updatedAt")),
      created_by: skill.createdBy,
      updated_by: skill.updatedBy,
    };
  }
}
