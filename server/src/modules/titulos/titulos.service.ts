import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { obterUsuarioAutenticadoDoContexto } from "../../common/cls/contexto-requisicao.js";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { mapearPersonagemParaApi, type PersonagemApi } from "../personagem/personagem-api.mapper.js";
import { TituloModel, type BonusDeAtributo } from "./models/titulo.model.js";
import type {
  AdicionarTituloPersonagemDto,
  EditarTituloDto,
  SalvarTituloDto,
} from "./titulos.dto.js";

export type SkillResumo = { id: number; name: string };

export type TituloApi = {
  id: number;
  name: string;
  tier: string;
  description: string;
  skill_ids: number[];
  skills: SkillResumo[];
  bonuses: BonusDeAtributo;
  requirements: Record<string, unknown>;
  is_hidden: boolean;
  linked_hidden_class: boolean;
  classe_secreta_id: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type LinhaDeTitulo = Omit<TituloApi, "created_at" | "updated_at"> & {
  created_at: Date | null;
  updated_at: Date | null;
};

/**
 * O LEFT JOIN LATERAL expande skill_ids em linhas (unnest ... WITH ORDINALITY
 * preserva a ordem do array) e reagrupa como JSON. Substitui o "buscar todos
 * os títulos, juntar os ids, buscar as skills e montar um mapa em memória" da
 * versão anterior.
 *
 * O JOIN é LEFT de propósito: skill deletada continua aparecendo como
 * "Skill #12", igual ao comportamento antigo.
 */
const SQL_LISTAR_TITULOS = `
  SELECT
    titles.id,
    titles.name,
    titles.tier,
    titles.description,
    titles.skill_ids,
    titles.bonuses,
    titles.requirements,
    titles.is_hidden,
    titles.linked_hidden_class,
    titles.classe_secreta_id,
    titles.created_at,
    titles.updated_at,
    COALESCE(skills_do_titulo.lista, '[]'::json) AS skills
  FROM titles
  LEFT JOIN LATERAL (
    SELECT json_agg(
             json_build_object(
               'id', skill_referenciada.skill_id,
               'name', COALESCE(skills.name, 'Skill #' || skill_referenciada.skill_id)
             ) ORDER BY skill_referenciada.posicao
           ) AS lista
    FROM unnest(titles.skill_ids) WITH ORDINALITY AS skill_referenciada(skill_id, posicao)
    LEFT JOIN skills
      ON skills.id = skill_referenciada.skill_id
     AND skills.deleted_at IS NULL
  ) AS skills_do_titulo ON TRUE
  WHERE titles.deleted_at IS NULL
`;

@Injectable()
export class TitulosService {
  constructor(
    @InjectModel(TituloModel)
    private readonly modeloTitulo: typeof TituloModel,
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly sequelize: Sequelize,
  ) {}

  // ── Leitura (SQL cru com JOIN) ────────────────────────────────────────────

  async listarCatalogo(): Promise<TituloApi[]> {
    const linhas = await this.sequelize.query<LinhaDeTitulo>(
      `${SQL_LISTAR_TITULOS} ORDER BY titles.name`,
      { type: QueryTypes.SELECT },
    );
    return linhas.map((linha) => this.converterLinha(linha));
  }

  // ── Escrita (ORM, pra os hooks de auditoria dispararem) ───────────────────

  async criar(dados: SalvarTituloDto): Promise<TituloApi> {
    const criado = await this.modeloTitulo.create({
      name: dados.name.trim(),
      tier: dados.tier.trim(),
      description: dados.description.trim(),
      skillIds: dados.skillIds ?? [],
      // bonuses é NOT NULL com default '{}'. A versão anterior gravava null
      // quando não vinha nada, e o insert quebrava com violação de not-null.
      bonuses: dados.bonuses ?? {},
      isHidden: dados.is_hidden ?? false,
      linkedHiddenClass: dados.linked_hidden_class ?? false,
      classeSecretaId: dados.classe_secreta_id ?? null,
    });

    return this.buscarOuFalhar(criado.id);
  }

  async editar(id: number, dados: EditarTituloDto): Promise<TituloApi> {
    const titulo = await this.modeloTitulo.findByPk(id);
    if (!titulo) {
      throw new NotFoundException("Título não encontrado.");
    }

    if (dados.name !== undefined) titulo.name = dados.name.trim();
    if (dados.tier !== undefined) titulo.tier = dados.tier.trim();
    if (dados.description !== undefined) titulo.description = dados.description.trim();
    if (dados.skillIds !== undefined) titulo.skillIds = dados.skillIds;
    if (dados.bonuses !== undefined) titulo.bonuses = dados.bonuses ?? {};
    if (dados.is_hidden !== undefined) titulo.isHidden = dados.is_hidden;
    if (dados.linked_hidden_class !== undefined) {
      titulo.linkedHiddenClass = dados.linked_hidden_class;
    }
    // A rota Express não repassava este campo, então vincular ou desvincular
    // uma classe secreta pela tela de edição não fazia nada — o formulário
    // enviava, o backend descartava em silêncio.
    if (dados.classe_secreta_id !== undefined) {
      titulo.classeSecretaId = dados.classe_secreta_id;
    }

    await titulo.save();
    return this.buscarOuFalhar(id);
  }

  async deletar(id: number): Promise<void> {
    const titulo = await this.modeloTitulo.findByPk(id);
    if (!titulo) {
      throw new NotFoundException("Título não encontrado.");
    }
    await titulo.destroy();
  }

  // ── Título concedido a um personagem ──────────────────────────────────────

  async adicionarEmPersonagem(
    personagemId: number,
    dados: AdicionarTituloPersonagemDto,
  ): Promise<PersonagemApi> {
    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }

    const dadosPersonagem = (personagem.data ?? {}) as Record<string, unknown>;
    const titulos = Array.isArray(dadosPersonagem.titles)
      ? [...(dadosPersonagem.titles as Array<Record<string, unknown>>)]
      : [];

    const nomeDoTitulo = dados.titleName.trim();
    const jaTem = titulos.some(
      (titulo) => String(titulo?.name ?? "").toLowerCase() === nomeDoTitulo.toLowerCase(),
    );

    if (!jaTem) {
      titulos.push({
        name: nomeDoTitulo,
        addedBy: obterUsuarioAutenticadoDoContexto()?.email ?? "master",
        addedAt: new Date().toISOString(),
      });
    }

    personagem.data = { ...dadosPersonagem, titles: titulos };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  private async buscarOuFalhar(id: number): Promise<TituloApi> {
    const linhas = await this.sequelize.query<LinhaDeTitulo>(
      `${SQL_LISTAR_TITULOS} AND titles.id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );

    if (linhas.length === 0) {
      throw new NotFoundException("Título não encontrado.");
    }
    return this.converterLinha(linhas[0]);
  }

  private converterLinha(linha: LinhaDeTitulo): TituloApi {
    return {
      ...linha,
      created_at: linha.created_at instanceof Date ? linha.created_at.toISOString() : null,
      updated_at: linha.updated_at instanceof Date ? linha.updated_at.toISOString() : null,
    };
  }
}
