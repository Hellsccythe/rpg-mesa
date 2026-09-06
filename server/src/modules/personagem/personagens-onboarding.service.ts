import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PersonagemModel } from "./models/personagem.model.js";
import { garantirAcessoAoPersonagem } from "./personagem-acesso.js";
import { mapearPersonagemParaApi, type PersonagemApi } from "./personagem-api.mapper.js";
import type {
  ConcluirOnboardingDto,
  DefinirAtributosDto,
  EquipamentoInicialDto,
  EscolherSkillInicialDto,
} from "./personagens-onboarding.dto.js";

/** Pontos distribuíveis na etapa de atributos. O frontend usa o mesmo número. */
const TOTAL_PONTOS_ATRIBUTO = 10;

/** Pontos de skill que a classe inicial concede ao ser escolhida. */
const PONTOS_SKILL_CLASSE_INICIAL = 2;

type Atributos = {
  aura: number;
  forca: number;
  destreza: number;
  resistencia: number;
  inteligencia: number;
};

const ATRIBUTOS_ZERADOS: Atributos = {
  aura: 0,
  forca: 0,
  destreza: 0,
  resistencia: 0,
  inteligencia: 0,
};

type ClasseEscolhida = {
  classId: string;
  name: string;
  tier: string;
  level: number;
  chosenSkills: string[];
  skillPoints: number;
};

/**
 * As 6 etapas que todo jogador novo atravessa depois de ter o personagem
 * aprovado: raça → classe → passado → atributos → deus → equipamentos.
 *
 * Todas são permanentes de propósito — cada uma recusa a segunda tentativa.
 * O que marca "já escolhi" varia conforme onde o dado mora: as três primeiras
 * checam a própria coluna (raca_id, classe_id, passado_id), e as duas que
 * gravam só dentro do JSONB precisam de uma marca própria (data.atributos e
 * data.deusEtapaConcluida) — sem ela, escolher "nenhum deus" seria
 * indistinguível de ainda não ter passado pela etapa.
 */
@Injectable()
export class PersonagensOnboardingService {
  constructor(
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly sequelize: Sequelize,
  ) {}

  // ── Etapa 1: raça ─────────────────────────────────────────────────────────

