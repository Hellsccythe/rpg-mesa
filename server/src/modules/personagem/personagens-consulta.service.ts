import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, QueryTypes, type WhereOptions } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { montarUrlPublica } from "../../common/storage/armazenamento-arquivos.service.js";
import { PersonagemModel } from "./models/personagem.model.js";
import { garantirAcessoAoPersonagem } from "./personagem-acesso.js";
import { mapearPersonagemParaApi, type PersonagemApi } from "./personagem-api.mapper.js";

export type PersonagemPublico = {
  characterId: number;
  name: string;
  level: number;
  avatarUrl: string | null;
  classe: string | null;
  avatarFocalPoint: string | null;
  modalHeroPosition: string | null;
};

export type LayoutPagina = {
  titulo: string;
  subtitulo: string;
  backgroundImage: string;
};

export type FiltroMeusPersonagens = {
  nome?: string;
  minLevel?: number;
  maxLevel?: number;
  campaignId?: number | null;
};

const LAYOUT_PADRAO: LayoutPagina = {
  titulo: "Caminho Sem Volta",
  subtitulo: "Escolha seu destino ou crie um novo herói",
  backgroundImage: "/login-bg.jpg",
};

type LinhaPersonagemPublico = {
  id: number;
  name: string;
  level: number;
  avatar_url: string | null;
  data: Record<string, any>;
  classe_nome: string | null;
};

/**
 * O nome da classe pode estar em dois lugares: gravado dentro de data.classes
 * (o caminho normal) ou apenas como classe_id, em personagens antigos. A
 * versão anterior resolvia isso com uma segunda consulta à tabela classes e
 * um mapa em memória; aqui um LEFT JOIN dá conta.
 */
const SQL_PERSONAGENS_PUBLICOS = `
  SELECT
    characters.id,
    characters.name,
    characters.level,
    characters.avatar_url,
    characters.data,
    classes.name AS classe_nome
  FROM characters
  LEFT JOIN classes
    ON classes.id = characters.classe_id
   AND classes.deleted_at IS NULL
  WHERE characters.deleted_at IS NULL
`;

@Injectable()
export class PersonagensConsultaService {
  constructor(
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly sequelize: Sequelize,
  ) {}

  /** Tela de entrada: layout da campanha (quando houver) e os personagens dela. */
  async montarPaginaInicial(
    campaignSlug?: string,
  ): Promise<{ layout: LayoutPagina; personagens: PersonagemPublico[] }> {
    const campanha = campaignSlug ? await this.buscarCampanhaPorSlug(campaignSlug) : null;

    return {
      layout: campanha
        ? {
            titulo: campanha.name,
            subtitulo: campanha.description ?? LAYOUT_PADRAO.subtitulo,
            backgroundImage: LAYOUT_PADRAO.backgroundImage,
          }
        : LAYOUT_PADRAO,
      personagens: await this.listarPublico(campanha?.id ?? null),
    };
  }

  async listarPublico(campaignId: number | null): Promise<PersonagemPublico[]> {
    const filtroCampanha = campaignId === null ? "" : " AND characters.campaign_id = :campaignId";

    const linhas = await this.sequelize.query<LinhaPersonagemPublico>(
      `${SQL_PERSONAGENS_PUBLICOS}${filtroCampanha} ORDER BY characters.created_at DESC`,
      { replacements: { campaignId }, type: QueryTypes.SELECT },
    );

    return linhas.map((linha) => {
      const dados = linha.data ?? {};
      const classeEmData = Array.isArray(dados.classes) ? dados.classes[0]?.name : undefined;

      return {
        characterId: linha.id,
        name: linha.name,
        level: linha.level,
        avatarUrl: montarUrlPublica(linha.avatar_url) || null,
        classe: classeEmData ?? linha.classe_nome ?? null,
        avatarFocalPoint: (dados.avatarFocalPoint as string | undefined) ?? null,
        modalHeroPosition: (dados.modalHeroPosition as string | undefined) ?? null,
      };
    });
  }

