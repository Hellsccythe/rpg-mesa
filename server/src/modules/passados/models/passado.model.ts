import { Column, DataType, Model, Table } from "sequelize-typescript";

export type AtributoBonus = {
  aura?: number;
  forca?: number;
  destreza?: number;
  resistencia?: number;
  inteligencia?: number;
};

@Table({ tableName: "passados", timestamps: true, paranoid: true })
export class PassadoModel extends Model {
  @Column(DataType.STRING(100))
  declare nome: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descricao: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare fotoUrl: string | null;

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  declare skillIds: number[];

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  declare tituloIds: number[];

  @Column({ type: DataType.JSONB, allowNull: true })
  declare atributoBonus: AtributoBonus | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
