import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { PericiaModel, bonusDoTeste } from "../pericias/models/pericia.model.js";
import { ReceitasService, type ReceitaApi } from "../receitas/receitas.service.js";
import { InventarioService, type ReferenciaDoCatalogo } from "../inventario/inventario.service.js";
import {
  mesmaPilha,
  type EntradaDeInventario,
  type InventarioApi,
  type Qualidade,
  type TabelaDeInventario,
} from "../inventario/inventario.model.js";
import { FabricacaoModel, type ResultadoDeFabricacao } from "./models/fabricacao.model.js";

/**
 * As margens da escada. Também em `regras_do_sistema` (fabricar.*), para a
 * mesa consultar; aqui é o que o código usa.
 *
 * Assimétricas de propósito: com ±10 nos dois lados, rank 1 tirava obra-prima
 * em 30% das poções Comuns. Com +15, tira 5%.
 */
const MARGEM_DESASTRE = 10;
const MARGEM_OBRA_PRIMA = 15;
const RANK_MINIMO = 1;

/** Acima disto a ferramenta é fixa: não se carrega, se confirma que há oficina. */
const PESO_FERRAMENTA_FIXA = 12;

export type ResultadoDeFabricar = {
  resultado: ResultadoDeFabricacao;
  rolagem: { d20: number; bonus: number; total: number; dificuldade: number };
  pericia: { id: number; nome: string; rank: number; atributo: string; valor_do_atributo: number };
  consumido: Array<{ tabela: TabelaDeInventario; id: number; nome: string; quantidade: number }>;
  produzido: {
    tabela: TabelaDeInventario; id: number; nome: string; quantidade: number; qualidade: Qualidade;
  } | null;
  tempo_minutos: number;
  inventario: InventarioApi;
};

/** O que a checagem prévia devolve: dá para tentar, e se não, por quê. */
export type ChecagemDeFabricar = {
  pode: boolean;
  motivos: string[];
  pericia: { id: number; nome: string; rank: number; bonus: number } | null;
  dificuldade: number;
  /** % de cada saída, para a tela mostrar antes de rolar. */
  chances: { desastre: number; malfeito: number; bemfeito: number; obra_prima: number } | null;
};

@Injectable()
export class FabricacaoService {
  constructor(
    @InjectModel(FabricacaoModel)
    private readonly modeloFabricacao: typeof FabricacaoModel,
    @InjectModel(PericiaModel)
    private readonly modeloPericia: typeof PericiaModel,
    private readonly servicoReceitas: ReceitasService,
    private readonly servicoInventario: InventarioService,
    private readonly sequelize: Sequelize,
  ) {}

  /**
   * Só confere, não roda. É o que a tela chama para desabilitar o botão com o
   * motivo escrito — "faltam 1× Erva de Sangue e o Alambique" é o que o
   * jogador precisa ler para saber o que ir buscar.
   */
  async checar(
    personagem: PersonagemModel,
    receitaId: number,
    oficinaDisponivel: boolean,
  ): Promise<ChecagemDeFabricar> {
    const receita = await this.servicoReceitas.buscarOuFalhar(receitaId);
    const catalogo = await this.servicoInventario.carregarCatalogo();
    const entradas = this.servicoInventario.lerEntradas(personagem);
    const motivos: string[] = [];

    const pericia = await this.periciaDoPersonagem(personagem, receita, motivos);
    this.conferirFerramentas(receita, entradas, catalogo, oficinaDisponivel, motivos);
    this.conferirIngredientes(receita, entradas, motivos);

    const bonus = pericia ? bonusDoTeste(pericia.rank, pericia.valorDoAtributo) : 0;
    return {
      pode: motivos.length === 0,
      motivos,
      pericia: pericia ? { id: pericia.id, nome: pericia.nome, rank: pericia.rank, bonus } : null,
      dificuldade: receita.dificuldade,
      chances: pericia ? this.chances(bonus, receita.dificuldade) : null,
    };
  }

