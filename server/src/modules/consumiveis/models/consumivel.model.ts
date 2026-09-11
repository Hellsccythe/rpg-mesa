import { Column, DataType, Model, Table } from "sequelize-typescript";

/** Como um veneno chega num alvo que não quer. Só veneno tem via. */
export const VIAS_DE_VENENO = ["lamina", "ingestao", "contato"] as const;
export type ViaDeVeneno = (typeof VIAS_DE_VENENO)[number];

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

  /**
   * Só veneno: lâmina, ingestão ou contato (migration 090). NULL em poção e
   * prato — é assim que a tela sabe quando mostrar o campo.
   */
  @Column({ type: DataType.STRING(20), allowNull: true })
  declare via: ViaDeVeneno | null;

  /**
   * A cura em número, para poção e prato (migration 091). "1d4 + 20% do PV
   * máximo" vivia dentro de `efeito` em texto e não era calculável. Em prato,
   * é a cura de BEM FEITO; mal feito é a regra `alimento.cura_malfeito`.
   */
  @Column({ type: DataType.STRING(20), allowNull: true })
  declare curaDado: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare curaPercentual: number | null;

  /** O que MAIS acontece quando o prato sai bem — hoje, o bônus social. */
  @Column({ type: DataType.TEXT, allowNull: true })
  declare efeitoBemfeito: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
