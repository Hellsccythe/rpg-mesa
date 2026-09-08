import { Column, DataType, Model, Table } from "sequelize-typescript";

export type AtributoBonus = {
  aura?: number;
  forca?: number;
  destreza?: number;
  resistencia?: number;
  inteligencia?: number;
};

/** As moedas do jogo, da menor para a maior. */
export const MOEDAS = ["bronze", "prata", "ouro"] as const;
export type Moeda = (typeof MOEDAS)[number];

/**
 * Uma rolagem de dinheiro inicial: `2d100` de prata é
 * `{ quantidade: 2, faces: 100, moeda: "prata" }`.
 *
 * O passado concede uma LISTA delas porque pode dar mais de um dado, em mais
 * de uma moeda — o Aventureiro dá 1d100 de prata e 1d4 de ouro.
 */
export type RolagemDeDinheiro = {
  quantidade: number;
  faces: number;
  moeda: Moeda;
};

@Table({ tableName: "passados", timestamps: true, paranoid: true })
export class PassadoModel extends Model {
  @Column(DataType.STRING(100))
  declare nome: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descricao: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare fotoUrl: string | null;

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  declare skillIds: number[];

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  declare tituloIds: number[];

  @Column({ type: DataType.JSONB, allowNull: true })
  declare atributoBonus: AtributoBonus | null;

  @Column({ type: DataType.JSONB, defaultValue: [] })
  declare dinheiroInicial: RolagemDeDinheiro[];

  /** Ranks de perícia que o passado concede de graça, no onboarding. */
  @Column({ type: DataType.JSONB, defaultValue: [] })
  declare periciasIniciais: Array<{ periciaId: number; rank: number }>;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
