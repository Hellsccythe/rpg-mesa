import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";

/** O mesmo teto de personagens-progressao.service.ts — a tabela de XP para até 20. */
const NIVEL_MAXIMO_DE_CLASSE = 20;
import { PersonagemModel } from "./models/personagem.model.js";
import { garantirAcessoAoPersonagem } from "./personagem-acesso.js";
import { mapearPersonagemParaApi, type PersonagemApi } from "./personagem-api.mapper.js";
import { PericiasService } from "../pericias/pericias.service.js";
import type { EntradaDeInventario } from "../inventario/inventario.model.js";
import type {
  ConcluirOnboardingDto,
  DefinirAtributosDto,
  EscolherSkillInicialDto,
} from "./personagens-onboarding.dto.js";

/** Pontos distribuíveis na etapa de atributos. O frontend usa o mesmo número. */
const TOTAL_PONTOS_ATRIBUTO = 10;

/** Pontos de skill que a classe inicial concede ao ser escolhida. */
const PONTOS_SKILL_CLASSE_INICIAL = 2;

/**
 * Quantas vezes o jogador pode rolar o dinheiro inicial. A segunda é a aposta:
 * substitui a primeira mesmo se sair pior.
 */
const MAXIMO_TENTATIVAS_DINHEIRO = 2;

/** Uma linha do dinheiro que o passado concede, ex. `2d100` de prata. */
type RolagemDeDinheiro = {
  quantidade: number;
  faces: number;
  moeda: string;
};

type ResultadoDeDinheiro = {
  detalhes: Array<RolagemDeDinheiro & { dados: number[]; soma: number }>;
  /** Soma por moeda: `{ prata: 73, ouro: 2 }`. */
  total: Record<string, number>;
  roladoEm: string;
};

