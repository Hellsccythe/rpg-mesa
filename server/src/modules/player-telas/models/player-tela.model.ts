import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * Quais telas o mestre liberou para cada personagem. É uma tabela de conjunto:
 * uma linha por (personagem, tela), com UNIQUE nos dois.
 *
 * paranoid desligado: definir as telas apaga tudo do personagem e regrava o
 * conjunto novo. Com soft delete, as linhas apagadas continuariam ocupando o
 * par e a regravação daria chave duplicada — além de o histórico crescer sem
 * limite a cada ajuste.
 */
@Table({ tableName: "player_telas", timestamps: true, paranoid: false })
export class PlayerTelaModel extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare characterId: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare tela: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;
}
