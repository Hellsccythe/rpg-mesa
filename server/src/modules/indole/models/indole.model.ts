import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "indole", timestamps: true, paranoid: true })
export class IndoleModel extends Model {
  @Column(DataType.STRING(20))
  declare codigo: string;

  @Column(DataType.STRING(100))
  declare descricao: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
