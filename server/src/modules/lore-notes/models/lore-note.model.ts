import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * Notas de lore que o mestre publica. `characterId` nulo significa nota
 * global, visível a todos; preenchido, a nota só aparece para aquele
 * personagem.
 *
 * A coluna character_id voltou na migration 068: existia como uuid desde a
 * 010, sumiu na conversão de PKs para INTEGER, e o backend continuou
 * filtrando por ela — o que deixava todas as rotas do módulo quebradas.
 */
@Table({ tableName: "lore_notes", timestamps: true, paranoid: true })
export class LoreNoteModel extends Model {
  @Column({ type: DataType.TEXT, allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare subtitle: string | null;

  /** NOT NULL com default '' — nunca gravar null aqui. */
  @Column({ type: DataType.TEXT, allowNull: false, defaultValue: "" })
  declare content: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare pdfUrl: string | null;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare ordem: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare characterId: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
