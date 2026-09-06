import type { PersonagemModel } from "./models/personagem.model.js";

/**
 * Formato que o frontend consome (client/src/types/supabase.ts →
 * PersonagemApi). Vale a pena manter esta tradução explícita: o model do
 * Sequelize expõe a chave primária como "id", enquanto todo o frontend
 * procura por "characterId" — devolver o model cru faz as telas perderem o
 * personagem sem erro nenhum, só uma lista que não seleciona nada.
 */
export type PersonagemApi = {
  characterId: number;
  userId: number;
  campaignId: number | null;
  username: string | null;
  name: string;
  level: number;
  data: Record<string, unknown>;
  avatarUrl: string | null;
  racaId: number | null;
  classeId: number | null;
  passadoId: number | null;
  deusId: number | null;
  onboardingCompleto: boolean;
  status: string;
  indoleId: number | null;
  generoId: number | null;
  aparenciaFisica: string | null;
  historiaTexto: string | null;
  historiaDocUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

function formatarData(valor: unknown): string | null {
  return valor instanceof Date ? valor.toISOString() : null;
}

export function mapearPersonagemParaApi(personagem: PersonagemModel): PersonagemApi {
  return {
    characterId: personagem.id,
    userId: personagem.userId,
    campaignId: personagem.campaignId,
    username: personagem.username,
    name: personagem.name,
    level: personagem.level,
    data: (personagem.data ?? {}) as Record<string, unknown>,
    avatarUrl: personagem.avatarUrl,
    racaId: personagem.racaId,
    classeId: personagem.classeId,
    passadoId: personagem.passadoId,
    deusId: personagem.deusId,
    onboardingCompleto: personagem.onboardingCompleto,
    status: personagem.status,
    indoleId: personagem.indoleId,
    generoId: personagem.generoId,
    aparenciaFisica: personagem.aparenciaFisica,
    historiaTexto: personagem.historiaTexto,
    historiaDocUrl: personagem.historiaDocUrl,
    createdAt: formatarData(personagem.get("createdAt")),
    updatedAt: formatarData(personagem.get("updatedAt")),
  };
}
