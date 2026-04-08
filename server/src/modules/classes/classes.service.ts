import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
import type { SalvarClasseDto } from "./classes.dto.js";

export const classesService = {
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
      .select("id, name, tier, description, max_level, created_at")
      .single();

    if (error) throw error;
    return data;
  },
};
