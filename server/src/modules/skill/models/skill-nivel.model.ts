import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * Evoluções da skill nos níveis 2 e 3 (o CHECK do banco só aceita esses dois).
 * Cada campo *_override substitui o valor equivalente do catálogo quando a
 * skill chega àquele nível.
 *
 * paranoid desligado: a tabela tem deleted_at/deleted_by, mas o
 * UNIQUE(skill_id, nivel) é total. Uma linha soft-deletada continuaria
 * ocupando o par e recriar aquele nível daria erro de chave duplicada, com o
 * culpado invisível na listagem. Mesma situação de class_level_progression.
 */
@Table({ tableName: "skill_niveis", timestamps: true, paranoid: false })
export class SkillNivelModel extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare skillId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare nivel: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare damageMultiplierPct: number | null;

  @Column({ type: DataType.STRING(200), allowNull: true })
  declare nomeOverride: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare damageBaseOverride: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare multiplicadorOverride: string | null;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare effectDescriptionOverride: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;
}
