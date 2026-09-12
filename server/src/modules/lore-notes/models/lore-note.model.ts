import { Column, DataType, Model, Table } from "sequelize-typescript";

export const FORMATOS_DA_NOTA = ["livro", "pergaminho"] as const;
export type FormatoDaNota = (typeof FORMATOS_DA_NOTA)[number];

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

  /** 'livro' abre como livro; 'pergaminho' é uma folha só (migration 098). */
  @Column({ type: DataType.TEXT, allowNull: false, defaultValue: "livro" })
  declare formato: FormatoDaNota;

  /** Caminho relativo da capa; nulo usa a capa padrão desenhada pelo leitor. */
  @Column({ type: DataType.TEXT, allowNull: true })
  declare capaUrl: string | null;

  /** Caminho relativo da contracapa; nulo repete a capa, sem o título. */
  @Column({ type: DataType.TEXT, allowNull: true })
  declare contracapaUrl: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
