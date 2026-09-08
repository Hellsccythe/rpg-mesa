import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { ReceitaIngredienteModel } from "./models/receita-ingrediente.model.js";
import { ReceitaModel, TABELAS_DE_ITEM, type TabelaDeItem } from "./models/receita.model.js";
import type {
  CriarReceitaDto,
  EditarReceitaDto,
  IngredienteDaReceitaDto,
} from "./receitas.dto.js";

export type ReferenciaDeItem = {
  tabela: TabelaDeItem;
  id: number;
  nome: string;
  valor: number | null;
};

export type IngredienteApi = ReferenciaDeItem & {
  quantidade: number;
  consumido: boolean;
};

export type ReceitaApi = {
  id: number;
  nome: string;
  descricao: string | null;
  produto: ReferenciaDeItem | null;
  quantidade_produzida: number;
  tempo_minutos: number;
  dificuldade: number;
  ingredientes: IngredienteApi[];
  /** Soma de valor × quantidade dos ingredientes. */
  custo_dos_ingredientes: number;
  /** Preço de comprar o produto pronto, × quantidade produzida. */
  preco_de_compra: number | null;
  /** custo ÷ preço, em porcentagem. Nulo quando não dá para comparar. */
  proporcao_do_preco: number | null;
};

/**
 * Resolve nome e valor de um item que pode estar em qualquer das três tabelas.
 * UNION ALL com a tabela de origem no SELECT: é o preço de ter escolhido o par
 * tabela+id em vez de três colunas nulas, e concentra esse custo num lugar só.
 */
const SQL_CATALOGO_UNIFICADO = `
  SELECT 'consumiveis' AS tabela, id, nome, valor FROM consumiveis WHERE deleted_at IS NULL
  UNION ALL
  SELECT 'itens',        id, nome, valor FROM itens        WHERE deleted_at IS NULL
  UNION ALL
  SELECT 'equipamentos', id, nome, valor FROM equipamentos WHERE deleted_at IS NULL
`;

type LinhaCatalogo = { tabela: TabelaDeItem; id: number; nome: string; valor: string | null };

@Injectable()
export class ReceitasService {
  constructor(
    @InjectModel(ReceitaModel)
    private readonly modeloReceita: typeof ReceitaModel,
    @InjectModel(ReceitaIngredienteModel)
    private readonly modeloIngrediente: typeof ReceitaIngredienteModel,
    private readonly sequelize: Sequelize,
  ) {}

  async listar(): Promise<ReceitaApi[]> {
    const receitas = await this.modeloReceita.findAll({ order: [["nome", "ASC"]] });
    if (receitas.length === 0) return [];

    const ingredientes = await this.modeloIngrediente.findAll({
      where: { receitaId: receitas.map((receita) => receita.id) },
    });

    const catalogo = await this.carregarCatalogo();
    return receitas.map((receita) =>
      this.montar(receita, ingredientes.filter((i) => i.receitaId === receita.id), catalogo),
    );
  }

  async criar(dados: CriarReceitaDto): Promise<ReceitaApi> {
    await this.garantirQueExiste(dados.produto_tabela, dados.produto_id, "Produto");
    await this.garantirIngredientes(dados.ingredientes);

    const criada = await this.modeloReceita.create({
      nome: dados.nome.trim(),
      descricao: dados.descricao?.trim() || null,
      produtoTabela: dados.produto_tabela,
      produtoId: dados.produto_id,
      quantidadeProduzida: dados.quantidade_produzida ?? 1,
      tempoMinutos: dados.tempo_minutos ?? 60,
      dificuldade: dados.dificuldade ?? 10,
    });

    await this.substituirIngredientes(criada.id, dados.ingredientes);
    return this.buscarOuFalhar(criada.id);
  }

  async editar(id: number, dados: EditarReceitaDto): Promise<ReceitaApi> {
    const receita = await this.modeloReceita.findByPk(id);
    if (!receita) throw new NotFoundException("Receita não encontrada.");

    const tabelaDoProduto = dados.produto_tabela ?? receita.produtoTabela;
    const idDoProduto = dados.produto_id ?? receita.produtoId;
    if (dados.produto_tabela !== undefined || dados.produto_id !== undefined) {
      await this.garantirQueExiste(tabelaDoProduto, idDoProduto, "Produto");
    }

    if (dados.nome !== undefined) receita.nome = dados.nome.trim();
    if (dados.descricao !== undefined) receita.descricao = dados.descricao?.trim() || null;
    receita.produtoTabela = tabelaDoProduto;
    receita.produtoId = idDoProduto;
    if (dados.quantidade_produzida !== undefined) receita.quantidadeProduzida = dados.quantidade_produzida;
    if (dados.tempo_minutos !== undefined) receita.tempoMinutos = dados.tempo_minutos;
    if (dados.dificuldade !== undefined) receita.dificuldade = dados.dificuldade;
    await receita.save();

    if (dados.ingredientes !== undefined) {
      await this.garantirIngredientes(dados.ingredientes);
      await this.substituirIngredientes(id, dados.ingredientes);
    }

    return this.buscarOuFalhar(id);
  }

