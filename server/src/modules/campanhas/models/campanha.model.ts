import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "campaigns", timestamps: true, paranoid: true })
export class CampanhaModel extends Model {
  /** Único no banco. É o que aparece na URL. */
  @Column({ type: DataType.STRING(120), allowNull: false })
  declare slug: string;

  @Column({ type: DataType.STRING(200), allowNull: false })
  declare name: string;

  /** O número do mundo (migration 100). Único entre as campanhas vivas. */
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare numero: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  /** Caminho relativo no armazenamento, ex: "campanhas/capa.png". */
  @Column({ type: DataType.TEXT, allowNull: true })
  declare coverImageUrl: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
