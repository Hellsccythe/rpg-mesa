import { getAdminClient, getSupabaseClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess, getMasterEmails, getUserDisplayEmail } from "../../common/helpers/master-access.helper.js";

const TABLE = "player_telas";

export const TELAS_DISPONIVEIS = [
  "deuses", "cidade", "skills", "titulos", "classes",
  "npcs", "racas", "equipamentos", "notas",
] as const;

export type TelaId = typeof TELAS_DISPONIVEIS[number];

export const playerTelasService = {
  async listarTelasPlayer(characterId: number): Promise<TelaId[]> {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from(TABLE)
      .select("tela")
      .eq("character_id", characterId);
    if (error) throw error;
    return (data ?? []).map((r: any) => r.tela as TelaId);
  },

  async listarTelasPlayerAdmin(characterId: number, accessToken?: string): Promise<TelaId[]> {
    await ensureMasterAccess(accessToken);
    return this.listarTelasPlayer(characterId);
  },

  async definirTelas(characterId: number, telas: TelaId[], accessToken?: string): Promise<TelaId[]> {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const email = getUserDisplayEmail(user);

    const telasValidas = telas.filter(t => (TELAS_DISPONIVEIS as readonly string[]).includes(t));

    await admin.from(TABLE).delete().eq("character_id", characterId);

    if (telasValidas.length) {
      const rows = telasValidas.map(tela => ({
        character_id: characterId,
        tela,
        created_by: email,
      }));
      const { error } = await admin.from(TABLE).insert(rows);
      if (error) throw error;
    }

    return telasValidas;
  },
};
