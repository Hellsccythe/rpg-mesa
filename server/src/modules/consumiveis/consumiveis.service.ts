import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { CategoriaConsumivelModel } from "./models/categoria-consumivel.model.js";
import { ConsumivelModel } from "./models/consumivel.model.js";
import type {
  CriarCategoriaConsumivelDto,
  CriarConsumivelDto,
  EditarCategoriaConsumivelDto,
  EditarConsumivelDto,
} from "./consumiveis.dto.js";

export type ConsumivelApi = {
  id: number;
  nome: string;
  descricao: string | null;
  efeito: string;
  usos: number;
  duracao: string | null;
  peso: number | null;
  valor: number | null;
  raridade_item: number | null;
  raridade: { item: number; descricao: string; cor: string; ordem: number } | null;
  categoria_consumivel_item: number | null;
  categoria: { item: number; descricao: string } | null;
};

/**
 * Leitura em SQL cru para trazer raridade e categoria já resolvidas num
 * SELECT só. LEFT JOIN de propósito: sem FOREIGN KEY no banco, uma raridade
 * apagada deixaria o consumível órfão — e com INNER ele sumiria da listagem
 * sem ninguém entender por quê.
 */
const SQL_LISTAR = `
  SELECT
    consumiveis.id,
    consumiveis.nome,
    consumiveis.descricao,
    consumiveis.efeito,
    consumiveis.usos,
    consumiveis.duracao,
    consumiveis.peso,
    consumiveis.valor,
    consumiveis.raridade_item,
    consumiveis.categoria_consumivel_item,
    CASE WHEN raridade.item IS NULL THEN NULL ELSE
      json_build_object('item', raridade.item, 'descricao', raridade.descricao,
                        'cor', raridade.cor, 'ordem', raridade.ordem)
    END AS raridade,
    CASE WHEN categoria.item IS NULL THEN NULL ELSE
      json_build_object('item', categoria.item, 'descricao', categoria.descricao)
    END AS categoria
  FROM consumiveis
  LEFT JOIN raridade
    ON raridade.item = consumiveis.raridade_item AND raridade.deleted_at IS NULL
  LEFT JOIN categoria_consumivel AS categoria
    ON categoria.item = consumiveis.categoria_consumivel_item AND categoria.deleted_at IS NULL
  WHERE consumiveis.deleted_at IS NULL
`;

type LinhaConsumivel = Omit<ConsumivelApi, "peso" | "valor"> & {
  peso: string | null;
  valor: string | null;
};

@Injectable()
export class ConsumiveisService {
  constructor(
    @InjectModel(ConsumivelModel)
    private readonly modeloConsumivel: typeof ConsumivelModel,
    @InjectModel(CategoriaConsumivelModel)
    private readonly modeloCategoria: typeof CategoriaConsumivelModel,
    private readonly sequelize: Sequelize,
  ) {}

  // ── Consumíveis ───────────────────────────────────────────────────────────

  async listar(): Promise<ConsumivelApi[]> {
    const linhas = await this.sequelize.query<LinhaConsumivel>(
      `${SQL_LISTAR} ORDER BY consumiveis.nome`,
      { type: QueryTypes.SELECT },
    );
    return linhas.map((linha) => this.paraApi(linha));
  }

  async criar(dados: CriarConsumivelDto): Promise<ConsumivelApi> {
    const criado = await this.modeloConsumivel.create({
      nome: dados.nome.trim(),
      descricao: dados.descricao?.trim() || null,
      // String vazia, nunca null: a coluna é NOT NULL e o default só valeria
      // se ela fosse omitida do INSERT.
      efeito: dados.efeito?.trim() ?? "",
      usos: dados.usos ?? 1,
      duracao: dados.duracao?.trim() || null,
      peso: dados.peso ?? null,
      valor: dados.valor ?? null,
      raridadeItem: dados.raridade_item ?? null,
      categoriaConsumivelItem: dados.categoria_consumivel_item ?? null,
    });
    return this.buscarOuFalhar(criado.id);
  }

