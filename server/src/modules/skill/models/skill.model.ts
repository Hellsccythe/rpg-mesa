import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * O catálogo de skills acumulou colunas de três desenhos diferentes. As que
 * o app usa hoje são name, description, os quatro campos de lookup,
 * multiplicador_atributo, damage_base, effect_description, custo, cooldown,
 * range e required_class.
 *
 * As demais continuam mapeadas porque a versão anterior fazia SELECT * e o
 * frontend recebia tudo — tirá-las agora mudaria o contrato sem necessidade.
 * São elas:
 *   damage_modifier, damage_type, cost — anteriores à migration 047, que
 *     trocou o par (damage_display, effect_value NUMERIC) por
 *     (multiplicador_atributo, damage_base TEXT). Ainda têm dados em 15, 16 e
 *     31 linhas, mas nenhum código lê.
 *   is_secret, required_class_id — nunca preenchidas.
 *   nivel_minimo_classe — o DashboardView usa para travar skill por nível,
 *     mas está nula em todas as linhas e nenhuma rota escreve; o recurso está
 *     inerte.
 */
@Table({ tableName: "skills", timestamps: true, paranoid: true })
export class SkillModel extends Model {
  @Column({ type: DataType.TEXT, allowNull: false })
  declare name: string;

  /** NOT NULL no banco — sem descrição vira string vazia, não null. */
  @Column({ type: DataType.TEXT, allowNull: false, defaultValue: "" })
  declare description: string;

  @Column({ type: DataType.ARRAY(DataType.TEXT), allowNull: true })
  declare racaVinculada: string[] | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare skillNaturezaItem: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare skillTipoItem: number | null;

  @Column({ type: DataType.ARRAY(DataType.INTEGER), allowNull: true })
  declare skillCategoriaItem: number[] | null;

  @Column({ type: DataType.ARRAY(DataType.INTEGER), allowNull: true })
  declare skillTipoDanoItem: number[] | null;

  /** text[] — lista plana, não matriz. */
  @Column({ type: DataType.ARRAY(DataType.TEXT), allowNull: true })
  declare multiplicadorAtributo: string[] | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare damageBase: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare effectDescription: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare custo: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 0 })
  declare cooldown: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare range: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare requiredClass: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare nivelMinimoClasse: number | null;

  // ── Colunas legadas, preservadas no retorno ───────────────────────────────

  @Column({ type: DataType.JSONB, allowNull: true })
  declare damageModifier: Record<string, unknown> | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare damageType: string | null;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare cost: Record<string, unknown> | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isSecret: boolean;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare requiredClassId: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
