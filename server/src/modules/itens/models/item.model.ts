import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * O que só se carrega, vende ou entrega numa receita: cosméticos,
 * ferramentas, equipamento de exploração, materiais preciosos e ingredientes.
 *
 * Todos se comportam igual — um batom e uma barra de mithril não precisam de
 * tabelas separadas. Uma erva de alquimia é item, e não consumível, porque ela
 * não some ao ser usada: ela vira outra coisa. Quem some é a poção.
 */
@Table({ tableName: "itens", timestamps: true, paranoid: true })
export class ItemModel extends Model {
  @Column(DataType.STRING(255))
  declare nome: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descricao: string | null;

  @Column({ type: DataType.DECIMAL(8, 2), allowNull: true })
  declare peso: string | null;

  /** Preço final em prata. O multiplicador da raridade é referência, não é aplicado. */
  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
  declare valor: string | null;

  /** Ervas e minérios empilham; uma gazua ou um vestido, não. */
  @Column(DataType.BOOLEAN)
  declare empilhavel: boolean;

  /** Quem a peça impressiona (migration 096). Só tecido, material e cosmético. */
  @Column({ type: DataType.STRING(20), allowNull: true })
  declare publico: "plebe" | "qualquer" | "nobreza" | null;

  /** Bônus social quando bem feita. Mal feita dá 0; obra-prima dá +1. */
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare bonusSocial: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare raridadeItem: number | null;

  /**
   * Referencia `categoria_item.item`. Sem o sufixo `_item` que as outras
   * tabelas usam porque o nome do lookup já termina nele — a alternativa
   * seria `categoria_item_item`.
   */
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare categoriaItem: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
