import { Column, DataType, Model, Table } from "sequelize-typescript";

/** As tabelas que podem ser produto de uma receita ou ingrediente dela. */
export const TABELAS_DE_ITEM = ["consumiveis", "itens", "equipamentos"] as const;
export type TabelaDeItem = (typeof TABELAS_DE_ITEM)[number];

/**
 * O que produz o quê, com o quê.
 *
 * A receita não cabe como coluna de nenhuma tabela de item: é
 * muitos-para-muitos (uma poção usa três ingredientes; um ingrediente serve a
 * cinco poções) e cruza tabelas (uma espada élfica precisa de mithril, que é
 * `itens`, e produz um `equipamentos`).
 *
 * Daí o par `produto_tabela` + `produto_id`, com CHECK no banco nos nomes
 * permitidos — sem ele, 'consumivel' no singular passaria e o JOIN
 * silenciosamente não acharia nada.
 */
@Table({ tableName: "receitas", timestamps: true, paranoid: true })
export class ReceitaModel extends Model {
  @Column(DataType.STRING(255))
  declare nome: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descricao: string | null;

  @Column(DataType.STRING(20))
  declare produtoTabela: TabelaDeItem;

  @Column(DataType.INTEGER)
  declare produtoId: number;

  @Column(DataType.INTEGER)
  declare quantidadeProduzida: number;

  /** Em minutos, para caber "20 minutos" e "dois dias" sem trocar a unidade. */
  @Column(DataType.INTEGER)
  declare tempoMinutos: number;

  @Column(DataType.INTEGER)
  declare dificuldade: number;

  /** Reservada: o vínculo entra quando o sistema de perícias existir. */
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare periciaId: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