  /**
   * A ação. As sete checagens, a rolagem no servidor, e consumir + entregar +
   * registrar numa transação: ou tudo, ou nada.
   */
  async fabricar(
    personagem: PersonagemModel,
    receitaId: number,
    oficinaDisponivel: boolean,
    usuario: UsuarioAutenticado,
  ): Promise<ResultadoDeFabricar> {
    const receita = await this.servicoReceitas.buscarOuFalhar(receitaId);
    if (!receita.produto) {
      throw new BadRequestException("A receita aponta para um produto que não existe mais no catálogo.");
    }

    const catalogo = await this.servicoInventario.carregarCatalogo();
    const entradas = this.servicoInventario.lerEntradas(personagem);
    const motivos: string[] = [];

    const pericia = await this.periciaDoPersonagem(personagem, receita, motivos);
    this.conferirFerramentas(receita, entradas, catalogo, oficinaDisponivel, motivos);
    this.conferirIngredientes(receita, entradas, motivos);
    if (motivos.length > 0 || !pericia) {
      throw new BadRequestException(motivos.join(" "));
    }

    // A rolagem é no servidor, como o dinheiro inicial: no cliente bastaria
    // recarregar a página até sair 20.
    const d20 = Math.floor(Math.random() * 20) + 1;
    const bonus = bonusDoTeste(pericia.rank, pericia.valorDoAtributo);
    const total = d20 + bonus;
    const resultado = this.classificar(total, receita.dificuldade);

    // Consumir, entregar e registrar como um só ato. Sem isso, um erro no
    // meio deixaria o personagem sem os insumos e sem a poção.
    const { consumido, produzido, entradasFinais } = await this.sequelize.transaction(async (transacao) => {
      const consumido = this.consumir(receita, entradas, catalogo);

      let produzido: ResultadoDeFabricar["produzido"] = null;
      if (resultado !== "desastre") {
        const qualidade: Qualidade = resultado;
        const nova: EntradaDeInventario = {
          tabela: receita.produto!.tabela,
          id: receita.produto!.id,
          quantidade: receita.quantidade_produzida,
          qualidade,
          rapido: false,
          equipado: false,
        };
        this.empilhar(entradas, nova, catalogo);
        produzido = {
          tabela: nova.tabela, id: nova.id, nome: receita.produto!.nome,
          quantidade: nova.quantidade, qualidade,
        };
      }

      const dados = { ...(personagem.data as Record<string, unknown>), inventario: entradas };
      personagem.data = dados;
      await personagem.save({ transaction: transacao });

      await this.modeloFabricacao.create(
        {
          characterId: personagem.id,
          receitaId: receita.id,
          rolagemD20: d20,
          bonus,
          dificuldade: receita.dificuldade,
          resultado,
          oficinaConfirmada: oficinaDisponivel,
          createdBy: usuario.email,
        },
        { transaction: transacao },
      );

      return { consumido, produzido, entradasFinais: entradas };
    });

    return {
      resultado,
      rolagem: { d20, bonus, total, dificuldade: receita.dificuldade },
      pericia: {
        id: pericia.id, nome: pericia.nome, rank: pericia.rank,
        atributo: pericia.atributo, valor_do_atributo: pericia.valorDoAtributo,
      },
      consumido,
      produzido,
      tempo_minutos: receita.tempo_minutos,
      inventario: await this.servicoInventario.listar(personagem),
    };
  }

  // ── As checagens ──────────────────────────────────────────────────────────

  private async periciaDoPersonagem(
    personagem: PersonagemModel,
    receita: ReceitaApi,
    motivos: string[],
  ): Promise<{ id: number; nome: string; rank: number; atributo: string; valorDoAtributo: number } | null> {
    if (receita.pericia_id === null) {
      motivos.push("A receita não tem perícia definida — o mestre precisa corrigi-la.");
      return null;
    }
    const pericia = await this.modeloPericia.findByPk(receita.pericia_id);
    if (!pericia) {
      motivos.push("A perícia da receita não existe mais no catálogo.");
      return null;
    }

    const dados = personagem.data as Record<string, unknown>;
    const lista = Array.isArray(dados.pericias) ? (dados.pericias as Array<Record<string, unknown>>) : [];
    const rank = Number(lista.find((p) => p.periciaId === pericia.id)?.rank ?? 0);
    const atributos = (dados.atributos ?? {}) as Record<string, unknown>;
    const valorDoAtributo = Number(atributos[pericia.atributoBase] ?? 0);

    if (rank < RANK_MINIMO) {
      motivos.push(`Precisa de ${pericia.nome} rank ${RANK_MINIMO} para tentar; o personagem tem rank ${rank}.`);
    }
    return { id: pericia.id, nome: pericia.nome, rank, atributo: pericia.atributoBase, valorDoAtributo };
  }

  private conferirFerramentas(
    receita: ReceitaApi,
    entradas: EntradaDeInventario[],
    catalogo: Map<string, ReferenciaDoCatalogo>,
    oficinaDisponivel: boolean,
    motivos: string[],
  ): void {
    const faltamPortateis: string[] = [];
    const faltamFixas: string[] = [];
    for (const ferramenta of receita.ingredientes.filter((i) => !i.consumido)) {
      const referencia = catalogo.get(`${ferramenta.tabela}:${ferramenta.id}`);
      const fixa = (referencia?.peso ?? 0) > PESO_FERRAMENTA_FIXA;
      if (fixa) {
        if (!oficinaDisponivel) faltamFixas.push(ferramenta.nome);
      } else if (!entradas.some((e) => e.tabela === ferramenta.tabela && e.id === ferramenta.id)) {
        faltamPortateis.push(ferramenta.nome);
      }
    }
    if (faltamPortateis.length) {
      motivos.push(`Falta no inventário: ${faltamPortateis.join(", ")}.`);
    }
    if (faltamFixas.length) {
      motivos.push(`Exige oficina com ${faltamFixas.join(", ")} — confirme que há uma no lugar.`);
    }
  }

