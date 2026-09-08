import { Column, DataType, Model, Table } from "sequelize-typescript";
import type { TabelaDeItem } from "./receita.model.js";

/**
 * Um insumo de uma receita.
 *
 * `paranoid: false` de propósito: os ingredientes são detalhe da receita,
 * editados como conjunto (apaga tudo e reinsere). Soft delete aqui só
 * acumularia linhas mortas, e o índice único é total justamente porque não
 * existe linha apagada para ocupar a chave.
 */
@Table({ tableName: "receita_ingredientes", timestamps: true, paranoid: false })
export class ReceitaIngredienteModel extends Model {
  @Column(DataType.INTEGER)
  declare receitaId: number;

  @Column(DataType.STRING(20))
  declare ingredienteTabela: TabelaDeItem;

  @Column(DataType.INTEGER)
  declare ingredienteId: number;

  @Column(DataType.INTEGER)
  declare quantidade: number;

  /**
   * Falso para ferramenta: o alambique é exigido pela receita mas não some ao
   * ser usado. Sem isto, o jogador perderia o alambique a cada poção.
   */
  @Column(DataType.BOOLEAN)
  declare consumido: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;
}
