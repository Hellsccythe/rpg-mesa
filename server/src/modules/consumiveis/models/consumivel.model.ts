import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * O que o jogador usa e some: poções, venenos, munição, alimento, pergaminhos.
 *
 * O corte entre esta tabela, `equipamentos` e `itens` é por comportamento, não
 * por tema — a pergunta que decide é "o que acontece quando o jogador usa
 * isso?". Some ao usar, vem para cá. A erva que produz a poção não some ao ser
 * usada (ela vira outra coisa), então mora em `itens`; as duas se ligam pela
 * tabela de receitas.
 */
@Table({ tableName: "consumiveis", timestamps: true, paranoid: true })
export class ConsumivelModel extends Model {
  @Column(DataType.STRING(255))
  declare nome: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descricao: string | null;

  /**
   * NOT NULL no banco, com default ''. O default do Postgres só vale quando a
   * coluna é OMITIDA do INSERT — passar null explícito viola a constraint.
   * Por isso o service grava string vazia, nunca null.
   */
  @Column(DataType.TEXT)
  declare efeito: string;

  @Column(DataType.INTEGER)
  declare usos: number;

  @Column({ type: DataType.STRING(60), allowNull: true })
  declare duracao: string | null;

  @Column({ type: DataType.DECIMAL(8, 2), allowNull: true })
  declare peso: string | null;

  /** Preço final em prata. O multiplicador da raridade é referência, não é aplicado. */
  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
  declare valor: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare raridadeItem: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare categoriaConsumivelItem: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
