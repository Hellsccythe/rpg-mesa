import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
import { PERSONAGEM_SELECT_FIELDS, PERSONAGEM_TABLE, mapPersonagem, } from "../../models/personagem.model.js";
function normalizeData(data) {
    if (!data || typeof data !== "object")
        return {};
    return { ...data };
}
export const titulosService = {
    async salvar(dto, accessToken) {
        await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data, error } = await admin
            .from("titles")
            .insert({
            name: dto.name.trim(),
            tier: dto.tier.trim(),
            description: dto.description.trim(),
        })
            .select("id, name, tier, description, created_at")
            .single();
        if (error)
            throw error;
        return data;
    },
    async adicionarEmPersonagem(characterId, dto, accessToken) {
        const user = await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data: current, error: currentError } = await admin
            .from(PERSONAGEM_TABLE)
            .select(PERSONAGEM_SELECT_FIELDS)
            .eq("id", characterId)
            .is("deleted_at", null)
            .single();
        if (currentError || !current)
            throw new Error("Personagem não encontrado");
        const personagem = mapPersonagem(current);
        const dataAtual = normalizeData(personagem.data);
        const titles = Array.isArray(dataAtual.titles) ? [...dataAtual.titles] : [];
        const titleName = dto.titleName.trim();
        if (!titleName)
            throw new Error("Título é obrigatório");
        if (!titles.some((item) => String(item?.name ?? "").toLowerCase() === titleName.toLowerCase())) {
            titles.push({
                name: titleName,
                addedBy: user.email ?? "master",
                addedAt: new Date().toISOString(),
            });
        }
        const nextData = { ...dataAtual, titles };
        const { data, error } = await admin
            .from(PERSONAGEM_TABLE)
            .update({ data: nextData })
            .eq("id", characterId)
            .is("deleted_at", null)
            .select(PERSONAGEM_SELECT_FIELDS)
            .single();
        if (error)
            throw error;
        return mapPersonagem(data);
    },
};
//# sourceMappingURL=titulos.service.js.map