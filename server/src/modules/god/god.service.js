import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
export const godService = {
    async salvar(dto, accessToken) {
        await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data, error } = await admin
            .from("gods")
            .insert({
            name: dto.name.trim(),
            description: dto.description?.trim() ?? "",
        })
            .select("id, name, description, created_at")
            .single();
        if (error)
            throw error;
        return data;
    },
};
//# sourceMappingURL=god.service.js.map