  /**
   * Personagens do jogador logado, com os filtros opcionais da tela. Sem JOIN
   * aqui, então usa o ORM: montar a cláusula com os operadores do Sequelize
   * evita concatenar SQL à mão e já cuida da parametrização.
   */
  async listarDoUsuario(
    usuarioId: number,
    filtro: FiltroMeusPersonagens = {},
  ): Promise<PersonagemApi[]> {
    const condicoes: WhereOptions<PersonagemModel> = { userId: usuarioId };

    if (filtro.nome?.trim()) {
      Object.assign(condicoes, { name: { [Op.iLike]: `%${filtro.nome.trim()}%` } });
    }

    if (filtro.minLevel !== undefined || filtro.maxLevel !== undefined) {
      const faixaDeNivel: Record<symbol, number> = {};
      if (filtro.minLevel !== undefined) faixaDeNivel[Op.gte] = filtro.minLevel;
      if (filtro.maxLevel !== undefined) faixaDeNivel[Op.lte] = filtro.maxLevel;
      Object.assign(condicoes, { level: faixaDeNivel });
    }

    // null vira "IS NULL" no Sequelize, que é o filtro de "sem campanha".
    if (filtro.campaignId !== undefined) {
      Object.assign(condicoes, { campaignId: filtro.campaignId });
    }

    const encontrados = await this.modeloPersonagem.findAll({
      where: condicoes,
      order: [["createdAt", "DESC"]],
    });

    return encontrados.map(mapearPersonagemParaApi);
  }

  /**
   * Um personagem específico. Não há rota separada para o mestre: o tipo do
   * usuário já vem no JWT, então a mesma rota serve os dois — o mestre abre
   * qualquer personagem, o jogador só o seu.
   */
  async obterPorId(personagemId: number, usuario: UsuarioAutenticado): Promise<PersonagemApi> {
    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }

    garantirAcessoAoPersonagem(personagem, usuario);
    await this.garantirClassesEmData(personagem);
    return mapearPersonagemParaApi(personagem);
  }

  /**
   * Personagens antigos têm classe_id preenchido mas data.classes vazio — a
   * coluna passou a existir depois que o JSONB já estava em uso. Sem esta
   * reconstrução, as telas de classe não acham nível nem pontos de skill.
   */
  private async garantirClassesEmData(personagem: PersonagemModel): Promise<void> {
    const dados = (personagem.data ?? {}) as Record<string, unknown>;
    const classes = Array.isArray(dados.classes) ? dados.classes : [];
    if (classes.length > 0 || personagem.classeId === null) return;

    const encontradas = await this.sequelize.query<{ name: string; tier: string | null }>(
      `SELECT name, tier FROM classes
        WHERE id = :classeId AND deleted_at IS NULL
        LIMIT 1`,
      { replacements: { classeId: personagem.classeId }, type: QueryTypes.SELECT },
    );

    const classe = encontradas[0];
    if (!classe) return;

    personagem.data = {
      ...dados,
      classes: [
        {
          classId: String(personagem.classeId),
          name: classe.name,
          tier: classe.tier ?? "",
          level: 1,
          chosenSkills: [],
          skillPoints: 2,
          xp: 0,
        },
      ],
    };
    await personagem.save();
  }

  private async buscarCampanhaPorSlug(
    slug: string,
  ): Promise<{ id: number; name: string; description: string | null } | null> {
    const encontradas = await this.sequelize.query<{
      id: number;
      name: string;
      description: string | null;
    }>(
      `SELECT id, name, description FROM campaigns
        WHERE slug = :slug AND deleted_at IS NULL
        LIMIT 1`,
      { replacements: { slug: slug.trim() }, type: QueryTypes.SELECT },
    );

    return encontradas[0] ?? null;
  }
}