  private conferirIngredientes(
    receita: ReceitaApi,
    entradas: EntradaDeInventario[],
    motivos: string[],
  ): void {
    const faltam: string[] = [];
    for (const insumo of receita.ingredientes.filter((i) => i.consumido)) {
      const tem = entradas
        .filter((e) => e.tabela === insumo.tabela && e.id === insumo.id)
        .reduce((soma, e) => soma + e.quantidade, 0);
      if (tem < insumo.quantidade) {
        faltam.push(`${insumo.quantidade - tem}× ${insumo.nome}`);
      }
    }
    if (faltam.length) motivos.push(`Faltam ingredientes: ${faltam.join(", ")}.`);
  }

  // ── A escada ──────────────────────────────────────────────────────────────

  private classificar(total: number, dificuldade: number): ResultadoDeFabricacao {
    if (total <= dificuldade - MARGEM_DESASTRE) return "desastre";
    if (total < dificuldade) return "malfeito";
    if (total < dificuldade + MARGEM_OBRA_PRIMA) return "bemfeito";
    return "obra_prima";
  }

  /** % de cada saída para um d20 com este bônus contra esta DC. */
  private chances(bonus: number, dificuldade: number) {
    const contagem = { desastre: 0, malfeito: 0, bemfeito: 0, obra_prima: 0 };
    for (let d20 = 1; d20 <= 20; d20 += 1) {
      contagem[this.classificar(d20 + bonus, dificuldade)] += 5;
    }
    return contagem;
  }

  // ── Mexer no inventário, sem gravar ───────────────────────────────────────

  /**
   * Tira os insumos consumidos. Tira primeiro do que NÃO está equipado nem
   * na mochila rápida: o jogador que separou três poções para a luta não
   * quer que a fabricação use justamente aquelas.
   */
  private consumir(
    receita: ReceitaApi,
    entradas: EntradaDeInventario[],
    catalogo: Map<string, ReferenciaDoCatalogo>,
  ): ResultadoDeFabricar["consumido"] {
    const consumido: ResultadoDeFabricar["consumido"] = [];
    for (const insumo of receita.ingredientes.filter((i) => i.consumido)) {
      let restante = insumo.quantidade;
      const candidatas = entradas
        .map((entrada, posicao) => ({ entrada, posicao }))
        .filter(({ entrada }) => entrada.tabela === insumo.tabela && entrada.id === insumo.id)
        .sort((a, b) => Number(a.entrada.equipado || a.entrada.rapido) - Number(b.entrada.equipado || b.entrada.rapido));

      for (const { entrada } of candidatas) {
        if (restante <= 0) break;
        const tirar = Math.min(entrada.quantidade, restante);
        entrada.quantidade -= tirar;
        restante -= tirar;
      }
      // As pilhas que zeraram saem da lista.
      for (let i = entradas.length - 1; i >= 0; i -= 1) {
        if (entradas[i].quantidade <= 0) entradas.splice(i, 1);
      }
      consumido.push({
        tabela: insumo.tabela, id: insumo.id,
        nome: catalogo.get(`${insumo.tabela}:${insumo.id}`)?.nome ?? insumo.nome,
        quantidade: insumo.quantidade,
      });
    }
    return consumido;
  }

  /** A mesma regra de empilhar de InventarioService.adicionar, sem gravar. */
  private empilhar(
    entradas: EntradaDeInventario[],
    nova: EntradaDeInventario,
    catalogo: Map<string, ReferenciaDoCatalogo>,
  ): void {
    const empilhavel = catalogo.get(`${nova.tabela}:${nova.id}`)?.empilhavel ?? true;
    const existente = empilhavel ? entradas.find((e) => mesmaPilha(e, nova)) : undefined;
    if (existente) {
      existente.quantidade += nova.quantidade;
    } else if (empilhavel) {
      entradas.push({ ...nova });
    } else {
      for (let i = 0; i < nova.quantidade; i += 1) entradas.push({ ...nova, quantidade: 1 });
    }
  }

  // ── Histórico ─────────────────────────────────────────────────────────────

  async historico(personagemId: number): Promise<FabricacaoModel[]> {
    return this.modeloFabricacao.findAll({
      where: { characterId: personagemId },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
  }
}
