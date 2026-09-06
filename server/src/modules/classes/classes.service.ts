import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { garantirAcessoAoPersonagem } from "../personagem/personagem-acesso.js";
import { ClasseModel, type RequisitosDeClasse } from "./models/classe.model.js";
import { ClasseSecretaReveladaModel } from "./models/classe-secreta-revelada.model.js";
import { ProgressaoClasseModel } from "./models/progressao-classe.model.js";
import type {
  EditarClasseDto,
  EditarProgressaoClasseDto,
  EntradaProgressaoClasseDto,
  SalvarClasseDto,
} from "./classes.dto.js";

/** snake_case porque é o formato que as telas já leem. */
export type ClasseApi = {
  id: number;
  name: string;
  tier: string;
  description: string;
  max_level: number;
  requirements: RequisitosDeClasse;
  stat_bonuses: Record<string, unknown>;
  starting_skills: string[];
  passive_skills: string[] | null;
  signature_skill: string | null;
  signature_skill_nivel: number | null;
  requer_deus: boolean;
  is_secret: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type TitularDeClasseSecreta = {
  id: number;
  name: string;
  username: string | null;
  avatar_url: string | null;
  status: string;
};

export type ClasseSecretaAdminApi = ClasseApi & {
  revelada: boolean;
  titular: TitularDeClasseSecreta | null;
  revealed_at: string | null;
};

export type ProgressaoClasseApi = {
  id: number;
  classe_id: number;
  classe_nome: string | null;
  nivel: number;
  xp_necessario: number;
  created_at: string | null;
  updated_at: string | null;
};

function formatarData(valor: unknown): string | null {
  return valor instanceof Date ? valor.toISOString() : null;
}

/**
 * Cada classe secreta com o personagem que a detém hoje. A versão anterior
 * fazia três consultas (classes, revelações, todos os personagens) e cruzava
 * tudo com mapas em memória; dois LEFT JOIN resolvem no banco.
 */
const SQL_CLASSES_SECRETAS_COM_TITULAR = `
  SELECT
    classes.id,
    classes.name,
    classes.tier,
    classes.description,
    classes.max_level,
    classes.requirements,
    classes.stat_bonuses,
    classes.starting_skills,
    classes.passive_skills,
    classes.signature_skill,
    classes.signature_skill_nivel,
    classes.requer_deus,
    classes.is_secret,
    classes.created_at,
    classes.updated_at,
    classe_secreta_revelada.revealed_at,
    characters.id       AS titular_id,
    characters.name     AS titular_name,
    characters.username AS titular_username,
    characters.avatar_url AS titular_avatar_url,
    characters.status   AS titular_status
  FROM classes
  LEFT JOIN classe_secreta_revelada
    ON classe_secreta_revelada.classe_id = classes.id
  LEFT JOIN characters
    ON characters.id = classe_secreta_revelada.character_id
   AND characters.deleted_at IS NULL
  WHERE classes.deleted_at IS NULL
    AND classes.is_secret = TRUE
  ORDER BY classes.name
`;

/** Progressão por classe já com o nome da classe, que antes vinha de uma segunda consulta. */
const SQL_PROGRESSAO_COM_NOME_DA_CLASSE = `
  SELECT
    class_level_progression.id,
    class_level_progression.classe_id,
    class_level_progression.nivel,
    class_level_progression.xp_necessario,
    class_level_progression.created_at,
    class_level_progression.updated_at,
    classes.name AS classe_nome
  FROM class_level_progression
  LEFT JOIN classes
    ON classes.id = class_level_progression.classe_id
   AND classes.deleted_at IS NULL
`;

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(ClasseModel)
    private readonly modeloClasse: typeof ClasseModel,
    @InjectModel(ProgressaoClasseModel)
    private readonly modeloProgressao: typeof ProgressaoClasseModel,
    @InjectModel(ClasseSecretaReveladaModel)
    private readonly modeloClasseSecretaRevelada: typeof ClasseSecretaReveladaModel,
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly sequelize: Sequelize,
  ) {}

  // ── Catálogo de classes ───────────────────────────────────────────────────

  /** Listagem pública: só as classes normais. */
  async listarPublico(): Promise<ClasseApi[]> {
    const encontradas = await this.modeloClasse.findAll({
      where: { isSecret: false },
      order: [
        ["tier", "ASC"],
        ["name", "ASC"],
      ],
    });
    return encontradas.map((classe) => this.mapear(classe));
  }

  /** Listagem do mestre: inclui as secretas. */
  async listarParaMestre(): Promise<ClasseApi[]> {
    const encontradas = await this.modeloClasse.findAll({
      order: [
        ["tier", "ASC"],
        ["name", "ASC"],
      ],
    });
    return encontradas.map((classe) => this.mapear(classe));
  }

  /**
   * O que um personagem específico enxerga: as classes normais mais as
   * secretas que o mestre revelou para ele.
   */
  async listarParaPersonagem(
    personagemId: number,
    usuario: UsuarioAutenticado,
  ): Promise<ClasseApi[]> {
    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }
    garantirAcessoAoPersonagem(personagem, usuario);

    const reveladas = await this.modeloClasseSecretaRevelada.findAll({
      where: { characterId: personagemId },
    });
    const idsReveladas = reveladas.map((revelacao) => revelacao.classeId);

    const encontradas = await this.modeloClasse.findAll({
      where: idsReveladas.length
        ? { [Op.or]: [{ isSecret: false }, { id: { [Op.in]: idsReveladas } }] }
        : { isSecret: false },
      order: [
        ["tier", "ASC"],
        ["name", "ASC"],
      ],
    });

    return encontradas.map((classe) => this.mapear(classe));
  }

  async criar(dados: SalvarClasseDto): Promise<ClasseApi> {
    const criada = await this.modeloClasse.create({
      name: dados.name.trim(),
      tier: dados.tier.trim(),
      description: dados.description.trim(),
      maxLevel: dados.maxLevel ?? 20,
      statBonuses: dados.statBonuses ?? {},
      requirements: dados.requirements ?? {},
      // starting_skills é NOT NULL no banco. A versão anterior gravava null
      // quando a lista vinha vazia, e o insert quebrava com violação de
      // not-null — nunca apareceu porque todas as 29 classes existentes têm
      // skill inicial.
      startingSkills: dados.startingSkills ?? [],
      passiveSkills: dados.passiveSkills?.length ? dados.passiveSkills : null,
      signatureSkill: dados.signatureSkill?.trim() || null,
      signatureSkillNivel: dados.signatureSkillNivel ?? null,
      requerDeus: dados.requerDeus ?? false,
      isSecret: dados.isSecret ?? false,
    });

    return this.mapear(criada);
  }

  async editar(id: number, dados: EditarClasseDto): Promise<ClasseApi> {
    const classe = await this.buscarClasseOuFalhar(id);

    if (dados.name !== undefined) classe.name = dados.name.trim();
    if (dados.tier !== undefined) classe.tier = dados.tier.trim();
    if (dados.description !== undefined) classe.description = dados.description.trim();
    if (dados.maxLevel !== undefined) classe.maxLevel = dados.maxLevel;
    if (dados.statBonuses !== undefined) classe.statBonuses = dados.statBonuses ?? {};
    if (dados.requirements !== undefined) classe.requirements = dados.requirements ?? {};
    if (dados.startingSkills !== undefined) classe.startingSkills = dados.startingSkills ?? [];
    if (dados.passiveSkills !== undefined) {
      classe.passiveSkills = dados.passiveSkills?.length ? dados.passiveSkills : null;
    }
    if (dados.signatureSkill !== undefined) {
      classe.signatureSkill = dados.signatureSkill?.trim() || null;
    }
    if (dados.signatureSkillNivel !== undefined) {
      classe.signatureSkillNivel = dados.signatureSkillNivel ?? null;
    }
    if (dados.requerDeus !== undefined) classe.requerDeus = dados.requerDeus;
    if (dados.isSecret !== undefined) classe.isSecret = dados.isSecret;

    await classe.save();
    return this.mapear(classe);
  }

  async deletar(id: number): Promise<void> {
    const classe = await this.buscarClasseOuFalhar(id);
    await classe.destroy();
  }

  // ── Classes secretas ──────────────────────────────────────────────────────

  async listarSecretasParaMestre(): Promise<ClasseSecretaAdminApi[]> {
    type Linha = Record<string, any>;
    const linhas = await this.sequelize.query<Linha>(SQL_CLASSES_SECRETAS_COM_TITULAR, {
      type: QueryTypes.SELECT,
    });

    return linhas.map((linha) => ({
      id: linha.id,
      name: linha.name,
      tier: linha.tier,
      description: linha.description,
      max_level: linha.max_level,
      requirements: linha.requirements ?? {},
      stat_bonuses: linha.stat_bonuses ?? {},
      starting_skills: linha.starting_skills ?? [],
      passive_skills: linha.passive_skills,
      signature_skill: linha.signature_skill,
      signature_skill_nivel: linha.signature_skill_nivel,
      requer_deus: linha.requer_deus,
      is_secret: linha.is_secret,
      created_at: formatarData(linha.created_at),
      updated_at: formatarData(linha.updated_at),
      revelada: linha.titular_id !== null,
      titular:
        linha.titular_id === null
          ? null
          : {
              id: linha.titular_id,
              name: linha.titular_name,
              username: linha.titular_username,
              avatar_url: linha.titular_avatar_url,
              status: linha.titular_status,
            },
      revealed_at: formatarData(linha.revealed_at),
    }));
  }

  async revelarClasseSecreta(classeId: number, personagemId: number): Promise<void> {
    const classe = await this.buscarClasseOuFalhar(classeId);
    if (!classe.isSecret) {
      throw new BadRequestException("Esta classe não é secreta.");
    }

    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }
    if (personagem.status === "morto") {
      throw new BadRequestException(
        "Não é possível revelar uma classe para um personagem morto.",
      );
    }

    const revelacaoAtual = await this.modeloClasseSecretaRevelada.findOne({
      where: { classeId },
    });

    if (revelacaoAtual && revelacaoAtual.characterId !== personagemId) {
      throw new ConflictException(
        "Esta classe secreta já foi revelada para outro personagem ativo.",
      );
    }
    // Já é do mesmo personagem: nada a fazer, e refazer só trocaria a data.
    if (revelacaoAtual) return;

    await this.modeloClasseSecretaRevelada.create({
      classeId,
      characterId: personagemId,
      revealedAt: new Date(),
    });
  }

  async revogarClasseSecreta(classeId: number): Promise<void> {
    const revelacao = await this.modeloClasseSecretaRevelada.findOne({ where: { classeId } });
    if (!revelacao) {
      throw new NotFoundException("Esta classe secreta não está revelada para ninguém.");
    }
    await revelacao.destroy();
  }

  // ── Progressão de XP por classe ───────────────────────────────────────────

  async listarProgressao(classeId?: number): Promise<ProgressaoClasseApi[]> {
    const filtro = classeId === undefined ? "" : " WHERE class_level_progression.classe_id = :classeId";

    const linhas = await this.sequelize.query<{
      id: number;
      classe_id: number;
      nivel: number;
      xp_necessario: number;
      created_at: Date | null;
      updated_at: Date | null;
      classe_nome: string | null;
    }>(
      `${SQL_PROGRESSAO_COM_NOME_DA_CLASSE}${filtro}
       ORDER BY class_level_progression.classe_id, class_level_progression.nivel`,
      { replacements: { classeId }, type: QueryTypes.SELECT },
    );

    return linhas.map((linha) => ({
      id: linha.id,
      classe_id: linha.classe_id,
      classe_nome: linha.classe_nome,
      nivel: linha.nivel,
      xp_necessario: linha.xp_necessario,
      created_at: formatarData(linha.created_at),
      updated_at: formatarData(linha.updated_at),
    }));
  }

  async criarProgressao(dados: EntradaProgressaoClasseDto): Promise<ProgressaoClasseApi> {
    await this.buscarClasseOuFalhar(dados.classe_id);

    const jaExiste = await this.modeloProgressao.findOne({
      where: { classeId: dados.classe_id, nivel: dados.nivel },
    });
    if (jaExiste) {
      throw new ConflictException("Já existe progressão para este nível nesta classe.");
    }

    const criada = await this.modeloProgressao.create({
      classeId: dados.classe_id,
      nivel: dados.nivel,
      xpNecessario: dados.xp_necessario,
    });

    return (await this.listarProgressao(criada.classeId)).find(
      (entrada) => entrada.id === criada.id,
    )!;
  }

  async editarProgressao(
    id: number,
    dados: EditarProgressaoClasseDto,
  ): Promise<ProgressaoClasseApi> {
    const registro = await this.modeloProgressao.findByPk(id);
    if (!registro) {
      throw new NotFoundException("Progressão não encontrada.");
    }

    if (dados.xp_necessario !== undefined) registro.xpNecessario = dados.xp_necessario;
    await registro.save();

    return (await this.listarProgressao(registro.classeId)).find(
      (entrada) => entrada.id === id,
    )!;
  }

  /**
   * Apaga de verdade — ver a nota em ProgressaoClasseModel sobre o UNIQUE
   * total impedir o soft delete nesta tabela.
   */
  async deletarProgressao(id: number): Promise<void> {
    const registro = await this.modeloProgressao.findByPk(id);
    if (!registro) {
      throw new NotFoundException("Progressão não encontrada.");
    }
    await registro.destroy();
  }

  /**
   * Grava a tabela inteira de uma classe de uma vez (é assim que a tela de
   * progressão salva). Percorre uma a uma de propósito: um bulkCreate com
   * updateOnDuplicate não dispararia os hooks que preenchem a auditoria —
   * mesma decisão tomada em LevelProgressionService.
   */
  async salvarProgressaoEmLote(
    entradas: EntradaProgressaoClasseDto[],
  ): Promise<ProgressaoClasseApi[]> {
    if (entradas.length === 0) {
      throw new BadRequestException("Nenhuma entrada fornecida.");
    }

    const classeIds = [...new Set(entradas.map((entrada) => entrada.classe_id))];
    for (const classeId of classeIds) {
      await this.buscarClasseOuFalhar(classeId);
    }

    for (const entrada of entradas) {
      const existente = await this.modeloProgressao.findOne({
        where: { classeId: entrada.classe_id, nivel: entrada.nivel },
      });

      if (existente) {
        existente.xpNecessario = entrada.xp_necessario;
        await existente.save();
        continue;
      }

      await this.modeloProgressao.create({
        classeId: entrada.classe_id,
        nivel: entrada.nivel,
        xpNecessario: entrada.xp_necessario,
      });
    }

    const salvas = await Promise.all(classeIds.map((classeId) => this.listarProgressao(classeId)));
    return salvas.flat();
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  private async buscarClasseOuFalhar(id: number): Promise<ClasseModel> {
    const classe = await this.modeloClasse.findByPk(id);
    if (!classe) {
      throw new NotFoundException("Classe não encontrada.");
    }
    return classe;
  }

  private mapear(classe: ClasseModel): ClasseApi {
    return {
      id: classe.id,
      name: classe.name,
      tier: classe.tier,
      description: classe.description,
      max_level: classe.maxLevel,
      requirements: classe.requirements ?? {},
      stat_bonuses: classe.statBonuses ?? {},
      starting_skills: classe.startingSkills ?? [],
      passive_skills: classe.passiveSkills,
      signature_skill: classe.signatureSkill,
      signature_skill_nivel: classe.signatureSkillNivel,
      requer_deus: classe.requerDeus,
      is_secret: classe.isSecret,
      created_at: formatarData(classe.get("createdAt")),
      updated_at: formatarData(classe.get("updatedAt")),
    };
  }
}
