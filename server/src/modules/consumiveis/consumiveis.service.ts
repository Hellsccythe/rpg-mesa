import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes, type Transaction } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { CategoriaConsumivelModel } from "./models/categoria-consumivel.model.js";
import { ConsumivelModel } from "./models/consumivel.model.js";
import {
  ConsumivelCondicaoModel,
  type AcaoSobreCondicao,
} from "./models/consumivel-condicao.model.js";
import type { ViaDeVeneno } from "./models/consumivel.model.js";
import type {
  CriarCategoriaConsumivelDto,
  CriarConsumivelDto,
  EditarCategoriaConsumivelDto,
  EditarConsumivelDto,
  VinculoDeCondicaoDto,
} from "./consumiveis.dto.js";

/** A condição que este consumível resolve, e de que jeito. */
export type CondicaoVinculada = {
  condicao_id: number;
  nome: string;
  acao: AcaoSobreCondicao;
  /** Gravidade da condição — a regra é que a poção alcance a raridade dela. */
  raridade_item: number | null;
};

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
  /** Só veneno. */
  via: ViaDeVeneno | null;
  /** A cura em número. Em prato, é a de bem feito. */
  cura_dado: string | null;
  cura_percentual: number | null;
  efeito_bemfeito: string | null;
  /** Vazio significa consumível que não responde a nenhuma condição. */
  condicoes: CondicaoVinculada[];
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
    consumiveis.via,
    consumiveis.cura_dado,
    consumiveis.cura_percentual,
    consumiveis.efeito_bemfeito,
    CASE WHEN raridade.item IS NULL THEN NULL ELSE
      json_build_object('item', raridade.item, 'descricao', raridade.descricao,
                        'cor', raridade.cor, 'ordem', raridade.ordem)
    END AS raridade,
    CASE WHEN categoria.item IS NULL THEN NULL ELSE
      json_build_object('item', categoria.item, 'descricao', categoria.descricao)
    END AS categoria,
    COALESCE(vinculos.lista, '[]'::json) AS condicoes
  FROM consumiveis
  LEFT JOIN raridade
    ON raridade.item = consumiveis.raridade_item AND raridade.deleted_at IS NULL
  LEFT JOIN categoria_consumivel AS categoria
    ON categoria.item = consumiveis.categoria_consumivel_item AND categoria.deleted_at IS NULL
  LEFT JOIN LATERAL (
    SELECT json_agg(
             json_build_object('condicao_id', condicoes.id, 'nome', condicoes.nome,
                               'acao', consumivel_condicao.acao,
                               'raridade_item', condicoes.raridade_item)
             ORDER BY consumivel_condicao.acao, condicoes.nome
           ) AS lista
    FROM consumivel_condicao
    JOIN condicoes
      ON condicoes.id = consumivel_condicao.condicao_id AND condicoes.deleted_at IS NULL
    WHERE consumivel_condicao.consumivel_id = consumiveis.id
  ) AS vinculos ON TRUE
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
    @InjectModel(ConsumivelCondicaoModel)
    private readonly modeloVinculo: typeof ConsumivelCondicaoModel,
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

  /**
   * Numa transação porque a sincronização de vínculos pode recusar o pedido
   * (condição inexistente): sem isso, o consumível ficava criado e sem vínculo,
   * e o mestre via um erro na tela com meio registro gravado no banco.
   *
   * O `buscarOuFalhar` fica FORA da transação de propósito — é consulta crua e
   * não veria as linhas ainda não confirmadas.
   */
  async criar(dados: CriarConsumivelDto): Promise<ConsumivelApi> {
    const criado = await this.sequelize.transaction(async (transacao) => {
      const registro = await this.modeloConsumivel.create(
        {
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
          via: dados.via ?? null,
          curaDado: dados.cura_dado?.trim() || null,
          curaPercentual: dados.cura_percentual ?? null,
          efeitoBemfeito: dados.efeito_bemfeito?.trim() || null,
        },
        { transaction: transacao },
      );
      if (dados.condicoes) {
        await this.sincronizarVinculos(registro.id, dados.condicoes, transacao);
      }
      return registro;
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
    if (dados.via !== undefined) registro.via = dados.via;
    if (dados.cura_dado !== undefined) registro.curaDado = dados.cura_dado?.trim() || null;
    if (dados.cura_percentual !== undefined) registro.curaPercentual = dados.cura_percentual;
    if (dados.efeito_bemfeito !== undefined) {
      registro.efeitoBemfeito = dados.efeito_bemfeito?.trim() || null;
    }

    await this.sequelize.transaction(async (transacao) => {
      await registro.save({ transaction: transacao });
      // Só toca nos vínculos se o cliente mandou o campo — ver o comentário do DTO.
      if (dados.condicoes) await this.sincronizarVinculos(id, dados.condicoes, transacao);
    });
    return this.buscarOuFalhar(id);
  }

  async deletar(id: number): Promise<void> {
    const registro = await this.modeloConsumivel.findByPk(id);
    if (!registro) throw new NotFoundException("Consumível não encontrado.");
    // O consumível é soft delete; os vínculos vão de verdade, porque sozinhos
    // não significam nada e ainda bloqueariam apagar a condição do outro lado.
    await this.modeloVinculo.destroy({ where: { consumivelId: id } });
    await registro.destroy();
  }

  /**
   * Apaga e reinsere o conjunto — mesmo padrão dos ingredientes de receita.
   * Vai pelo ORM, não por `sequelize.query`, para os hooks de auditoria
   * preencherem `created_by`; consulta crua não dispara hook nenhum.
   *
   * A condição precisa existir: sem FOREIGN KEY, um id errado entraria calado e
   * a poção passaria a curar uma linha inexistente.
   */
  private async sincronizarVinculos(
    consumivelId: number,
    vinculos: VinculoDeCondicaoDto[],
    transacao: Transaction,
  ): Promise<void> {
    if (vinculos.length > 0) {
      const ids = [...new Set(vinculos.map((vinculo) => vinculo.condicao_id))];
      // `IN (:ids)`, não `ANY(:ids)`: o Sequelize troca um array de
      // replacement por uma lista separada por vírgula, que é o que o IN
      // espera — o ANY receberia `ANY(9, 11)` e o Postgres recusa a sintaxe.
      // A lista nunca chega vazia aqui (o `if` acima garante), o que evitaria
      // o `IN ()` que também é inválido.
      const [{ total }] = await this.sequelize.query<{ total: string }>(
        `SELECT count(*)::text AS total FROM condicoes
          WHERE id IN (:ids) AND deleted_at IS NULL`,
        { replacements: { ids }, type: QueryTypes.SELECT, transaction: transacao },
      );
      if (Number(total) !== ids.length) {
        throw new BadRequestException("Alguma das condições informadas não existe.");
      }
    }

    await this.modeloVinculo.destroy({ where: { consumivelId }, transaction: transacao });
    // Um par (condição, ação) repetido no formulário quebraria o índice único.
    const unicos = new Map(
      vinculos.map((vinculo) => [`${vinculo.condicao_id}:${vinculo.acao}`, vinculo]),
    );
    for (const vinculo of unicos.values()) {
      await this.modeloVinculo.create(
        {
          consumivelId,
          condicaoId: vinculo.condicao_id,
          acao: vinculo.acao,
        },
        { transaction: transacao },
      );
    }
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
