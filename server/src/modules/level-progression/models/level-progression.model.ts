import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * XP necessário por nível de personagem, independente de classe (não confundir
 * com class_level_progression, que é por classe).
 *
 * O desenho é em faixas: cada nível pertence a um tier ("Rápido", "Médio",
 * "Épico") com seu multiplicador, e guarda tanto o XP para o próximo nível
 * quanto o acumulado até ali.
 */
@Table({ tableName: "level_progression", timestamps: true, paranoid: true })
export class LevelProgressionModel extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare level: number;

  @Column(DataType.TEXT)
  declare tier: string;

  @Column(DataType.DECIMAL(4, 2))
  declare multiplier: number;

  @Column(DataType.BIGINT)
  declare xpRequiredNext: number;

  @Column(DataType.BIGINT)
  declare xpTotalAccumulated: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
