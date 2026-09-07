import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * A tabela se chama "equipamentos" (era "armas"), e guarda armas, armaduras e
 * itens variados.
 *
 * Atenção à assimetria das referências, que é fácil de inverter: categoria é
 * UMA (coluna integer), enquanto classe, tipo e propriedade são LISTAS
 * (integer[] NOT NULL com default '{}'). O CLAUDE.md descrevia o contrário
 * até esta migração.
 */
@Table({ tableName: "equipamentos", timestamps: true, paranoid: true })
export class EquipamentoModel extends Model {
  @Column({ type: DataType.STRING(255), allowNull: false })
  declare nome: string;

  /** Notação de dados, ex: "1d8". NOT NULL no banco — vazio vira "". */
  @Column({ type: DataType.STRING(60), allowNull: false, defaultValue: "" })
  declare dano: string;

  @Column({ type: DataType.DECIMAL(8, 2), allowNull: true })
  declare peso: string | number | null;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
  declare valor: string | number | null;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare descricaoEquipamento: string | null;

  @Column({ type: DataType.STRING(300), allowNull: true })
  declare preRequisitos: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare categoriaEquipamentoItem: number | null;

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  declare classeEquipamentoItem: number[];

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  declare tipoEquipamentoItem: number[];

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  declare propriedadeEquipamentoItem: number[];

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
