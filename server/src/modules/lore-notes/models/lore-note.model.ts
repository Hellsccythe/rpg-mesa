import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * 'livro' abre com capa e folhas; os outros três são uma folha só e diferem
 * na cara do papel: pergaminho (rolo antigo), bilhete (papel pequeno,
 * amassado) e carta (folha com cabeçalho e lacre).
 */
export const FORMATOS_DA_NOTA = ["livro", "pergaminho", "bilhete", "carta"] as const;
export type FormatoDaNota = (typeof FORMATOS_DA_NOTA)[number];

/**
 * 'todos'      — todo personagem do mundo vê
 * 'escolhidos' — só quem está em lore_note_acesso
 * 'ninguem'    — rascunho: o mestre ainda não liberou
 */
export const VISIBILIDADES_DA_NOTA = ["todos", "escolhidos", "ninguem"] as const;
export type VisibilidadeDaNota = (typeof VISIBILIDADES_DA_NOTA)[number];

/**
 * Notas de lore que o mestre publica — livros, pergaminhos, bilhetes, cartas.
 *
 * Cada nota pertence a um mundo (`campaignId`, migration 099) e é liberada
 * por `visibilidade`: para todos, para uma lista de personagens
 * (`LoreNoteAcessoModel`) ou para ninguém. A coluna `character_id` de antes
 * (um personagem só, nulo = global) saiu na mesma migration.
 */
@Table({ tableName: "lore_notes", timestamps: true, paranoid: true })
export class LoreNoteModel extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare campaignId: number;

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

  @Column({ type: DataType.TEXT, allowNull: false, defaultValue: "todos" })
  declare visibilidade: VisibilidadeDaNota;

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
