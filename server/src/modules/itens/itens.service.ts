import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { CategoriaItemModel } from "./models/categoria-item.model.js";
import { ItemModel } from "./models/item.model.js";
import type {
  CriarCategoriaItemDto,
  CriarItemDto,
  EditarCategoriaItemDto,
  EditarItemDto,
} from "./itens.dto.js";

export type ItemApi = {
  id: number;
  nome: string;
  descricao: string | null;
  peso: number | null;
  valor: number | null;
  empilhavel: boolean;
  raridade_item: number | null;
  raridade: { item: number; descricao: string; cor: string; ordem: number } | null;
  categoria_item: number | null;
  categoria: { item: number; descricao: string } | null;
};

/**
 * LEFT JOIN de propósito: sem FOREIGN KEY no banco, uma raridade ou categoria
 * apagada deixaria o item órfão — e com INNER ele sumiria da listagem sem
 * ninguém entender o motivo.
 */
const SQL_LISTAR = `
  SELECT
    itens.id,
    itens.nome,
    itens.descricao,
    itens.peso,
    itens.valor,
    itens.empilhavel,
    itens.raridade_item,
    itens.categoria_item,
    CASE WHEN raridade.item IS NULL THEN NULL ELSE
      json_build_object('item', raridade.item, 'descricao', raridade.descricao,
                        'cor', raridade.cor, 'ordem', raridade.ordem)
    END AS raridade,
    CASE WHEN categoria.item IS NULL THEN NULL ELSE
      json_build_object('item', categoria.item, 'descricao', categoria.descricao)
    END AS categoria
  FROM itens
  LEFT JOIN raridade
    ON raridade.item = itens.raridade_item AND raridade.deleted_at IS NULL
  LEFT JOIN categoria_item AS categoria
    ON categoria.item = itens.categoria_item AND categoria.deleted_at IS NULL
  WHERE itens.deleted_at IS NULL
`;

type LinhaItem = Omit<ItemApi, "peso" | "valor"> & {
  peso: string | null;
  valor: string | null;
};

@Injectable()
export class ItensService {
  constructor(
    @InjectModel(ItemModel)
    private readonly modeloItem: typeof ItemModel,
    @InjectModel(CategoriaItemModel)
    private readonly modeloCategoria: typeof CategoriaItemModel,
    private readonly sequelize: Sequelize,
  ) {}

  // ── Itens ─────────────────────────────────────────────────────────────────

  async listar(): Promise<ItemApi[]> {
    const linhas = await this.sequelize.query<LinhaItem>(
      `${SQL_LISTAR} ORDER BY itens.nome`,
      { type: QueryTypes.SELECT },
    );
    return linhas.map((linha) => this.paraApi(linha));
  }

  async criar(dados: CriarItemDto): Promise<ItemApi> {
    const criado = await this.modeloItem.create({
      nome: dados.nome.trim(),
      descricao: dados.descricao?.trim() || null,
      peso: dados.peso ?? null,
      valor: dados.valor ?? null,
      empilhavel: dados.empilhavel ?? true,
      raridadeItem: dados.raridade_item ?? null,
      categoriaItem: dados.categoria_item ?? null,
    });
    return this.buscarOuFalhar(criado.id);
  }

  async editar(id: number, dados: EditarItemDto): Promise<ItemApi> {
    const registro = await this.modeloItem.findByPk(id);
    if (!registro) throw new NotFoundException("Item não encontrado.");

    if (dados.nome !== undefined) registro.nome = dados.nome.trim();
    if (dados.descricao !== undefined) registro.descricao = dados.descricao?.trim() || null;
    if (dados.peso !== undefined) registro.peso = dados.peso === null ? null : String(dados.peso);
    if (dados.valor !== undefined) registro.valor = dados.valor === null ? null : String(dados.valor);
    if (dados.empilhavel !== undefined) registro.empilhavel = dados.empilhavel;
    if (dados.raridade_item !== undefined) registro.raridadeItem = dados.raridade_item;
    if (dados.categoria_item !== undefined) registro.categoriaItem = dados.categoria_item;

    await registro.save();
    return this.buscarOuFalhar(id);
  }

  async deletar(id: number): Promise<void> {
    const registro = await this.modeloItem.findByPk(id);
    if (!registro) throw new NotFoundException("Item não encontrado.");
    await registro.destroy();
  }

  private async buscarOuFalhar(id: number): Promise<ItemApi> {
    const linhas = await this.sequelize.query<LinhaItem>(`${SQL_LISTAR} AND itens.id = :id`, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });
    if (linhas.length === 0) throw new NotFoundException("Item não encontrado.");
    return this.paraApi(linhas[0]);
  }

  /** O pg devolve NUMERIC como texto; o frontend quer número. */
  private paraApi(linha: LinhaItem): ItemApi {
    return {
      ...linha,
      peso: linha.peso === null ? null : Number(linha.peso),
      valor: linha.valor === null ? null : Number(linha.valor),
    };
  }

  // ── Categorias ────────────────────────────────────────────────────────────

  async listarCategorias(): Promise<CategoriaItemModel[]> {
    return this.modeloCategoria.findAll({ order: [["descricao", "ASC"]] });
  }

  async criarCategoria(dados: CriarCategoriaItemDto): Promise<CategoriaItemModel> {
    return this.modeloCategoria.create({
      descricao: dados.descricao.trim(),
      icone: dados.icone?.trim() || null,
    });
  }

  async editarCategoria(
    item: number,
    dados: EditarCategoriaItemDto,
  ): Promise<CategoriaItemModel> {
    const registro = await this.modeloCategoria.findByPk(item);
    if (!registro) throw new NotFoundException("Categoria não encontrada.");
    if (dados.descricao !== undefined) registro.descricao = dados.descricao.trim();
    if (dados.icone !== undefined) registro.icone = dados.icone?.trim() || null;
    await registro.save();
    return registro;
  }

  /** Recusa apagar categoria em uso: sem FOREIGN KEY, o item ficaria órfão em silêncio. */
  async deletarCategoria(item: number): Promise<void> {
    const registro = await this.modeloCategoria.findByPk(item);
    if (!registro) throw new NotFoundException("Categoria não encontrada.");

    const [{ total }] = await this.sequelize.query<{ total: string }>(
      `SELECT count(*)::text AS total FROM itens
        WHERE categoria_item = :item AND deleted_at IS NULL`,
      { replacements: { item }, type: QueryTypes.SELECT },
    );

    if (Number(total) > 0) {
      throw new BadRequestException(
        `Não dá para apagar: ${total} item(ns) ainda usam esta categoria.`,
      );
    }

    await registro.destroy();
  }
}
