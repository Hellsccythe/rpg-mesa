import { Column, DataType, Model, Table } from "sequelize-typescript";

export type HabilidadeDeRaca = { nome: string; descricao: string };
export type BonusDeAtributoDeRaca = { atributo: string; valor: string };

/**
 * habilidades e atributos_bonus são JSONB de propósito: são listas de objetos
 * pequenos que só existem dentro da raça e nunca são consultadas por conta
 * própria. Situação diferente da de gods, onde o JSONB só duplicava colunas
 * que já existiam e por isso foi desfeito na migration 063.
 */
@Table({ tableName: "racas", timestamps: true, paranoid: true })
export class RacaModel extends Model {
  @Column(DataType.TEXT)
  declare nome: string;

  /** Caminho relativo no armazenamento, ex: "racas/elfo.png". */
  @Column({ type: DataType.TEXT, allowNull: true })
  declare fotoUrl: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descricao: string | null;

  /** Texto longo visível só para o mestre — a listagem pública não devolve. */
  @Column({ type: DataType.TEXT, allowNull: true })
  declare lore: string | null;

  @Column({ type: DataType.JSONB, defaultValue: [] })
  declare habilidades: HabilidadeDeRaca[];

  @Column({ type: DataType.JSONB, defaultValue: [] })
  declare atributosBonus: BonusDeAtributoDeRaca[];

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
