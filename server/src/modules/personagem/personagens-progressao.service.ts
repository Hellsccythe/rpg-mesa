import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PersonagemModel } from "./models/personagem.model.js";
import { garantirAcessoAoPersonagem } from "./personagem-acesso.js";
import { mapearPersonagemParaApi, type PersonagemApi } from "./personagem-api.mapper.js";
import { PericiasService } from "../pericias/pericias.service.js";
import type {
  AtribuirXpDeClasseDto,
  AtribuirXpDto,
  DistribuirPontosAtributoDto,
  EscolherClasseDto,
  PontosDeClasseDto,
  SkillPointsDeClasseDto,
} from "./personagens-progressao.dto.js";

const NIVEL_MAXIMO_DE_CLASSE = 20;
const NIVEL_MAXIMO_DO_PERSONAGEM = 100;
const NIVEL_MINIMO_PARA_SEGUNDA_CLASSE_BASE = 10;
const MAXIMO_DE_CLASSES_BASE = 2;

const ATRIBUTOS_VALIDOS = ["aura", "forca", "destreza", "resistencia", "inteligencia"] as const;

type ClasseDoPersonagem = {
  classId: string;
  name: string;
  tier: string;
  level: number;
  chosenSkills: string[];
  skillPoints?: number;
  xp?: number;
};

