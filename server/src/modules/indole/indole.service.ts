import { getAdminClient, getSupabaseClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";

export type IndoleRecord = {
  id: number;
  codigo: string;
  descricao: string;
  created_at?: string;
};

export const indoleService = {
  async listar(): Promise<IndoleRecord[]> {
    const { data, error } = await getSupabaseClient()
      .from("indole")
      .select("id, codigo, descricao, created_at")
      .order("id", { ascending: true });
    if (error) throw error;
    return (data ?? []) as IndoleRecord[];
  },

  async criar(dto: { codigo: string; descricao: string }, accessToken?: string): Promise<IndoleRecord> {
    await ensureMasterAccess(accessToken);
    const { data, error } = await getAdminClient()
      .from("indole")
      .insert({ codigo: dto.codigo.trim(), descricao: dto.descricao.trim() })
      .select("id, codigo, descricao, created_at")
      .single();
    if (error) throw error;
    return data as IndoleRecord;
  },

  async editar(id: number, dto: { codigo?: string; descricao?: string }, accessToken?: string): Promise<IndoleRecord> {
    await ensureMasterAccess(accessToken);
    const updates: Record<string, unknown> = {};
    if (dto.codigo !== undefined) updates.codigo = dto.codigo.trim();
    if (dto.descricao !== undefined) updates.descricao = dto.descricao.trim();
    const { data, error } = await getAdminClient()
      .from("indole")
      .update(updates)
      .eq("id", id)
      .select("id, codigo, descricao, created_at")
      .single();
    if (error) throw error;
    return data as IndoleRecord;
  },

  async deletar(id: number, accessToken?: string): Promise<{ success: boolean }> {
    await ensureMasterAccess(accessToken);
    const { error } = await getAdminClient()
      .from("indole")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  },
};
