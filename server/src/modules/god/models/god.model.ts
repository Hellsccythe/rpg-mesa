import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * Depois da migration 063, todos os campos vivem em colunas reais. O JSONB
 * "data" e a coluna image_path continuam existindo no banco por segurança,
 * mas não são mais lidos nem escritos — serão removidos numa migration
 * futura, quando este código estiver rodando estável.
 */
@Table({ tableName: "gods", timestamps: true, paranoid: true })
export class GodModel extends Model {
  /** O mundo do deus (migration 101). O nome é único por mundo, entre os vivos. */
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare campaignId: number;

  @Column(DataType.TEXT)
  declare name: string;

  @Column({ type: DataType.TEXT, defaultValue: "" })
  declare description: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare title: string | null;

  /** Texto legado do alinhamento; a referência boa é indoleId. */
  @Column({ type: DataType.TEXT, defaultValue: "" })
  declare indole: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare indoleId: number | null;

  @Column({ type: DataType.TEXT, defaultValue: "" })
  declare dogma: string;

  @Column({ type: DataType.TEXT, defaultValue: "" })
  declare anatema: string;

  @Column({ type: DataType.TEXT, defaultValue: "" })
  declare weapons: string;

  @Column({ type: DataType.TEXT, defaultValue: "" })
  declare shortDescription: string;

  /** Caminho relativo no armazenamento, ex: "gods/pharasma.webp". */
  @Column({ type: DataType.TEXT, allowNull: true })
  declare imageUrl: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
