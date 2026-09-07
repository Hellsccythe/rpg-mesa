import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * As quatro tabelas de apoio do catálogo de skills. Mesma forma que as de
 * equipamento: `item` como chave primária, `descricao`, soft delete e
 * auditoria.
 *
 * skill_natureza era a única sem geração automática de `item` — o backend
 * calculava MAX(item)+1 na mão. A migration 066 alinhou com as outras três.
 */

/** Ativa, Passiva, Assinatura. */
@Table({ tableName: "skill_natureza", timestamps: true, paranoid: true })
export class SkillNaturezaModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare item: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare descricao: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}

@Table({ tableName: "skill_tipo", timestamps: true, paranoid: true })
export class SkillTipoModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare item: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare descricao: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}

@Table({ tableName: "skill_categoria", timestamps: true, paranoid: true })
export class SkillCategoriaModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare item: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare descricao: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}

@Table({ tableName: "skill_tipo_dano", timestamps: true, paranoid: true })
export class SkillTipoDanoModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare item: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare descricao: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