/** O que fica em `characters.data.dinheiro_inicial`. */
type DinheiroInicialGravado = {
  tentativas: number;
  resultado: ResultadoDeDinheiro;
  /** O que a segunda rolagem descartou. Nulo enquanto só houve uma. */
  descartado: ResultadoDeDinheiro | null;
};

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
    private readonly servicoPericias: PericiasService,
  ) {}

  /**
   * A skill precisa existir e pertencer à classe — ser uma das starting_skills
   * ou ter required_class igual à classe — e respeitar nivel_minimo_classe.
   * O dashboard já filtrava a lista, mas a rota aceitava qualquer nome: com o
   * token na mão dava para se conceder "Skill de Teste" ou a skill de outra
   * classe gastando um ponto.
   */
  private async garantirSkillDaClasse(nomeDaSkill: string, classeId: string, nivelDaClasse: number): Promise<void> {
    const linhas = await this.sequelize.query<{ nivel_minimo_classe: number | null; pertence: boolean }>(
      `SELECT skills.nivel_minimo_classe,
              (skills.required_class = :classeId
               OR EXISTS (
                 SELECT 1 FROM classes
                  WHERE classes.id = :classeIdNumero AND classes.deleted_at IS NULL
                    AND LOWER(:nome) = ANY (SELECT LOWER(unnest(classes.starting_skills)))
               )) AS pertence
         FROM skills
        WHERE skills.deleted_at IS NULL AND LOWER(skills.name) = LOWER(:nome)
        LIMIT 1`,
      {
        replacements: { nome: nomeDaSkill, classeId, classeIdNumero: Number.parseInt(classeId, 10) || 0 },
        type: QueryTypes.SELECT,
      },
    );

    const skill = linhas[0];
    if (!skill) throw new NotFoundException("Skill não encontrada no catálogo.");
    if (!skill.pertence) throw new BadRequestException("Esta skill não pertence a esta classe.");
    if (skill.nivel_minimo_classe != null && skill.nivel_minimo_classe > nivelDaClasse) {
      throw new BadRequestException(`Esta skill exige a classe no nível ${skill.nivel_minimo_classe}.`);
    }
  }

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
    await this.garantirRegistroAtivo("racas", racaId, personagem.campaignId, "Raça não encontrada.");

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

    const nivelDaClasse = typeof classeDoPersonagem.level === "number" ? classeDoPersonagem.level : 1;
    await this.garantirSkillDaClasse(nomeDaSkill, dados.classId, nivelDaClasse);

    // Esta rota atende toda skill aprendida pelo dashboard, não só a inicial,
    // e cada uma somava +1 sem teto: no nível 20 com 10 pontos a classe ia a
    // 30, e os níveis pares devolviam pontos — nível de graça, sem XP.
    const nivelAtual = typeof classeDoPersonagem.level === "number" ? classeDoPersonagem.level : 1;
    skillsEscolhidas.push(nomeDaSkill);
    classes[posicaoDaClasse] = {
      ...classeDoPersonagem,
      chosenSkills: skillsEscolhidas,
      skillPoints: pontosDisponiveis - 1,
      level: Math.min(nivelAtual + 1, NIVEL_MAXIMO_DE_CLASSE),
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
    await this.garantirRegistroAtivo("passados", passadoId, personagem.campaignId, "Passado não encontrado.");

    // As perícias do passado são COPIADAS para o personagem, ao contrário das
    // skills e títulos (que o dashboard lê do catálogo na hora de exibir). A
    // diferença é que o jogador vai comprar ranks por cima destes: sem a cópia
    // não haveria como separar o que veio de origem do que foi comprado.
    //
    // Copiar é seguro porque o passado é permanente — não há o caso de trocar
    // depois e ficar com rank de um passado que não é mais o seu.
    const periciasIniciais = await this.buscarPericiasDoPassado(passadoId);
    const dados = this.lerDados(personagem);
    const periciasDoPersonagem = await this.servicoPericias.aplicarPericiasDoPassado(
      this.servicoPericias.lerPericias(dados),
      periciasIniciais,
    );

    personagem.passadoId = passadoId;
    personagem.data = { ...dados, pericias: periciasDoPersonagem };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  private async buscarPericiasDoPassado(
    passadoId: number,
  ): Promise<Array<{ periciaId: number; rank: number }>> {
    const encontrados = await this.sequelize.query<{
      pericias_iniciais: Array<{ periciaId: number; rank: number }> | null;
    }>(`SELECT pericias_iniciais FROM passados WHERE id = :passadoId LIMIT 1`, {
      replacements: { passadoId },
      type: QueryTypes.SELECT,
    });

    const lista = encontrados[0]?.pericias_iniciais;
    return Array.isArray(lista) ? lista : [];
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
      await this.garantirRegistroAtivo("gods", deusId, personagem.campaignId, "Deus não encontrado.");
      personagem.deusId = deusId;
    }

    personagem.data = { ...dados, deusEtapaConcluida: true };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  // ── Etapa 6: dinheiro inicial ─────────────────────────────────────────────

  /**
   * Rola o dinheiro que o passado concede. **O dado é rolado aqui, no
   * servidor, e não no navegador** — no cliente bastaria recarregar a página
   * (ou abrir o console) até sair 100 num d100, e a regra das duas tentativas
   * não significaria nada.
   *
   * São no máximo duas tentativas. A segunda substitui a primeira mesmo se
   * vier pior: é o risco que o jogador aceita ao pedir para rolar de novo. O
   * valor descartado fica guardado para ele ver o que abriu mão, e para o
   * mestre poder conferir.
   */
  async rolarDinheiroInicial(
    personagemId: number,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarPermitidoOuFalhar(personagemId, usuario);

    if (personagem.onboardingCompleto) {
      throw new ConflictException("Onboarding já foi concluído.");
    }
    if (personagem.passadoId === null) {
      throw new BadRequestException("Escolha um passado antes de rolar o dinheiro inicial.");
    }

    const rolagensDoPassado = await this.buscarDinheiroDoPassado(personagem.passadoId);
    if (rolagensDoPassado.length === 0) {
      throw new BadRequestException("O passado escolhido não concede dinheiro inicial.");
    }

    const dados = this.lerDados(personagem);
    const anterior = dados.dinheiro_inicial as DinheiroInicialGravado | undefined;
    const tentativasFeitas = anterior?.tentativas ?? 0;

    if (tentativasFeitas >= MAXIMO_TENTATIVAS_DINHEIRO) {
      throw new ConflictException(
        `O dinheiro inicial já foi rolado ${MAXIMO_TENTATIVAS_DINHEIRO} vezes.`,
      );
    }

    const resultado = this.rolarDados(rolagensDoPassado);

    personagem.data = {
      ...dados,
      dinheiro_inicial: {
        tentativas: tentativasFeitas + 1,
        resultado,
        // Só existe a partir da segunda tentativa.
        descartado: tentativasFeitas === 0 ? null : (anterior?.resultado ?? null),
      } satisfies DinheiroInicialGravado,
    };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  /**
   * `Math.random` basta aqui: o resultado é gravado no servidor e o jogador
   * não escolhe quando rolar de um jeito que dê para prever a semente. Não é
   * sorteio com valor em dinheiro real.
   */
  private rolarDados(rolagens: RolagemDeDinheiro[]): ResultadoDeDinheiro {
    const detalhes = rolagens.map((rolagem) => {
      const dados: number[] = [];
      for (let i = 0; i < rolagem.quantidade; i += 1) {
        dados.push(Math.floor(Math.random() * rolagem.faces) + 1);
      }
      return {
        quantidade: rolagem.quantidade,
        faces: rolagem.faces,
        moeda: rolagem.moeda,
        dados,
        soma: dados.reduce((total, valor) => total + valor, 0),
      };
    });

    const total: Record<string, number> = {};
    for (const detalhe of detalhes) {
      total[detalhe.moeda] = (total[detalhe.moeda] ?? 0) + detalhe.soma;
    }

    return { detalhes, total, roladoEm: new Date().toISOString() };
  }

  private async buscarDinheiroDoPassado(passadoId: number): Promise<RolagemDeDinheiro[]> {
    const encontrados = await this.sequelize.query<{
      dinheiro_inicial: RolagemDeDinheiro[] | null;
    }>(`SELECT dinheiro_inicial FROM passados WHERE id = :passadoId LIMIT 1`, {
      replacements: { passadoId },
      type: QueryTypes.SELECT,
    });

    const rolagens = encontrados[0]?.dinheiro_inicial;
    return Array.isArray(rolagens) ? rolagens : [];
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

    // O peso vem do CATÁLOGO, não do que o cliente mandou. Antes o servidor
    // somava `equipamento.peso` do corpo da requisição — bastava enviar 0 em
    // tudo para levar a Armadura Completa com força 1. O cliente ainda manda
    // nome e peso (o DTO não mudou), mas só o id é usado.
    const ids = [...new Set(dados.equipamentos.map((equipamento) => equipamento.id))];
    const doCatalogo = ids.length === 0 ? [] : await this.sequelize.query<{ id: number; peso: string | null }>(
      `SELECT id, peso FROM equipamentos WHERE id IN (:ids) AND deleted_at IS NULL`,
      { replacements: { ids }, type: QueryTypes.SELECT },
    );
    const pesoPorId = new Map(doCatalogo.map((linha) => [linha.id, Number(linha.peso ?? 0)]));

    const desconhecidos = ids.filter((id) => !pesoPorId.has(id));
    if (desconhecidos.length > 0) {
      throw new BadRequestException(
        `Equipamento(s) inexistente(s) no catálogo: ${desconhecidos.join(", ")}.`,
      );
    }

    const pesoTotal = dados.equipamentos.reduce(
      (acumulado, equipamento) => acumulado + (pesoPorId.get(equipamento.id) ?? 0),
      0,
    );
    if (pesoTotal > pesoMaximo) {
      throw new BadRequestException(
        `Peso total (${pesoTotal.toFixed(1)} kg) excede a capacidade de carga (${pesoMaximo} kg).`,
      );
    }

    // Grava no inventário estruturado, não em `equipamentos_iniciais`. Cada
    // equipamento é uma entrada própria (equipamento não empilha) e nasce
    // equipado: é o que o personagem escolheu vestir para começar.
    const inventario: EntradaDeInventario[] = dados.equipamentos.map((equipamento) => ({
      tabela: "equipamentos",
      id: equipamento.id,
      quantidade: 1,
      qualidade: null,
      rapido: false,
      equipado: true,
    }));

    personagem.data = { ...dadosPersonagem, inventario };
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
    campanhaId: number | null,
    mensagemDeErro: string,
  ): Promise<void> {
    // Só o catálogo do mundo do personagem: com o token na mão, o id de uma
    // raça de outro mundo passaria — a listagem filtrada do cliente é fachada
    // se o servidor não conferir (docs/MUNDOS.md).
    const encontrados = await this.sequelize.query<{ id: number }>(
      `SELECT id FROM ${tabela} WHERE id = :id AND campaign_id = :campanhaId AND deleted_at IS NULL LIMIT 1`,
      { replacements: { id, campanhaId }, type: QueryTypes.SELECT },
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
