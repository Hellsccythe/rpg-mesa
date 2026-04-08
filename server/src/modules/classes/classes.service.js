import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
export const classesService = {
    async salvar(dto, accessToken) {
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
        if (error)
            throw error;
        return data;
    },
};
//# sourceMappingURL=classes.service.js.map