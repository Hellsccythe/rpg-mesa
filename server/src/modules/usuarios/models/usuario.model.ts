import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * Mapeia a tabela usuarios já existente no banco (migrations 027 e 062).
 * Não representa o módulo /api/usuarios inteiro (que ainda roda em
 * Express/Supabase) — só o suficiente pra login e auditoria funcionarem.
 */
@Table({ tableName: "usuarios", timestamps: true, paranoid: true })
export class UsuarioModel extends Model {
  @Column(DataType.TEXT)
  declare realEmail: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare username: string | null;

  @Column(DataType.TEXT)
  declare tipo: "gm" | "player";

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare ativo: boolean;

  /** Nulo significa pré-registro: email liberado, conta ainda não criada. */
  @Column({ type: DataType.TEXT, allowNull: true })
  declare passwordHash: string | null;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare requiresPasswordChange: boolean;

  /**
   * Quantos personagens vivos a conta pode ter no MESMO mundo (migration
   * 101). O mestre decide no pré-registro; padrão 1. Em mundos diferentes
   * não há limite: é um personagem por mundo, no mínimo.
   */
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare limitePersonagensPorMundo: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
