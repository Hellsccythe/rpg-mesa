import { getAdminClient, getSupabaseClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess, getMasterEmails, getUserDisplayEmail } from "../../common/helpers/master-access.helper.js";

const TABLE       = "npcs";
const ACESSO_TABLE = "npc_acesso_player";

export type NpcApi = {
  id: number;
  nome: string;
  raca_id: number | null;
  raca_nome: string | null;
  descricao: string | null;
  foto_url: string | null;
  created_at: string;
  updated_at: string;
};

export type NpcAcessoPlayer = {
  character_id: number;
  nome: string;
  username: string | null;
  tem_acesso: boolean;
};

function mapRow(row: any, racaMap: Record<number, string>): NpcApi {
  return {
    id:        row.id,
    nome:      row.nome ?? "",
    raca_id:   row.raca_id ?? null,
    raca_nome: row.raca_id ? (racaMap[row.raca_id] ?? null) : null,
    descricao: row.descricao ?? null,
    foto_url:  row.foto_url ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function buildRacaMap(rows: any[], admin: ReturnType<typeof getAdminClient>) {
  const racaIds = [...new Set<number>(rows.map(r => r.raca_id).filter(Boolean))];
  if (!racaIds.length) return {} as Record<number, string>;

  const { data } = await admin
    .from("racas")
    .select("id, nome")
    .in("id", racaIds)
    .is("deleted_at", null);

  const map: Record<number, string> = {};
  for (const r of (data ?? [])) map[r.id] = r.nome;
  return map;
}

export const npcsService = {
  async listarAdmin(accessToken?: string): Promise<NpcApi[]> {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { data, error } = await admin
      .from(TABLE)
      .select("*")
      .is("deleted_at", null)
      .order("nome");
    if (error) throw error;
    const rows = data ?? [];
    const racaMap = await buildRacaMap(rows, admin);
    return rows.map(r => mapRow(r, racaMap));
  },

  async listarPlayer(characterId: number, accessToken?: string): Promise<NpcApi[]> {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error("Usuário não autenticado");

    const admin = getAdminClient();

    const { data: acessos } = await admin
      .from(ACESSO_TABLE)
      .select("npc_id")
      .eq("character_id", characterId);

    const npcIds = (acessos ?? []).map((a: any) => a.npc_id);
    if (!npcIds.length) return [];

    const { data, error } = await admin
      .from(TABLE)
      .select("*")
      .in("id", npcIds)
      .is("deleted_at", null)
      .order("nome");
    if (error) throw error;

    const rows = data ?? [];
    const racaMap = await buildRacaMap(rows, admin);
    return rows.map(r => mapRow(r, racaMap));
  },

  async criar(
    payload: { nome: string; raca_id?: number; descricao?: string; foto_url?: string },
    accessToken?: string,
  ): Promise<NpcApi> {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { data, error } = await admin
      .from(TABLE)
      .insert({
        nome:       payload.nome.trim(),
        raca_id:    payload.raca_id ?? null,
        descricao:  payload.descricao?.trim() ?? null,
        foto_url:   payload.foto_url?.trim() || null,
        created_by: getUserDisplayEmail(user),
        updated_by: getUserDisplayEmail(user),
      })
      .select("*")
      .single();
    if (error) throw error;
    const racaMap = await buildRacaMap([data], admin);
    return mapRow(data, racaMap);
  },

  async editar(
    id: number,
    payload: { nome?: string; raca_id?: number | null; descricao?: string; foto_url?: string },
    accessToken?: string,
  ): Promise<NpcApi> {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const updates: Record<string, any> = {
      updated_by: getUserDisplayEmail(user),
      updated_at: new Date().toISOString(),
    };
    if (payload.nome      !== undefined) updates.nome      = payload.nome.trim();
    if (payload.raca_id   !== undefined) updates.raca_id   = payload.raca_id;
    if (payload.descricao !== undefined) updates.descricao = payload.descricao?.trim() ?? null;
    if (payload.foto_url  !== undefined) updates.foto_url  = payload.foto_url?.trim() || null;

    const { data, error } = await admin
      .from(TABLE)
      .update(updates)
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    if (error) throw error;
    if (!data) throw new Error("NPC não encontrado.");
    const racaMap = await buildRacaMap([data], admin);
    return mapRow(data, racaMap);
  },

  async deletar(id: number, accessToken?: string): Promise<void> {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { error } = await admin
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString(), deleted_by: getUserDisplayEmail(user) })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw error;
  },

  async listarAcessosNpc(npcId: number, accessToken?: string): Promise<NpcAcessoPlayer[]> {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const [{ data: acessos }, { data: personagens }] = await Promise.all([
      admin.from(ACESSO_TABLE).select("character_id").eq("npc_id", npcId),
      admin.from("characters").select("id, name, username").is("deleted_at", null).neq("raca_id", null),
    ]);

    const idsComAcesso = new Set((acessos ?? []).map((a: any) => a.character_id));

    return (personagens ?? []).map((p: any) => ({
      character_id: p.id,
      nome:         p.name ?? "",
      username:     p.username ?? null,
      tem_acesso:   idsComAcesso.has(p.id),
    }));
  },

  async concederAcesso(npcId: number, characterId: number, accessToken?: string): Promise<void> {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { error } = await admin
      .from(ACESSO_TABLE)
      .upsert({ npc_id: npcId, character_id: characterId, created_by: getUserDisplayEmail(user) }, { onConflict: "npc_id,character_id" });
    if (error) throw error;
  },

  async revogarAcesso(npcId: number, characterId: number, accessToken?: string): Promise<void> {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { error } = await admin
      .from(ACESSO_TABLE)
      .delete()
      .eq("npc_id", npcId)
      .eq("character_id", characterId);
    if (error) throw error;
  },
};
