import { Column, DataType, Model, Table } from "sequelize-typescript";

/** Ingrediente, Material Precioso, Ferramenta, Exploração, Cosmético. */
@Table({ tableName: "categoria_item", timestamps: true, paranoid: true })
export class CategoriaItemModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare item: number;

  @Column(DataType.STRING(100))
  declare descricao: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare icone: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
