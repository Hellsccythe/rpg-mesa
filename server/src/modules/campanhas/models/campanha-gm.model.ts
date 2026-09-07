import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * Emails de mestres vinculados a uma campanha.
 *
 * Diferente das outras tabelas de vínculo do projeto, esta NÃO tem índice
 * único em (campaign_id, email) — dava para cadastrar o mesmo GM várias vezes.
 * O código antigo tratava o erro 23505 de chave duplicada, que nunca podia
 * acontecer. A checagem agora é feita no service.
 *
 * Como não há índice único, aqui o soft delete funciona sem travar nada.
 */
@Table({ tableName: "campaign_gms", timestamps: true, paranoid: true })
export class CampanhaGmModel extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare campaignId: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare email: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