  async deletar(id: number): Promise<void> {
    const receita = await this.modeloReceita.findByPk(id);
    if (!receita) throw new NotFoundException("Receita não encontrada.");
    // A receita é soft delete; os ingredientes acompanham de verdade, porque
    // sozinhos não significam nada e o índice único deles é total.
    await this.modeloIngrediente.destroy({ where: { receitaId: id } });
    await receita.destroy();
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  private async buscarOuFalhar(id: number): Promise<ReceitaApi> {
    const receita = await this.modeloReceita.findByPk(id);
    if (!receita) throw new NotFoundException("Receita não encontrada.");
    const ingredientes = await this.modeloIngrediente.findAll({ where: { receitaId: id } });
    return this.montar(receita, ingredientes, await this.carregarCatalogo());
  }

  /**
   * Substitui o conjunto inteiro. Apagar e reinserir, em vez de casar linha a
   * linha, é o que o mestre espera ao editar a lista no formulário — e evita
   * decidir o que fazer com um ingrediente que mudou de tabela.
   */
  private async substituirIngredientes(
    receitaId: number,
    ingredientes: IngredienteDaReceitaDto[],
  ): Promise<void> {
    await this.modeloIngrediente.destroy({ where: { receitaId } });
    for (const ingrediente of ingredientes) {
      await this.modeloIngrediente.create({
        receitaId,
        ingredienteTabela: ingrediente.ingrediente_tabela,
        ingredienteId: ingrediente.ingrediente_id,
        quantidade: ingrediente.quantidade,
        consumido: ingrediente.consumido ?? true,
      });
    }
  }

  private async carregarCatalogo(): Promise<Map<string, ReferenciaDeItem>> {
    const linhas = await this.sequelize.query<LinhaCatalogo>(SQL_CATALOGO_UNIFICADO, {
      type: QueryTypes.SELECT,
    });

    const catalogo = new Map<string, ReferenciaDeItem>();
    for (const linha of linhas) {
      catalogo.set(`${linha.tabela}:${linha.id}`, {
        tabela: linha.tabela,
        id: linha.id,
        nome: linha.nome,
        valor: linha.valor === null ? null : Number(linha.valor),
      });
    }
    return catalogo;
  }

  private async garantirQueExiste(
    tabela: TabelaDeItem,
    id: number,
    rotulo: string,
  ): Promise<void> {
    if (!TABELAS_DE_ITEM.includes(tabela)) {
      throw new BadRequestException(`Tabela inválida: ${tabela}.`);
    }
    const catalogo = await this.carregarCatalogo();
    if (!catalogo.has(`${tabela}:${id}`)) {
      throw new NotFoundException(`${rotulo} não encontrado em ${tabela} (id ${id}).`);
    }
  }

  private async garantirIngredientes(ingredientes: IngredienteDaReceitaDto[]): Promise<void> {
    const catalogo = await this.carregarCatalogo();
    const vistos = new Set<string>();

    for (const ingrediente of ingredientes) {
      const chave = `${ingrediente.ingrediente_tabela}:${ingrediente.ingrediente_id}`;
      if (vistos.has(chave)) {
        throw new BadRequestException(
          "O mesmo ingrediente aparece duas vezes. Some as quantidades numa linha só.",
        );
      }
      vistos.add(chave);

      if (!catalogo.has(chave)) {
        throw new NotFoundException(
          `Ingrediente não encontrado em ${ingrediente.ingrediente_tabela} (id ${ingrediente.ingrediente_id}).`,
        );
      }
    }
  }

  private montar(
    receita: ReceitaModel,
    ingredientes: ReceitaIngredienteModel[],
    catalogo: Map<string, ReferenciaDeItem>,
  ): ReceitaApi {
    const produto = catalogo.get(`${receita.produtoTabela}:${receita.produtoId}`) ?? null;

    const lista: IngredienteApi[] = ingredientes.map((ingrediente) => {
      const referencia = catalogo.get(
        `${ingrediente.ingredienteTabela}:${ingrediente.ingredienteId}`,
      );
      return {
        tabela: ingrediente.ingredienteTabela,
        id: ingrediente.ingredienteId,
        // O item pode ter sido apagado: sem FOREIGN KEY nada impede. Mostrar
        // o id é melhor do que sumir com a linha e deixar a receita mentindo
        // sobre o que precisa.
        nome: referencia?.nome ?? `#${ingrediente.ingredienteId} (removido)`,
        valor: referencia?.valor ?? null,
        quantidade: ingrediente.quantidade,
        consumido: ingrediente.consumido,
      };
    });

    // Só o que é consumido entra no custo: a ferramenta é comprada uma vez.
    const custo = lista
      .filter((ingrediente) => ingrediente.consumido)
      .reduce((total, ingrediente) => total + (ingrediente.valor ?? 0) * ingrediente.quantidade, 0);

    const precoDeCompra =
      produto?.valor === null || produto?.valor === undefined
        ? null
        : produto.valor * receita.quantidadeProduzida;

    return {
      id: receita.id,
      nome: receita.nome,
      descricao: receita.descricao,
      produto,
      quantidade_produzida: receita.quantidadeProduzida,
      tempo_minutos: receita.tempoMinutos,
      dificuldade: receita.dificuldade,
      ingredientes: lista,
      custo_dos_ingredientes: Math.round(custo * 100) / 100,
      preco_de_compra: precoDeCompra,
      proporcao_do_preco:
        precoDeCompra && precoDeCompra > 0 ? Math.round((custo / precoDeCompra) * 100) : null,
    };
  }
}
