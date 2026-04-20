import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
import type { SalvarClasseDto } from "./classes.dto.js";

export const classesService = {
  async listar() {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("classes")
      .select("*")
      .is("deleted_at", null)
      .order("tier")
      .order("name");

    if (error) throw error;
    return data ?? [];
  },

  async listarProgressaoLevel() {
    const admin = getAdminClient();
    try {
      const { data, error } = await admin
        .from("level_progression")
        .select("*")
        .order("level");
      if (error) throw error;
      // Normaliza o campo XP para xp_required independente do nome da coluna no banco
      return (data ?? []).map((row: any) => ({
        ...row,
        xp_required: row.xp_required_next ?? row.xp_required ?? row.xp ?? row.xp_needed ?? 0,
        xp_total_accumulated: row.xp_total_accumulated ?? null,
      }));
    } catch {
      return [];
    }
  },

  async salvar(dto: SalvarClasseDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("classes")
      .insert({
        name: dto.name.trim(),
        tier: dto.tier.trim(),
        description: dto.description.trim(),
        max_level: dto.maxLevel ?? 20,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },
};
