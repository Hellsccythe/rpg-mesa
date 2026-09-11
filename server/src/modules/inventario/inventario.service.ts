import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import {
  mesmaPilha,
  type EntradaDeInventario,
  type EntradaDeInventarioApi,
  type InventarioApi,
  type Qualidade,
  type TabelaDeInventario,
} from "./inventario.model.js";

/**
 * Nome, peso, valor e categoria dos três catálogos, num SELECT só. O
 * `empilhavel` só existe em `itens`; consumível sempre empilha (cinco poções
 * iguais são uma pilha) e equipamento nunca (duas espadas são duas espadas).
 */
const SQL_CATALOGO = `
  SELECT 'itens' AS tabela, i.id, i.nome, i.peso, i.valor, i.empilhavel, c.descricao AS categoria
    FROM itens i LEFT JOIN categoria_item c ON c.item = i.categoria_item
   WHERE i.deleted_at IS NULL
  UNION ALL
  SELECT 'consumiveis', x.id, x.nome, x.peso, x.valor, TRUE, c.descricao
    FROM consumiveis x LEFT JOIN categoria_consumivel c ON c.item = x.categoria_consumivel_item
   WHERE x.deleted_at IS NULL
  UNION ALL
  SELECT 'equipamentos', e.id, e.nome, e.peso, e.valor, FALSE, c.descricao
    FROM equipamentos e LEFT JOIN categoria_equipamento c ON c.item = e.categoria_equipamento_item
   WHERE e.deleted_at IS NULL
`;

type LinhaCatalogo = {
  tabela: TabelaDeInventario;
  id: number;
  nome: string;
  peso: string | null;
  valor: string | null;
  empilhavel: boolean;
  categoria: string | null;
};

export type ReferenciaDoCatalogo = {
  nome: string;
  peso: number | null;
  valor: number | null;
  empilhavel: boolean;
  categoria: string | null;
};

@Injectable()
export class InventarioService {
  constructor(
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly sequelize: Sequelize,
  ) {}

  // ── Leitura ───────────────────────────────────────────────────────────────

  async listar(personagem: PersonagemModel): Promise<InventarioApi> {
    const entradas = this.lerEntradas(personagem);
    const catalogo = await this.carregarCatalogo();
    return this.montar(personagem, entradas, catalogo);
  }

  /**
   * Lê `data.inventario` sem confiar no formato: o campo é JSONB livre e já
   * carregou texto solto no passado. O que não tiver a forma esperada é
   * descartado em vez de derrubar a tela inteira.
   */
  lerEntradas(personagem: PersonagemModel): EntradaDeInventario[] {
    const bruto = (personagem.data as Record<string, unknown> | null)?.inventario;
    if (!Array.isArray(bruto)) return [];
    return bruto
      .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
      .filter((e) => typeof e.id === "number" && typeof e.tabela === "string")
      .map((e) => ({
        tabela: e.tabela as TabelaDeInventario,
        id: e.id as number,
        quantidade: Math.max(1, Number(e.quantidade) || 1),
        qualidade: (e.qualidade as Qualidade | null | undefined) ?? null,
        rapido: e.rapido === true,
        equipado: e.equipado === true,
      }));
  }

  async carregarCatalogo(): Promise<Map<string, ReferenciaDoCatalogo>> {
    const linhas = await this.sequelize.query<LinhaCatalogo>(SQL_CATALOGO, {
      type: QueryTypes.SELECT,
    });
    const catalogo = new Map<string, ReferenciaDoCatalogo>();
    for (const linha of linhas) {
      catalogo.set(`${linha.tabela}:${linha.id}`, {
        nome: linha.nome,
        peso: linha.peso === null ? null : Number(linha.peso),
        valor: linha.valor === null ? null : Number(linha.valor),
        empilhavel: linha.empilhavel,
        categoria: linha.categoria,
      });
    }
    return catalogo;
  }

  // ── Escrita ───────────────────────────────────────────────────────────────

  /**
   * Adiciona ao inventário, empilhando quando o catálogo permite. O item
   * precisa existir: sem FOREIGN KEY, um id errado entraria calado e viraria
   * um órfão na tela.
   */
  async adicionar(
    personagem: PersonagemModel,
    nova: EntradaDeInventario,
  ): Promise<InventarioApi> {
    const catalogo = await this.carregarCatalogo();
    const referencia = catalogo.get(`${nova.tabela}:${nova.id}`);
    if (!referencia) {
      throw new NotFoundException(`Item ${nova.tabela}#${nova.id} não existe no catálogo.`);
    }

    const entradas = this.lerEntradas(personagem);
    const existente = referencia.empilhavel ? entradas.find((e) => mesmaPilha(e, nova)) : undefined;
    if (existente) {
      existente.quantidade += nova.quantidade;
    } else if (referencia.empilhavel) {
      entradas.push({ ...nova });
    } else {
      // Não empilha: cada unidade é uma entrada. Duas espadas são duas espadas.
      for (let i = 0; i < nova.quantidade; i += 1) {
        entradas.push({ ...nova, quantidade: 1 });
      }
    }

    await this.gravar(personagem, entradas);
    return this.montar(personagem, entradas, catalogo);
  }