/** Remove acentos para comparar tier ("Híbrida" e "Hibrida" contam igual). */
function normalizarTier(tier: string): string {
  return tier
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

@Injectable()
export class PersonagensProgressaoService {
  constructor(
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly sequelize: Sequelize,
    private readonly servicoPericias: PericiasService,
  ) {}

  // ── Ações do jogador ──────────────────────────────────────────────────────

  /** Gasta 1 ponto de classe para adquirir uma classe nova. */
  async escolherClasse(
    personagemId: number,
    dados: EscolherClasseDto,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarPermitidoOuFalhar(personagemId, usuario);
    const dadosPersonagem = this.lerDados(personagem);
    const pontosDeClasse = this.lerNumero(dadosPersonagem.classPoints);

    if (pontosDeClasse < 1) {
      throw new BadRequestException("Pontos de classe insuficientes.");
    }

    const classes = this.lerClasses(dadosPersonagem);
    if (classes.some((classe) => String(classe.classId) === String(dados.classId))) {
      throw new ConflictException("Você já possui esta classe.");
    }

    await this.garantirRequisitosDaClasse(dados, classes);

    classes.push({
      classId: dados.classId,
      name: dados.className,
      tier: dados.classTier,
      level: 1,
      chosenSkills: [],
    });

    personagem.data = { ...dadosPersonagem, classes, classPoints: pontosDeClasse - 1 };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  /**
   * Converte 1 ponto de classe em 1 ponto de skill. O nível da classe NÃO
   * sobe aqui — sobe quando o ponto de skill for gasto numa habilidade.
   */
  async levelarClasse(
    personagemId: number,
    classId: string,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarPermitidoOuFalhar(personagemId, usuario);
    const dadosPersonagem = this.lerDados(personagem);
    const pontosDeClasse = this.lerNumero(dadosPersonagem.classPoints);

    if (pontosDeClasse < 1) {
      throw new BadRequestException("Pontos de classe insuficientes.");
    }

    const classes = this.lerClasses(dadosPersonagem);
    const posicao = this.acharClasseOuFalhar(classes, classId);

    classes[posicao] = {
      ...classes[posicao],
      skillPoints: this.lerNumero(classes[posicao].skillPoints) + 1,
    };

    personagem.data = { ...dadosPersonagem, classes, classPoints: pontosDeClasse - 1 };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  async distribuirPontosAtributo(
    personagemId: number,
    dados: DistribuirPontosAtributoDto,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarPermitidoOuFalhar(personagemId, usuario);
    const dadosPersonagem = this.lerDados(personagem);
    const disponivel = this.lerNumero(dadosPersonagem.pontosAtributo);

    let totalGasto = 0;
    for (const [atributo, quantidade] of Object.entries(dados.distribuicao)) {
      if (!(ATRIBUTOS_VALIDOS as readonly string[]).includes(atributo)) {
        throw new BadRequestException(`Atributo inválido: ${atributo}`);
      }
      if (!Number.isInteger(quantidade) || quantidade < 0) {
        throw new BadRequestException(`Valor inválido para ${atributo}.`);
      }
      totalGasto += quantidade;
    }

    if (totalGasto < 1) {
      throw new BadRequestException("Distribuição não pode ser zero.");
    }
    if (totalGasto > disponivel) {
      throw new BadRequestException("Pontos insuficientes disponíveis.");
    }

    const atributos = { ...((dadosPersonagem.atributos ?? {}) as Record<string, number>) };
    for (const [atributo, quantidade] of Object.entries(dados.distribuicao)) {
      if (quantidade > 0) atributos[atributo] = (atributos[atributo] ?? 0) + quantidade;
    }

    personagem.data = {
      ...dadosPersonagem,
      atributos,
      pontosAtributo: disponivel - totalGasto,
    };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  // ── Ajustes do mestre ─────────────────────────────────────────────────────

  async adicionarPontosDeClasse(
    personagemId: number,
    dados: PontosDeClasseDto,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarOuFalhar(personagemId);
    const dadosPersonagem = this.lerDados(personagem);

    personagem.data = {
      ...dadosPersonagem,
      classPoints: this.lerNumero(dadosPersonagem.classPoints) + dados.pontos,
    };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  async adicionarSkillPointsParaClasse(
    personagemId: number,
    dados: SkillPointsDeClasseDto,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarOuFalhar(personagemId);
    const dadosPersonagem = this.lerDados(personagem);
    const classes = this.lerClasses(dadosPersonagem);
    const posicao = this.acharClasseOuFalhar(classes, dados.classId);

    classes[posicao] = {
      ...classes[posicao],
      skillPoints: this.lerNumero(classes[posicao].skillPoints) + dados.pontos,
    };

    personagem.data = { ...dadosPersonagem, classes };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  async adicionarPontosAtributo(
    personagemId: number,
    dados: PontosDeClasseDto,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarOuFalhar(personagemId);
    const dadosPersonagem = this.lerDados(personagem);

    personagem.data = {
      ...dadosPersonagem,
      pontosAtributo: this.lerNumero(dadosPersonagem.pontosAtributo) + dados.pontos,
    };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  /** Volta os atributos ao que o onboarding gravou: base + bônus do passado. */
  async resetarPontosAtributo(personagemId: number): Promise<PersonagemApi> {
    const personagem = await this.buscarOuFalhar(personagemId);
    const dadosPersonagem = this.lerDados(personagem);

    const base = (dadosPersonagem.atributos_base ?? {}) as Record<string, number>;
    const bonusDoPassado = (dadosPersonagem.atributos_bonus_passado ?? {}) as Record<string, number>;

    const atributos: Record<string, number> = {};
    for (const atributo of ATRIBUTOS_VALIDOS) {
      atributos[atributo] = (base[atributo] ?? 0) + (bonusDoPassado[atributo] ?? 0);
    }

    personagem.data = { ...dadosPersonagem, atributos, pontosAtributo: 0 };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  /**
   * XP numa classe específica. Cada nível ganho concede pontos de skill
   * conforme a fórmula ceil(nível/2), que dá 1 ponto a cada dois níveis.
   */
  async atribuirXpDeClasse(
    personagemId: number,
    dados: AtribuirXpDeClasseDto,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarOuFalhar(personagemId);
    const dadosPersonagem = this.lerDados(personagem);
    const classes = this.lerClasses(dadosPersonagem);
    const posicao = this.acharClasseOuFalhar(classes, dados.classId);

    const classeId = Number.parseInt(dados.classId, 10);
    const xpPorNivel = Number.isNaN(classeId)
      ? new Map<number, number>()
      : await this.buscarProgressaoDaClasse(classeId);

    let xp = this.lerNumero(classes[posicao].xp) + dados.xp;
    let nivel = this.lerNumero(classes[posicao].level) || 1;
    let pontosDeSkill = this.lerNumero(classes[posicao].skillPoints);

    while (nivel < NIVEL_MAXIMO_DE_CLASSE) {
      const custoDoProximo = xpPorNivel.get(nivel + 1);
      if (custoDoProximo === undefined || xp < custoDoProximo) break;
      xp -= custoDoProximo;
      const nivelAnterior = nivel;
      nivel += 1;
      pontosDeSkill += Math.ceil(nivel / 2) - Math.ceil(nivelAnterior / 2);
    }

    classes[posicao] = { ...classes[posicao], xp, level: nivel, skillPoints: pontosDeSkill };
    personagem.data = { ...dadosPersonagem, classes };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  /**
   * XP do personagem como um todo, subindo characters.level pela tabela
   * level_progression.
   *
   * Duas coisas estavam erradas na versão anterior. A consulta pedia as
   * colunas `nivel` e `xp_necessario`, que nunca existiram nessa tabela (são
   * `level` e `xp_required_next`); ela falhava, o mapa ficava vazio e o laço
   * nunca rodava — dar XP acumulava o número e não subia nível nenhum. E o
   * teto era 20, herdado do nível de classe, enquanto a tabela vai até 100.
   *
   * O laço também subtraía o custo do XP guardado, tratando data.xp como
   * "XP desde o último nível". A tela de classes sempre leu esse campo como
   * XP total acumulado — é assim que ela calcula a coluna "Faltam", contra
   * xp_total_accumulated. Aqui data.xp passa a ser o total, e o nível é o
   * maior marco já alcançado. Isso também resolve a tabela ser esparsa (tem
   * os níveis 1 a 5, depois 10, 15, 20...): procurar o próximo nível exato
   * travaria a progressão no primeiro buraco.
   */
  async atribuirXpAoPersonagem(
    personagemId: number,
    dados: AtribuirXpDto,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarOuFalhar(personagemId);
    const dadosPersonagem = this.lerDados(personagem);

    const xpTotal = this.lerNumero(dadosPersonagem.xp) + dados.xp;
    const marcos = await this.buscarMarcosDeNivel();

    let nivel = personagem.level || 1;
    for (const marco of marcos) {
      if (marco.level > NIVEL_MAXIMO_DO_PERSONAGEM) break;
      if (xpTotal >= marco.xpAcumulado) nivel = Math.max(nivel, marco.level);
    }

    // Cada marco atravessado concede 1 ponto de perícia. É a ÚNICA coisa que
    // subir de nível concede sozinho neste projeto — até aqui o level-up só
    // gravava o número, e todo o resto (atributo, ponto de classe) continua
    // sendo concedido pelo mestre à mão.
    //
    // Conta marcos, e não níveis: a tabela tem 27 marcos para 100 níveis, e
    // pular de 5 para 10 é UM marco, não cinco.
    const nivelAnterior = personagem.level || 1;
    const marcosAtravessados = marcos.filter(
      (marco) => marco.level > nivelAnterior && marco.level <= nivel,
    ).length;

    const pontosDePericia =
      this.lerNumero(dadosPersonagem.periciaPoints) + marcosAtravessados;

    personagem.level = nivel;
    personagem.data = { ...dadosPersonagem, xp: xpTotal, periciaPoints: pontosDePericia };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  /**
   * Downtime: o mestre concede pontos por tempo narrado — um mês de estudo,
   * um aprendizado com mestre, uma temporada na forja. É a fonte principal de
   * perícia, e de propósito não tem automação: ela representa tempo de jogo,
   * não XP de combate.
   */
  async concederPontosDePericia(personagemId: number, pontos: number): Promise<PersonagemApi> {
    const personagem = await this.buscarOuFalhar(personagemId);
    const dadosPersonagem = this.lerDados(personagem);

    personagem.data = {
      ...dadosPersonagem,
      periciaPoints: this.lerNumero(dadosPersonagem.periciaPoints) + pontos,
    };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  /**
   * O jogador sobe UM rank, pagando o custo daquele degrau (rank 3 custa 3).
   * O custo crescente é o que faz especialista e generalista serem escolhas
   * com peso: rank 5 numa perícia custa 15 pontos; rank 1 em cinco custa 5.
   */
  async subirRankDePericia(
    personagemId: number,
    periciaId: number,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarPermitidoOuFalhar(personagemId, usuario);
    const pericia = await this.servicoPericias.buscarOuFalhar(periciaId);

    const dadosPersonagem = this.lerDados(personagem);
    const { pericias, pontosRestantes } = this.servicoPericias.subirUmRank(
      this.servicoPericias.lerPericias(dadosPersonagem),
      this.lerNumero(dadosPersonagem.periciaPoints),
      pericia,
    );

    personagem.data = { ...dadosPersonagem, pericias, periciaPoints: pontosRestantes };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  /**
   * Requisitos para adquirir a classe. Base: no máximo duas, e a segunda só
   * depois de a primeira chegar ao nível 10. Híbrida: o que estiver em
   * classes.requirements, ou duas bases no nível 10 quando não houver nada.
   */
  private async garantirRequisitosDaClasse(
    dados: EscolherClasseDto,
    classes: ClasseDoPersonagem[],
  ): Promise<void> {
    const tier = normalizarTier(dados.classTier);
    const classesBase = classes.filter((classe) => normalizarTier(classe.tier ?? "") === "base");

    if (tier === "base") {
      const primeira = classesBase[0];
      if (classesBase.length === 1 && this.lerNumero(primeira?.level) < NIVEL_MINIMO_PARA_SEGUNDA_CLASSE_BASE) {
        throw new BadRequestException(
          `Atinja o nível ${NIVEL_MINIMO_PARA_SEGUNDA_CLASSE_BASE} na sua primeira classe antes de escolher outra.`,
        );
      }
      if (classesBase.length >= MAXIMO_DE_CLASSES_BASE) {
        throw new BadRequestException(
          `Limite de classes base atingido (máximo ${MAXIMO_DE_CLASSES_BASE}).`,
        );
      }
      return;
    }

    if (!tier.startsWith("hibrid")) return;

    const requisitos = await this.buscarRequisitosDaClasse(Number.parseInt(dados.classId, 10));
    const idsExigidos = requisitos.required_classes ?? [];
    const nivelMinimo = requisitos.min_level ?? NIVEL_MINIMO_PARA_SEGUNDA_CLASSE_BASE;

    if (idsExigidos.length === 0) {
      const basesNoNivel = classesBase.filter(
        (classe) => this.lerNumero(classe.level) >= NIVEL_MINIMO_PARA_SEGUNDA_CLASSE_BASE,
      );
      if (basesNoNivel.length < MAXIMO_DE_CLASSES_BASE) {
        throw new BadRequestException(
          `Você precisa ter ${MAXIMO_DE_CLASSES_BASE} classes base no nível ${NIVEL_MINIMO_PARA_SEGUNDA_CLASSE_BASE} para escolher uma classe híbrida.`,
        );
      }
      return;
    }

    for (const idExigido of idsExigidos) {
      const possui = classes.find((classe) => String(classe.classId) === String(idExigido));
      if (!possui || this.lerNumero(possui.level) < nivelMinimo) {
        const nome = await this.buscarNomeDaClasse(Number(idExigido));
        throw new BadRequestException(`Requisito não atendido: ${nome} nível ${nivelMinimo}.`);
      }
    }
  }

  private async buscarRequisitosDaClasse(
    classeId: number,
  ): Promise<{ min_level?: number; required_classes?: (string | number)[] }> {
    if (Number.isNaN(classeId)) return {};

    const encontradas = await this.sequelize.query<{ requirements: Record<string, any> | null }>(
      `SELECT requirements FROM classes WHERE id = :classeId AND deleted_at IS NULL LIMIT 1`,
      { replacements: { classeId }, type: QueryTypes.SELECT },
    );
    return encontradas[0]?.requirements ?? {};
  }

  private async buscarNomeDaClasse(classeId: number): Promise<string> {
    const encontradas = await this.sequelize.query<{ name: string }>(
      `SELECT name FROM classes WHERE id = :classeId LIMIT 1`,
      { replacements: { classeId }, type: QueryTypes.SELECT },
    );
    return encontradas[0]?.name ?? String(classeId);
  }

  /** nível → XP necessário para alcançá-lo, dentro daquela classe. */
  private async buscarProgressaoDaClasse(classeId: number): Promise<Map<number, number>> {
    const linhas = await this.sequelize.query<{ nivel: number; xp_necessario: number }>(
      `SELECT nivel, xp_necessario FROM class_level_progression
        WHERE classe_id = :classeId
        ORDER BY nivel`,
      { replacements: { classeId }, type: QueryTypes.SELECT },
    );
    return new Map(linhas.map((linha) => [linha.nivel, linha.xp_necessario]));
  }

  /**
   * Os marcos de nível, do menor para o maior, com o XP total acumulado
   * necessário para alcançar cada um. BIGINT chega como texto pelo driver.
   */
  private async buscarMarcosDeNivel(): Promise<{ level: number; xpAcumulado: number }[]> {
    const linhas = await this.sequelize.query<{
      level: number;
      xp_total_accumulated: string | number;
    }>(
      `SELECT level, xp_total_accumulated FROM level_progression
        WHERE deleted_at IS NULL
        ORDER BY level`,
      { type: QueryTypes.SELECT },
    );

    return linhas.map((linha) => ({
      level: linha.level,
      xpAcumulado: Number(linha.xp_total_accumulated),
    }));
  }

  private async buscarOuFalhar(personagemId: number): Promise<PersonagemModel> {
    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }
    return personagem;
  }

  private async buscarPermitidoOuFalhar(
    personagemId: number,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemModel> {
    const personagem = await this.buscarOuFalhar(personagemId);
    garantirAcessoAoPersonagem(personagem, usuario);
    return personagem;
  }

  private acharClasseOuFalhar(classes: ClasseDoPersonagem[], classId: string): number {
    const posicao = classes.findIndex((classe) => String(classe.classId) === String(classId));
    if (posicao === -1) {
      throw new NotFoundException("Classe não encontrada no personagem.");
    }
    return posicao;
  }

  private lerDados(personagem: PersonagemModel): Record<string, unknown> {
    const dados = personagem.data;
    return dados && typeof dados === "object" ? { ...dados } : {};
  }

  private lerClasses(dados: Record<string, unknown>): ClasseDoPersonagem[] {
    return Array.isArray(dados.classes) ? [...(dados.classes as ClasseDoPersonagem[])] : [];
  }

  private lerNumero(valor: unknown): number {
    return typeof valor === "number" && Number.isFinite(valor) ? valor : 0;
  }
}
