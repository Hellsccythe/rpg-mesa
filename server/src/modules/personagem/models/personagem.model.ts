import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * Substitui o antigo src/models/personagem.model.ts, que usava os decorators
 * caseiros de common/decorators (feitos para montar strings de select do
 * Supabase). Aqueles saem de cena quando o último módulo Express migrar.
 *
 * O JSONB "data" concentra o que é do personagem e varia bastante entre eles:
 * skills, títulos, atributos, classes, notas de aventura, equipamentos
 * iniciais, posição do avatar. É dado genuinamente aninhado — mesma situação
 * de city_maps, e diferente de gods, onde o JSONB só duplicava colunas.
 */
export type DadosPersonagem = Record<string, unknown>;

@Table({ tableName: "characters", timestamps: true, paranoid: true })
export class PersonagemModel extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare campaignId: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare username: string | null;

  @Column(DataType.TEXT)
  declare name: string;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  declare level: number;

  @Column({ type: DataType.JSONB, defaultValue: {} })
  declare data: DadosPersonagem;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare avatarUrl: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare racaId: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare classeId: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare passadoId: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare deusId: number | null;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare onboardingCompleto: boolean;

  @Column({ type: DataType.TEXT, defaultValue: "vivo" })
  declare status: "vivo" | "morto";

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare indoleId: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare generoId: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare aparenciaFisica: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare historiaTexto: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare historiaDocUrl: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}
