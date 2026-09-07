import { Column, DataType, Model, Table } from "sequelize-typescript";

export type StatusDaSolicitacao = "pendente" | "aprovado" | "rejeitado";

/**
 * Pedido de criação de personagem, aguardando o mestre aprovar.
 *
 * password_hash guarda um hash bcrypt, não mais a senha cifrada. A versão
 * anterior usava AES-256-CBC reversível porque precisava do texto puro para
 * criar a conta no Supabase Auth; agora a conta nasce aqui e o hash é
 * simplesmente transferido para usuarios.password_hash na aprovação. A senha
 * do jogador deixa de ser recuperável a partir do banco.
 */
@Table({ tableName: "character_creation_requests", timestamps: true, paranoid: true })
export class SolicitacaoCriacaoModel extends Model {
  @Column({ type: DataType.TEXT, allowNull: false })
  declare email: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare username: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare passwordHash: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare nome: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare avatarUrl: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare indoleId: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare generoId: number | null;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare aparenciaFisica: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare historiaTexto: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare historiaDocUrl: string | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: "pendente" })
  declare status: StatusDaSolicitacao;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare rejeitadoMotivo: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare revisadoEm: Date | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare revisadoPor: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare campaignId: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
