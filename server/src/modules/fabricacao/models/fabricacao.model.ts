import { Column, DataType, Model, Table } from "sequelize-typescript";

/** As quatro saídas da escada de qualidade (docs/FABRICAR.pdf). */
export const RESULTADOS_DE_FABRICACAO = ["desastre", "malfeito", "bemfeito", "obra_prima"] as const;
export type ResultadoDeFabricacao = (typeof RESULTADOS_DE_FABRICACAO)[number];

/**
 * Uma tentativa de fabricar. Histórico, não cadastro: sem soft delete e sem
 * `updated_at` — uma tentativa nunca muda depois de feita.
 */
@Table({ tableName: "fabricacoes", timestamps: true, updatedAt: false, paranoid: false })
export class FabricacaoModel extends Model {
  @Column(DataType.INTEGER)
  declare characterId: number;

  @Column(DataType.INTEGER)
  declare receitaId: number;

  @Column(DataType.INTEGER)
  declare rolagemD20: number;

  @Column(DataType.INTEGER)
  declare bonus: number;

  @Column(DataType.INTEGER)
  declare dificuldade: number;

  @Column(DataType.STRING(12))
  declare resultado: ResultadoDeFabricacao;

  @Column(DataType.BOOLEAN)
  declare oficinaConfirmada: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;
}
