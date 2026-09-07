import { Column, DataType, Model, Table } from "sequelize-typescript";

export type BonusDeAtributo = {
  aura?: number;
  forca?: number;
  destreza?: number;
  resistencia?: number;
  inteligencia?: number;
};

@Table({ tableName: "titles", timestamps: true, paranoid: true })
export class TituloModel extends Model {
  @Column({ type: DataType.TEXT, allowNull: false })
  declare name: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare tier: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare description: string;

  /** NOT NULL com default '{}' — nunca gravar null aqui. */
  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} })
  declare bonuses: BonusDeAtributo;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} })
  declare requirements: Record<string, unknown>;

  @Column({ type: DataType.ARRAY(DataType.INTEGER), allowNull: false, defaultValue: [] })
  declare skillIds: number[];

  /** Esconde os requisitos na tela do jogador. */
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isHidden: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare linkedHiddenClass: boolean;

  /**
   * Quando preenchido, o título só é visível para quem teve aquela classe
   * secreta revelada.
   */
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare classeSecretaId: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
