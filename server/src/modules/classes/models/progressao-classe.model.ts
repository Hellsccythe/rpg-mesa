import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * XP necessário para cada nível dentro de uma classe (1 a 20, garantido por
 * CHECK no banco). Diferente de level_progression, que é a progressão do
 * personagem como um todo.
 *
 * paranoid fica desligado de propósito: a tabela tem deleted_at e deleted_by,
 * mas o UNIQUE(classe_id, nivel) é total, não parcial. Com soft delete, a
 * linha apagada continuaria ocupando o par (classe, nível) e recriar aquele
 * nível daria erro de chave duplicada — sem que a listagem mostrasse o
 * culpado, já que ele estaria filtrado. Enquanto o índice for total, apagar
 * aqui tem que ser apagar de verdade.
 */
@Table({ tableName: "class_level_progression", timestamps: true, paranoid: false })
export class ProgressaoClasseModel extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare classeId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare nivel: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare xpNecessario: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;
}
