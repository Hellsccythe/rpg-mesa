import { Column, DataType, Model, Table } from "sequelize-typescript";

export type RequisitosDeClasse = {
  min_level?: number;
  required_classes?: (string | number)[];
};

@Table({ tableName: "classes", timestamps: true, paranoid: true })
export class ClasseModel extends Model {
  @Column(DataType.TEXT)
  declare name: string;

  /** Restrito pelo CHECK do banco a 'Base', 'Híbrida' ou 'Hidden'. */
  @Column(DataType.TEXT)
  declare tier: string;

  @Column(DataType.TEXT)
  declare description: string;

  @Column({ type: DataType.INTEGER, defaultValue: 20 })
  declare maxLevel: number;

  @Column({ type: DataType.JSONB, defaultValue: {} })
  declare requirements: RequisitosDeClasse;

  @Column({ type: DataType.JSONB, defaultValue: {} })
  declare statBonuses: Record<string, unknown>;

  /** NOT NULL no banco, com default '{}' — nunca gravar null aqui. */
  @Column({ type: DataType.ARRAY(DataType.TEXT), defaultValue: [] })
  declare startingSkills: string[];

  @Column({ type: DataType.ARRAY(DataType.TEXT), allowNull: true })
  declare passiveSkills: string[] | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare signatureSkill: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare signatureSkillNivel: number | null;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare requerDeus: boolean;

  /**
   * Classe secreta não aparece no onboarding nem para os outros jogadores;
   * só quem tem uma revelação em classe_secreta_revelada enxerga.
   */
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isSecret: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