  /**
   * Remove `quantidade` da pilha na posição dada. A posição é o índice na
   * lista, e não um id, porque a mesma poção pode aparecer duas vezes — uma
   * na mochila rápida e outra fora dela.
   */
  async remover(
    personagem: PersonagemModel,
    posicao: number,
    quantidade: number,
  ): Promise<InventarioApi> {
    const entradas = this.lerEntradas(personagem);
    const alvo = this.entradaNaPosicao(entradas, posicao);

    if (quantidade >= alvo.quantidade) {
      entradas.splice(posicao, 1);
    } else {
      alvo.quantidade -= quantidade;
    }

    await this.gravar(personagem, entradas);
    return this.montar(personagem, entradas, await this.carregarCatalogo());
  }

  /**
   * Liga ou desliga `rapido` ou `equipado`. Se a mudança faz a entrada
   * coincidir com outra pilha (a mesma poção já estava na mochila rápida),
   * as duas se fundem — sem isso a lista acumularia pilhas gêmeas.
   */
  async alternar(
    personagem: PersonagemModel,
    posicao: number,
    campo: "rapido" | "equipado",
    valor: boolean,
  ): Promise<InventarioApi> {
    const entradas = this.lerEntradas(personagem);
    const alvo = this.entradaNaPosicao(entradas, posicao);
    alvo[campo] = valor;

    const gemea = entradas.find((e, i) => i !== posicao && mesmaPilha(e, alvo));
    if (gemea) {
      gemea.quantidade += alvo.quantidade;
      entradas.splice(posicao, 1);
    }

    await this.gravar(personagem, entradas);
    return this.montar(personagem, entradas, await this.carregarCatalogo());
  }

  /**
   * Substitui o inventário inteiro. É o que a ação de fabricar usa dentro da
   * transação dela: consumir insumos e entregar o produto como um só ato.
   * Não é exposto como rota — uma rota "substitua tudo" apagaria o
   * inventário por engano na primeira requisição com lista vazia.
   */
  async gravar(personagem: PersonagemModel, entradas: EntradaDeInventario[]): Promise<void> {
    const dados = (personagem.data && typeof personagem.data === "object")
      ? { ...(personagem.data as Record<string, unknown>) }
      : {};
    personagem.data = { ...dados, inventario: entradas };
    await personagem.save();
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  private entradaNaPosicao(entradas: EntradaDeInventario[], posicao: number): EntradaDeInventario {
    const alvo = entradas[posicao];
    if (!alvo) throw new BadRequestException(`Não há entrada na posição ${posicao}.`);
    return alvo;
  }

  private montar(
    personagem: PersonagemModel,
    entradas: EntradaDeInventario[],
    catalogo: Map<string, ReferenciaDoCatalogo>,
  ): InventarioApi {
    const enriquecidas: EntradaDeInventarioApi[] = entradas.map((entrada) => {
      const referencia = catalogo.get(`${entrada.tabela}:${entrada.id}`);
      return {
        ...entrada,
        // O item pode ter sido apagado do catálogo: sem FOREIGN KEY nada
        // impede. Mostrar "(item removido)" é melhor que sumir com a linha.
        nome: referencia?.nome ?? "(item removido do catálogo)",
        peso: referencia?.peso ?? null,
        valor: referencia?.valor ?? null,
        categoria: referencia?.categoria ?? null,
        orfao: !referencia,
      };
    });

    const pesoTotal = enriquecidas.reduce(
      (soma, e) => soma + (e.peso ?? 0) * e.quantidade, 0);

    return {
      entradas: enriquecidas,
      peso_total: Math.round(pesoTotal * 100) / 100,
      peso_maximo: this.pesoMaximo(personagem),
    };
  }

  /** `2 + força × 2`, a mesma regra do onboarding. */
  pesoMaximo(personagem: PersonagemModel): number {
    const dados = personagem.data as Record<string, unknown> | null;
    const atributos = dados?.atributos as Record<string, unknown> | undefined;
    const forca = Number(atributos?.forca ?? 0);
    return 2 + (Number.isFinite(forca) ? forca : 0) * 2;
  }
}
