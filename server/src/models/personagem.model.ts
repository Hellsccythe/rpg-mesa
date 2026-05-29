import {
  Table,
  Column,
  getTableName,
  getSelectFields,
  mapFromRow,
} from "../common/decorators/index.js";

// ==================== ENTITY ====================

export interface PersonagemEntity {
  characterId: string;
  userId: string;
  campaignId: string | null;
  username: string | null;
  name: string;
  level: number;
  data: Record<string, unknown>;
  avatarUrl: string | null;
  racaId: number | null;
  indoleId: number | null;
  generoId: number | null;
  aparenciaFisica: string | null;
  historiaTexto: string | null;
  historiaDocUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== MODEL (declaração da tabela) ====================

@Table("characters")
class PersonagemModel {
  @Column({ name: "id" })
  characterId!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @Column({ name: "campaign_id", nullable: true })
  campaignId!: string | null;

  @Column({ name: "username", nullable: true })
  username!: string | null;

  @Column({ name: "name" })
  name!: string;

  @Column({ name: "level" })
  level!: number;

  @Column({ name: "data" })
  data!: Record<string, unknown>;

  @Column({ name: "avatar_url", nullable: true })
  avatarUrl!: string | null;

  @Column({ name: "raca_id", nullable: true })
  racaId!: number | null;

  @Column({ name: "indole_id", nullable: true })
  indoleId!: number | null;

  @Column({ name: "genero_id", nullable: true })
  generoId!: number | null;

  @Column({ name: "aparencia_fisica", nullable: true })
  aparenciaFisica!: string | null;

  @Column({ name: "historia_texto", nullable: true })
  historiaTexto!: string | null;

  @Column({ name: "historia_doc_url", nullable: true })
  historiaDocUrl!: string | null;

  @Column({ name: "created_at" })
  createdAt!: string;

  @Column({ name: "updated_at" })
  updatedAt!: string;
}

// ==================== EXPORTS GERADOS PELOS DECORATORS ====================

export const PERSONAGEM_TABLE = getTableName(PersonagemModel);
export const PERSONAGEM_SELECT_FIELDS = getSelectFields(PersonagemModel);

export function mapPersonagem(row: Record<string, any>): PersonagemEntity {
  return mapFromRow<PersonagemEntity>(PersonagemModel, row);
}
