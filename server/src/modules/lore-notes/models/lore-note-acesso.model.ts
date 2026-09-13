import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * Quais personagens o mestre liberou para ler cada nota de visibilidade
 * 'escolhidos'. Tabela de conjunto, com UNIQUE(lore_note_id, character_id).
 *
 * paranoid desligado pelo mesmo motivo de npc_acesso_player: o índice único
 * é total, então uma linha soft-deletada continuaria ocupando o par e
 * reconceder o acesso daria chave duplicada. O conjunto é sempre gravado
 * inteiro (apaga tudo e reinsere), numa transação.
 */
@Table({ tableName: "lore_note_acesso", timestamps: true, paranoid: false })
export class LoreNoteAcessoModel extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare loreNoteId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare characterId: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;
}
