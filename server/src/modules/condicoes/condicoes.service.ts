import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { CondicaoModel } from "./models/condicao.model.js";
import type { CriarCondicaoDto, EditarCondicaoDto } from "./condicoes.dto.js";

export type ConsumivelQueTrata = {
  id: number;
  nome: string;
  /** `cura` remove o que já se sofreu; `previne` imuniza por um tempo. */
  acao: "cura" | "previne";
  valor: number | null;
};

export type CondicaoApi = {
  id: number;
  nome: string;
  descricao: string;
  efeito: string;
  categoria: string;
  raridade_item: number | null;
  raridade: { item: number; descricao: string; cor: string; ordem: number } | null;
  duracao: string;
  janela_de_cura: string | null;
  se_nao_tratada: string | null;
  acumulativa: boolean;
  /** O que existe hoje contra ela. Vazio significa condição sem resposta. */
  tratada_por: ConsumivelQueTrata[];
};

/**
 * A condição já vem com quem a trata. É a pergunta que o mestre faz olhando a
 * lista — "existe cura para isso?" — e responder com uma segunda chamada
 * deixaria a tela mostrando condições soltas.
 *
 * LEFT JOIN em raridade porque não há FOREIGN KEY: uma raridade apagada
 * deixaria a condição órfã, e com INNER ela sumiria da listagem sem explicação.
 */
const SQL_LISTAR = `
  SELECT
    c.id, c.nome, c.descricao, c.efeito, c.categoria, c.raridade_item,
    c.duracao, c.janela_de_cura, c.se_nao_tratada, c.acumulativa,
    CASE WHEN r.item IS NULL THEN NULL ELSE
      json_build_object('item', r.item, 'descricao', r.descricao, 'cor', r.cor, 'ordem', r.ordem)
    END AS raridade,
    COALESCE(tratamento.lista, '[]'::json) AS tratada_por
  FROM condicoes c
  LEFT JOIN raridade r ON r.item = c.raridade_item AND r.deleted_at IS NULL
  LEFT JOIN LATERAL (
    SELECT json_agg(
             json_build_object('id', x.id, 'nome', x.nome, 'acao', cc.acao, 'valor', x.valor)
             ORDER BY cc.acao, x.valor
           ) AS lista
    FROM consumivel_condicao cc
    JOIN consumiveis x ON x.id = cc.consumivel_id AND x.deleted_at IS NULL
    WHERE cc.condicao_id = c.id
  ) AS tratamento ON TRUE
  WHERE c.deleted_at IS NULL
`;

type LinhaCondicao = Omit<CondicaoApi, "tratada_por"> & {
  tratada_por: Array<ConsumivelQueTrata & { valor: string | null }>;
};

@Injectable()
export class CondicoesService {
  constructor(
    @InjectModel(CondicaoModel)
    private readonly modeloCondicao: typeof CondicaoModel,
    private readonly sequelize: Sequelize,
  ) {}

  async listar(): Promise<CondicaoApi[]> {
    const linhas = await this.sequelize.query<LinhaCondicao>(
      `${SQL_LISTAR} ORDER BY COALESCE(r.ordem, 99), c.nome`,
      { type: QueryTypes.SELECT },
    );
    return linhas.map((linha) => this.paraApi(linha));
  }

  async criar(dados: CriarCondicaoDto): Promise<CondicaoApi> {
    const criada = await this.modeloCondicao.create({
      nome: dados.nome.trim(),
      // Colunas NOT NULL com default: o default do Postgres só vale quando a
      // coluna é OMITIDA do INSERT, então string vazia, nunca null.
      descricao: dados.descricao?.trim() ?? "",
      efeito: dados.efeito?.trim() ?? "",
      categoria: dados.categoria,
      raridadeItem: dados.raridade_item ?? null,
      duracao: dados.duracao?.trim() ?? "",
      janelaDeCura: dados.janela_de_cura?.trim() || null,
      seNaoTratada: dados.se_nao_tratada?.trim() || null,
      acumulativa: dados.acumulativa ?? false,
    });
    return this.buscarOuFalhar(criada.id);
  }

  async editar(id: number, dados: EditarCondicaoDto): Promise<CondicaoApi> {
    const registro = await this.modeloCondicao.findByPk(id);
    if (!registro) throw new NotFoundException("Condição não encontrada.");

    if (dados.nome !== undefined) registro.nome = dados.nome.trim();
    if (dados.descricao !== undefined) registro.descricao = dados.descricao?.trim() ?? "";
    if (dados.efeito !== undefined) registro.efeito = dados.efeito?.trim() ?? "";
    if (dados.categoria !== undefined) registro.categoria = dados.categoria;
    if (dados.raridade_item !== undefined) registro.raridadeItem = dados.raridade_item;
    if (dados.duracao !== undefined) registro.duracao = dados.duracao?.trim() ?? "";
    if (dados.janela_de_cura !== undefined) registro.janelaDeCura = dados.janela_de_cura?.trim() || null;
    if (dados.se_nao_tratada !== undefined) registro.seNaoTratada = dados.se_nao_tratada?.trim() || null;
    if (dados.acumulativa !== undefined) registro.acumulativa = dados.acumulativa;

    await registro.save();
    return this.buscarOuFalhar(id);
  }

  /**
   * Recusa apagar condição que alguma poção trata. Sem FOREIGN KEY nada
   * impediria, e a poção passaria a curar uma linha que não existe mais.
   */
  async deletar(id: number): Promise<void> {
    const registro = await this.modeloCondicao.findByPk(id);
    if (!registro) throw new NotFoundException("Condição não encontrada.");

    // Só conta vínculo de consumível vivo: um apagado já não trata nada, e
    // deixá-lo no cálculo travaria a condição para sempre.
    const [{ total }] = await this.sequelize.query<{ total: string }>(
      `SELECT count(*)::text AS total
         FROM consumivel_condicao
         JOIN consumiveis ON consumiveis.id = consumivel_condicao.consumivel_id
                         AND consumiveis.deleted_at IS NULL
        WHERE consumivel_condicao.condicao_id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );

    if (Number(total) > 0) {
      throw new BadRequestException(
        `Não dá para apagar: ${total} consumível(is) tratam esta condição. Desfaça os vínculos primeiro.`,
      );
    }

    await registro.destroy();
  }

  private async buscarOuFalhar(id: number): Promise<CondicaoApi> {
    const linhas = await this.sequelize.query<LinhaCondicao>(`${SQL_LISTAR} AND c.id = :id`, {
      replacements: { id },
      type: QueryTypes.SELECT,
    });
    if (linhas.length === 0) throw new NotFoundException("Condição não encontrada.");
    return this.paraApi(linhas[0]);
  }

  /** O pg devolve NUMERIC como texto; a tela quer número. */
  private paraApi(linha: LinhaCondicao): CondicaoApi {
    return {
      ...linha,
      tratada_por: (linha.tratada_por ?? []).map((t) => ({
        ...t,
        valor: t.valor === null ? null : Number(t.valor),
      })),
    };
  }
}
