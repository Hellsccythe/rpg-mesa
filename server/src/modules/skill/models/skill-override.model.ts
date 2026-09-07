import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * Ajuste de uma skill para um personagem específico, feito pelo mestre em
 * /master/skill-overrides. A skill é referenciada pelo nome, porque o que o
 * personagem carrega em data.skills[] é o nome, não o id do catálogo.
 *
 * paranoid desligado pelo mesmo motivo de SkillNivelModel: o
 * UNIQUE(skill_name, character_id) é total.
 */
@Table({ tableName: "skill_character_override", timestamps: true, paranoid: false })
export class SkillOverrideModel extends Model {
  @Column({ type: DataType.TEXT, allowNull: false })
  declare skillName: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare characterId: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare damageBaseOverride: string | null;

  /** text[], igual a skills.multiplicador_atributo. */
  @Column({ type: DataType.ARRAY(DataType.TEXT), allowNull: true })
  declare multiplicadorOverride: string[] | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;
}