  async editar(id: number, dados: EditarConsumivelDto): Promise<ConsumivelApi> {
    const registro = await this.modeloConsumivel.findByPk(id);
    if (!registro) throw new NotFoundException("Consumível não encontrado.");

    if (dados.nome !== undefined) registro.nome = dados.nome.trim();
    if (dados.descricao !== undefined) registro.descricao = dados.descricao?.trim() || null;
    if (dados.efeito !== undefined) registro.efeito = dados.efeito?.trim() ?? "";
    if (dados.usos !== undefined) registro.usos = dados.usos;
    if (dados.duracao !== undefined) registro.duracao = dados.duracao?.trim() || null;
    if (dados.peso !== undefined) registro.peso = dados.peso === null ? null : String(dados.peso);
    if (dados.valor !== undefined) registro.valor = dados.valor === null ? null : String(dados.valor);
    if (dados.raridade_item !== undefined) registro.raridadeItem = dados.raridade_item;
    if (dados.categoria_consumivel_item !== undefined) {
      registro.categoriaConsumivelItem = dados.categoria_consumivel_item;
    }

    await registro.save();
    return this.buscarOuFalhar(id);
  }

  async deletar(id: number): Promise<void> {
    const registro = await this.modeloConsumivel.findByPk(id);
    if (!registro) throw new NotFoundException("Consumível não encontrado.");
    await registro.destroy();
  }

  private async buscarOuFalhar(id: number): Promise<ConsumivelApi> {
    const linhas = await this.sequelize.query<LinhaConsumivel>(
      `${SQL_LISTAR} AND consumiveis.id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );
    if (linhas.length === 0) throw new NotFoundException("Consumível não encontrado.");
    return this.paraApi(linhas[0]);
  }

  /** O Sequelize e o pg devolvem NUMERIC como texto; o frontend quer número. */
  private paraApi(linha: LinhaConsumivel): ConsumivelApi {
    return {
      ...linha,
      peso: linha.peso === null ? null : Number(linha.peso),
      valor: linha.valor === null ? null : Number(linha.valor),
    };
  }

  // ── Categorias ────────────────────────────────────────────────────────────

  async listarCategorias(): Promise<CategoriaConsumivelModel[]> {
    return this.modeloCategoria.findAll({ order: [["descricao", "ASC"]] });
  }

  async criarCategoria(dados: CriarCategoriaConsumivelDto): Promise<CategoriaConsumivelModel> {
    return this.modeloCategoria.create({
      descricao: dados.descricao.trim(),
      icone: dados.icone?.trim() || null,
    });
  }

  async editarCategoria(
    item: number,
    dados: EditarCategoriaConsumivelDto,
  ): Promise<CategoriaConsumivelModel> {
    const registro = await this.modeloCategoria.findByPk(item);
    if (!registro) throw new NotFoundException("Categoria não encontrada.");
    if (dados.descricao !== undefined) registro.descricao = dados.descricao.trim();
    if (dados.icone !== undefined) registro.icone = dados.icone?.trim() || null;
    await registro.save();
    return registro;
  }

  /**
   * Recusa apagar categoria em uso, pelo mesmo motivo da raridade: sem
   * FOREIGN KEY, o consumível ficaria apontando para o vazio em silêncio.
   */
  async deletarCategoria(item: number): Promise<void> {
    const registro = await this.modeloCategoria.findByPk(item);
    if (!registro) throw new NotFoundException("Categoria não encontrada.");

    const [{ total }] = await this.sequelize.query<{ total: string }>(
      `SELECT count(*)::text AS total FROM consumiveis
        WHERE categoria_consumivel_item = :item AND deleted_at IS NULL`,
      { replacements: { item }, type: QueryTypes.SELECT },
    );

    if (Number(total) > 0) {
      throw new BadRequestException(
        `Não dá para apagar: ${total} consumível(is) ainda usam esta categoria.`,
      );
    }

    await registro.destroy();
  }
}