  async escolherRaca(
    personagemId: number,
    racaId: number,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarPermitidoOuFalhar(personagemId, usuario);

    if (personagem.racaId !== null) {
      throw new ConflictException("Raça já foi escolhida e não pode ser alterada.");
    }
    await this.garantirRegistroAtivo("racas", racaId, "Raça não encontrada.");

    personagem.racaId = racaId;
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  // ── Etapa 2: classe inicial (+ skill inicial) ─────────────────────────────

  async escolherClasseInicial(
    personagemId: number,
    classeId: number,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarPermitidoOuFalhar(personagemId, usuario);

    if (personagem.classeId !== null) {
      throw new ConflictException("Classe já foi escolhida e não pode ser alterada.");
    }

    const classe = await this.buscarClasseOuFalhar(classeId);
    const dados = this.lerDados(personagem);
    const classes = this.lerClasses(dados);

    if (!classes.some((entrada) => entrada.classId === String(classeId))) {
      classes.push({
        classId: String(classeId),
        name: classe.name,
        tier: classe.tier ?? "",
        level: 1,
        chosenSkills: [],
        skillPoints: PONTOS_SKILL_CLASSE_INICIAL,
      });
    }

    personagem.classeId = classeId;
    personagem.data = { ...dados, classes };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  /**
   * Gasta um ponto de skill da classe para adquirir uma das starting_skills.
   * A skill entra em dois lugares: em data.classes[].chosenSkills (o que a
   * classe já concedeu) e em data.skills (a lista que o dashboard exibe).
   */
  async escolherSkillInicial(
    personagemId: number,
    dados: EscolherSkillInicialDto,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarPermitidoOuFalhar(personagemId, usuario);

    const dadosPersonagem = this.lerDados(personagem);
    const classes = this.lerClasses(dadosPersonagem);
    const posicaoDaClasse = classes.findIndex(
      (entrada) => entrada.classId === String(dados.classId),
    );

    if (posicaoDaClasse === -1) {
      throw new NotFoundException("Classe não encontrada no personagem.");
    }

    const classeDoPersonagem = classes[posicaoDaClasse];
    const nomeDaSkill = dados.skillName.trim();
    const skillsEscolhidas = Array.isArray(classeDoPersonagem.chosenSkills)
      ? [...classeDoPersonagem.chosenSkills]
      : [];

    if (skillsEscolhidas.some((skill) => skill.toLowerCase() === nomeDaSkill.toLowerCase())) {
      throw new ConflictException("Skill já escolhida para esta classe.");
    }

    const pontosDisponiveis =
      typeof classeDoPersonagem.skillPoints === "number" ? classeDoPersonagem.skillPoints : 0;
    if (pontosDisponiveis < 1) {
      throw new BadRequestException("Sem pontos de skill disponíveis para esta classe.");
    }

    const nivelAtual = typeof classeDoPersonagem.level === "number" ? classeDoPersonagem.level : 1;
    skillsEscolhidas.push(nomeDaSkill);
    classes[posicaoDaClasse] = {
      ...classeDoPersonagem,
      chosenSkills: skillsEscolhidas,
      skillPoints: pontosDisponiveis - 1,
      level: nivelAtual + 1,
    };

    const skillsDoPersonagem = Array.isArray(dadosPersonagem.skills)
      ? [...(dadosPersonagem.skills as Array<Record<string, unknown>>)]
      : [];
    const jaTemNaLista = skillsDoPersonagem.some(
      (skill) => String(skill?.name ?? "").toLowerCase() === nomeDaSkill.toLowerCase(),
    );

    if (!jaTemNaLista) {
      skillsDoPersonagem.push({
        name: nomeDaSkill,
        source: "starting_skill",
        addedBy: usuario.email,
        addedAt: new Date().toISOString(),
      });
    }

    personagem.data = { ...dadosPersonagem, classes, skills: skillsDoPersonagem };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  // ── Etapa 3: passado ──────────────────────────────────────────────────────

  async escolherPassado(
    personagemId: number,
    passadoId: number,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarPermitidoOuFalhar(personagemId, usuario);

    if (personagem.passadoId !== null) {
      throw new ConflictException("Passado já foi escolhido e não pode ser alterado.");
    }
    await this.garantirRegistroAtivo("passados", passadoId, "Passado não encontrado.");

    personagem.passadoId = passadoId;
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  // ── Etapa 4: atributos ────────────────────────────────────────────────────

  /**
   * Guarda três coisas separadas de propósito: o que o jogador distribuiu
   * (atributos_base), o bônus que o passado deu (atributos_bonus_passado) e a
   * soma dos dois (atributos), que é o valor usado em jogo. Sem guardar as
   * parcelas, mexer no bônus de um passado depois não teria como recalcular
   * os personagens que já o escolheram.
   */
  async definirAtributos(
    personagemId: number,
    atributosDistribuidos: DefinirAtributosDto,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarPermitidoOuFalhar(personagemId, usuario);

    const dados = this.lerDados(personagem);
    if (dados.atributos != null) {
      throw new ConflictException("Atributos já foram definidos e não podem ser alterados.");
    }

    const soma =
      atributosDistribuidos.aura +
      atributosDistribuidos.forca +
      atributosDistribuidos.destreza +
      atributosDistribuidos.resistencia +
      atributosDistribuidos.inteligencia;

    if (soma !== TOTAL_PONTOS_ATRIBUTO) {
      throw new BadRequestException(
        `Os atributos devem somar exatamente ${TOTAL_PONTOS_ATRIBUTO} pontos (somou ${soma}).`,
      );
    }

    const bonusDoPassado = await this.buscarBonusDoPassado(personagem.passadoId);

    personagem.data = {
      ...dados,
      atributos: {
        aura: atributosDistribuidos.aura + bonusDoPassado.aura,
        forca: atributosDistribuidos.forca + bonusDoPassado.forca,
        destreza: atributosDistribuidos.destreza + bonusDoPassado.destreza,
        resistencia: atributosDistribuidos.resistencia + bonusDoPassado.resistencia,
        inteligencia: atributosDistribuidos.inteligencia + bonusDoPassado.inteligencia,
      },
      atributos_base: { ...atributosDistribuidos },
      atributos_bonus_passado: bonusDoPassado,
    };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  // ── Etapa 5: deus (pode ser pulada) ───────────────────────────────────────

  async escolherDeus(
    personagemId: number,
    deusId: number | null,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarPermitidoOuFalhar(personagemId, usuario);

    const dados = this.lerDados(personagem);
    if (dados.deusEtapaConcluida === true) {
      throw new ConflictException("Etapa de deus já foi concluída.");
    }

    if (deusId === null) {
      await this.garantirQueClassePermitePularDeus(personagem.classeId);
    } else {
      await this.garantirRegistroAtivo("gods", deusId, "Deus não encontrado.");
      personagem.deusId = deusId;
    }

    personagem.data = { ...dados, deusEtapaConcluida: true };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  // ── Etapa 6: equipamentos iniciais e conclusão ────────────────────────────

  async concluirOnboarding(
    personagemId: number,
    dados: ConcluirOnboardingDto,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarPermitidoOuFalhar(personagemId, usuario);

    if (personagem.onboardingCompleto) {
      throw new ConflictException("Onboarding já foi concluído.");
    }

    const dadosPersonagem = this.lerDados(personagem);
    const forca = this.lerForca(dadosPersonagem);
    const pesoMaximo = 2 + forca * 2;
    const pesoTotal = dados.equipamentos.reduce(
      (acumulado, equipamento) => acumulado + equipamento.peso,
      0,
    );

    if (pesoTotal > pesoMaximo) {
      throw new BadRequestException(
        `Peso total (${pesoTotal.toFixed(1)} kg) excede a capacidade de carga (${pesoMaximo} kg).`,
      );
    }

    personagem.data = {
      ...dadosPersonagem,
      equipamentos_iniciais: dados.equipamentos as EquipamentoInicialDto[],
    };
    personagem.onboardingCompleto = true;
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  private async buscarPermitidoOuFalhar(
    personagemId: number,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemModel> {
    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }
    garantirAcessoAoPersonagem(personagem, usuario);
    return personagem;
  }

  /**
   * Confere que o id existe e não está deletado. O nome da tabela nunca vem
   * do usuário — só destas chamadas, com valor fixo — então interpolá-lo é
   * seguro; o id continua indo como parâmetro.
   */
  private async garantirRegistroAtivo(
    tabela: "racas" | "passados" | "gods",
    id: number,
    mensagemDeErro: string,
  ): Promise<void> {
    const encontrados = await this.sequelize.query<{ id: number }>(
      `SELECT id FROM ${tabela} WHERE id = :id AND deleted_at IS NULL LIMIT 1`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );

    if (encontrados.length === 0) {
      throw new NotFoundException(mensagemDeErro);
    }
  }

  private async buscarClasseOuFalhar(
    classeId: number,
  ): Promise<{ id: number; name: string; tier: string | null }> {
    const encontradas = await this.sequelize.query<{
      id: number;
      name: string;
      tier: string | null;
    }>(
      `SELECT id, name, tier FROM classes
        WHERE id = :classeId AND deleted_at IS NULL
        LIMIT 1`,
      { replacements: { classeId }, type: QueryTypes.SELECT },
    );

    if (encontradas.length === 0) {
      throw new NotFoundException("Classe não encontrada.");
    }
    return encontradas[0];
  }

  private async garantirQueClassePermitePularDeus(classeId: number | null): Promise<void> {
    if (classeId === null) return;

    const encontradas = await this.sequelize.query<{ requer_deus: boolean | null }>(
      `SELECT requer_deus FROM classes WHERE id = :classeId LIMIT 1`,
      { replacements: { classeId }, type: QueryTypes.SELECT },
    );

    if (encontradas[0]?.requer_deus === true) {
      throw new BadRequestException("Esta classe exige que um deus seja escolhido.");
    }
  }

  private async buscarBonusDoPassado(passadoId: number | null): Promise<Atributos> {
    if (passadoId === null) return { ...ATRIBUTOS_ZERADOS };

    const encontrados = await this.sequelize.query<{
      atributo_bonus: Partial<Atributos> | null;
    }>(`SELECT atributo_bonus FROM passados WHERE id = :passadoId LIMIT 1`, {
      replacements: { passadoId },
      type: QueryTypes.SELECT,
    });

    const bonus = encontrados[0]?.atributo_bonus;
    if (!bonus) return { ...ATRIBUTOS_ZERADOS };

    return {
      aura: Number(bonus.aura ?? 0),
      forca: Number(bonus.forca ?? 0),
      destreza: Number(bonus.destreza ?? 0),
      resistencia: Number(bonus.resistencia ?? 0),
      inteligencia: Number(bonus.inteligencia ?? 0),
    };
  }

  private lerDados(personagem: PersonagemModel): Record<string, unknown> {
    const dados = personagem.data;
    return dados && typeof dados === "object" ? { ...dados } : {};
  }

  private lerClasses(dados: Record<string, unknown>): ClasseEscolhida[] {
    return Array.isArray(dados.classes) ? [...(dados.classes as ClasseEscolhida[])] : [];
  }

  private lerForca(dados: Record<string, unknown>): number {
    const atributos = dados.atributos as Partial<Atributos> | undefined;
    return typeof atributos?.forca === "number" ? atributos.forca : 0;
  }
}
