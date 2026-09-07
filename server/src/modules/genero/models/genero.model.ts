import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "genero", timestamps: true, paranoid: true })
export class GeneroModel extends Model {
  @Column(DataType.STRING(20))
  declare codigo: string;

  @Column(DataType.STRING(50))
  declare descricao: string;

  @Column({ type: DataType.STRING(10), defaultValue: "" })
  declare pronome: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
