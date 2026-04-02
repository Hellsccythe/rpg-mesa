// server/src/modules/personagem/personagens.service.ts
import { getAdminClient, getSupabaseClient } from "../../config/database/supabase/client.js";
import {
  PERSONAGEM_SELECT_FIELDS,
  PERSONAGEM_TABLE,
  mapPersonagem,
} from "../../models/personagem.model.js";
import type { EditarPersonagemDto, SalvarPersonagemDto } from "./personagens.dto.js";

export interface FiltroPersonagens {
  nome?: string;
  minLevel?: number;
  maxLevel?: number;
  campaignId?: string | null;
}

export interface PersonagemPublico {
  characterId: string;
  name: string;
  level: number;
  avatarUrl: string | null;
  classe: string | null;
}

export const personagensService = {
  /**
   * Lista todos os personagens publicamente (sem auth).
   * Usa o admin client para bypassar RLS e retorna apenas campos seguros.
   * Requer SUPABASE_SERVICE_ROLE_KEY no .env do servidor.
   */
  async listarTodosPublico(): Promise<PersonagemPublico[]> {
    const admin = getAdminClient();

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id, name, level, avatar_url, data")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      characterId: row.id,
      name: row.name,
      level: row.level,
      avatarUrl: row.avatar_url ?? null,
      classe: (row.data as any)?.classes?.[0]?.name ?? null,
    }));
  },

  async getUsuario(accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new Error("Usuário não autenticado");
    return { id: user.id, email: user.email };
  },

  async listarMeusPersonagens(filtro: FiltroPersonagens = {}, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    let query = supabase
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (filtro.nome?.trim()) {
      query = query.ilike("name", `%${filtro.nome.trim()}%`);
    }
    if (filtro.minLevel !== undefined) {
      query = query.gte("level", filtro.minLevel);
    }
    if (filtro.maxLevel !== undefined) {
      query = query.lte("level", filtro.maxLevel);
    }
    if (filtro.campaignId !== undefined) {
      if (filtro.campaignId === null) {
        query = query.is("campaign_id", null);
      } else {
        query = query.eq("campaign_id", filtro.campaignId);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(mapPersonagem);
  },

  async salvarPersonagem(payload: SalvarPersonagemDto, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from(PERSONAGEM_TABLE)
      .insert({
        user_id: user.id,
        name: payload.name,
        level: payload.level ?? 1,
        data: payload.data ?? {},
      })
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();

    if (error) throw error;
    return mapPersonagem(data);
  },

  async editarPersonagem(characterId: string, dto: EditarPersonagemDto, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Usuário não autenticado");

    const updates: Record<string, unknown> = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.level !== undefined) updates.level = dto.level;
    if (dto.data !== undefined) updates.data = dto.data;

    const { data, error } = await supabase
      .from(PERSONAGEM_TABLE)
      .update(updates)
      .eq("id", characterId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();

    if (error) throw error;
    return mapPersonagem(data);
  },

  async obterMeuPersonagemPorId(characterId: string, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (error) throw error;
    return mapPersonagem(data);
  },

  async deletarMeuPersonagem(characterId: string, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from(PERSONAGEM_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", characterId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .select("id")
      .single();

    if (error) throw error;
    return { success: !!data?.id };
  },
};
