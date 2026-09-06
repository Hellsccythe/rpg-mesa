import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({ tableName: "classe_armadura", timestamps: true, paranoid: true })
export class ClasseArmaduraModel extends Model {
  @PrimaryKey
  @Column(DataType.INTEGER)
  declare item: number;

  @Column(DataType.STRING(100))
  declare descricao: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare categoriaArmaduraItem: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
