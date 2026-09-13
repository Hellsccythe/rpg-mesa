import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "npcs", timestamps: true, paranoid: true })
export class NpcModel extends Model {
  /** O mundo do NPC (migration 101). */
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare campaignId: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare nome: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare racaId: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descricao: string | null;

  /** Caminho relativo no armazenamento, ex: "npcs/ferreiro.png". */
  @Column({ type: DataType.TEXT, allowNull: true })
  declare fotoUrl: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
