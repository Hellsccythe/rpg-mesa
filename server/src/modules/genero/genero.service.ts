import { getAdminClient, getSupabaseClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";

export type GeneroRecord = {
  id: number;
  codigo: string;
  descricao: string;
  pronome: string;
  created_at?: string;
};

export const generoService = {
  async listar(): Promise<GeneroRecord[]> {
    const { data, error } = await getSupabaseClient()
      .from("genero")
      .select("id, codigo, descricao, pronome, created_at")
      .order("id", { ascending: true });
    if (error) throw error;
    return (data ?? []) as GeneroRecord[];
  },

  async criar(
    dto: { codigo: string; descricao: string; pronome?: string },
    accessToken?: string,
  ): Promise<GeneroRecord> {
    await ensureMasterAccess(accessToken);
    const { data, error } = await getAdminClient()
      .from("genero")
      .insert({
        codigo: dto.codigo.trim(),
        descricao: dto.descricao.trim(),
        pronome: dto.pronome?.trim() ?? "",
      })
      .select("id, codigo, descricao, pronome, created_at")
      .single();
    if (error) throw error;
    return data as GeneroRecord;
  },

  async editar(
    id: number,
    dto: { codigo?: string; descricao?: string; pronome?: string },
    accessToken?: string,
  ): Promise<GeneroRecord> {
    await ensureMasterAccess(accessToken);
    const updates: Record<string, unknown> = {};
    if (dto.codigo !== undefined) updates.codigo = dto.codigo.trim();
    if (dto.descricao !== undefined) updates.descricao = dto.descricao.trim();
    if (dto.pronome !== undefined) updates.pronome = dto.pronome.trim();
    const { data, error } = await getAdminClient()
      .from("genero")
      .update(updates)
      .eq("id", id)
      .select("id, codigo, descricao, pronome, created_at")
      .single();
    if (error) throw error;
    return data as GeneroRecord;
  },

  async deletar(id: number, accessToken?: string): Promise<{ success: boolean }> {
    await ensureMasterAccess(accessToken);
    const { error } = await getAdminClient()
      .from("genero")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  },
};
