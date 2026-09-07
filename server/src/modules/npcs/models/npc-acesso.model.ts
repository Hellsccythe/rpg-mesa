import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * Quais personagens o mestre liberou para ver cada NPC. Tabela de conjunto,
 * com UNIQUE(npc_id, character_id).
 *
 * paranoid desligado: o índice único é total, então uma linha soft-deletada
 * continuaria ocupando o par e reconceder o acesso daria chave duplicada.
 * Mesma situação de classe_secreta_revelada e player_telas.
 */
@Table({ tableName: "npc_acesso_player", timestamps: true, paranoid: false })
export class NpcAcessoModel extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare npcId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare characterId: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;
}
