import { getAdminClient, getSupabaseClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
import type { CriarRacaDto, EditarRacaDto } from "./raca.dto.js";

const RACAS_TABLE = "racas";

export type RacaApi = {
  id: string;
  nome: string;
  foto_url: string | null;
  descricao: string | null;
  lore: string | null;
  habilidades: { nome: string; descricao: string }[];
  atributos_bonus: { atributo: string; valor: string }[];
  createdAt?: string;
  updatedAt?: string;
};

const SELECT_FIELDS =
  "id, nome, foto_url, descricao, lore, habilidades, atributos_bonus, created_at, updated_at";

function mapRaca(row: any): RacaApi {
  return {
    id: String(row?.id ?? ""),
    nome: typeof row?.nome === "string" ? row.nome.trim() : "",
    foto_url: row?.foto_url ?? null,
    descricao: row?.descricao ?? null,
    lore: row?.lore ?? null,
    habilidades: Array.isArray(row?.habilidades) ? row.habilidades : [],
    atributos_bonus: Array.isArray(row?.atributos_bonus) ? row.atributos_bonus : [],
    createdAt: row?.created_at,
    updatedAt: row?.updated_at,
  };
}

export const racaService = {
  async listarPublico() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from(RACAS_TABLE)
      .select("id, nome, foto_url, descricao, habilidades, atributos_bonus, created_at, updated_at")
      .is("deleted_at", null)
      .order("nome", { ascending: true });

    if (error) throw error;
    // lore NÃO é retornado na listagem pública
    return (data ?? []).map((row: any) => ({ ...mapRaca(row), lore: null }));
  },

  async listar(accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from(RACAS_TABLE)
      .select(SELECT_FIELDS)
      .is("deleted_at", null)
      .order("nome", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapRaca);
  },

  async criar(dto: CriarRacaDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from(RACAS_TABLE)
      .insert({
        nome: dto.nome.trim(),
        foto_url: dto.foto_url?.trim() ?? null,
        descricao: dto.descricao?.trim() ?? null,
        lore: dto.lore?.trim() ?? null,
        habilidades: dto.habilidades ?? [],
        atributos_bonus: dto.atributos_bonus ?? [],
      })
      .select(SELECT_FIELDS)
      .single();

    if (error) throw error;
    return mapRaca(data);
  },

  async editar(racaId: string, dto: EditarRacaDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: current, error: currentError } = await admin
      .from(RACAS_TABLE)
      .select("id")
      .eq("id", racaId)
      .is("deleted_at", null)
      .single();

    if (currentError || !current) throw new Error("Raça não encontrada");

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (dto.nome !== undefined)           updates.nome = dto.nome.trim();
    if (dto.foto_url !== undefined)       updates.foto_url = dto.foto_url?.trim() ?? null;
    if (dto.descricao !== undefined)      updates.descricao = dto.descricao?.trim() ?? null;
    if (dto.lore !== undefined)           updates.lore = dto.lore?.trim() ?? null;
    if (dto.habilidades !== undefined)    updates.habilidades = dto.habilidades;
    if (dto.atributos_bonus !== undefined) updates.atributos_bonus = dto.atributos_bonus;

    const { data, error } = await admin
      .from(RACAS_TABLE)
      .update(updates)
      .eq("id", racaId)
      .is("deleted_at", null)
      .select(SELECT_FIELDS)
      .single();

    if (error) throw error;
    return mapRaca(data);
  },

  async deletar(racaId: string, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: raca, error: fetchError } = await admin
      .from(RACAS_TABLE)
      .select("id")
      .eq("id", racaId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !raca) throw new Error("Raça não encontrada");

    const { error } = await admin
      .from(RACAS_TABLE)
      .update({ deleted_at: new Date().toISOString(), deleted_by: masterUser.id })
      .eq("id", racaId)
      .is("deleted_at", null);

    if (error) throw error;
    return { success: true };
  },
};
