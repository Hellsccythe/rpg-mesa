import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
export const cityMapsService = {
    async salvar(dto, accessToken) {
        await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data, error } = await admin
            .from("city_maps")
            .insert({
            name: dto.name.trim(),
            map_reference: dto.mapReference.trim(),
            description: dto.description?.trim() ?? "",
        })
            .select("id, name, map_reference, description, created_at")
            .single();
        if (error)
            throw error;
        return data;
    },
};
//# sourceMappingURL=city-maps.service.js.map