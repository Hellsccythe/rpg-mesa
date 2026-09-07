import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * Quem detém cada classe secreta no momento. Não é histórico: é um ponteiro
 * para o titular atual, garantido único pelo UNIQUE(classe_id).
 *
 * paranoid desligado pelo mesmo motivo de ProgressaoClasseModel — com soft
 * delete a linha revogada continuaria ocupando o classe_id e ninguém mais
 * conseguiria receber aquela classe. Revogar tem que liberar de verdade.
 */
@Table({ tableName: "classe_secreta_revelada", timestamps: true, paranoid: false })
export class ClasseSecretaReveladaModel extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare classeId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare characterId: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare revealedAt: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare revealedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;
}
