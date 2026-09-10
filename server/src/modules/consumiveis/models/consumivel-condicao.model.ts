import { Column, DataType, Model, Table } from "sequelize-typescript";

/** `cura` remove o que já se sofreu; `previne` imuniza por um tempo. */
export const ACOES_SOBRE_CONDICAO = ["cura", "previne"] as const;
export type AcaoSobreCondicao = (typeof ACOES_SOBRE_CONDICAO)[number];

/**
 * O vínculo entre um consumível e a condição que ele resolve. É o que dá razão
 * de existir a uma poção que não cura vida: sem esta linha, "Elixir de Olhos
 * Claros" é só um texto bonito.
 *
 * `paranoid: false` e `updatedAt: false` de propósito: os vínculos são detalhe
 * do consumível, editados como conjunto (apaga tudo e reinsere), então nunca há
 * o que atualizar numa linha existente e soft delete só acumularia lixo. É
 * também por isso que o índice único da tabela é total, não parcial.
 */
@Table({
  tableName: "consumivel_condicao",
  timestamps: true,
  updatedAt: false,
  paranoid: false,
})
export class ConsumivelCondicaoModel extends Model {
  @Column(DataType.INTEGER)
  declare consumivelId: number;

  @Column(DataType.INTEGER)
  declare condicaoId: number;

  @Column(DataType.STRING(10))
  declare acao: AcaoSobreCondicao;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;
}
