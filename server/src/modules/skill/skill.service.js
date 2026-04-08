import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
import { PERSONAGEM_SELECT_FIELDS, PERSONAGEM_TABLE, mapPersonagem, } from "../../models/personagem.model.js";
function normalizeData(data) {
    if (!data || typeof data !== "object")
        return {};
    return { ...data };
}
export const skillService = {
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
        const skills = Array.isArray(dataAtual.skills) ? [...dataAtual.skills] : [];
        const skillName = dto.skillName.trim();
        if (!skillName)
            throw new Error("Skill é obrigatória");
        if (!skills.some((item) => String(item?.name ?? "").toLowerCase() === skillName.toLowerCase())) {
            skills.push({
                name: skillName,
                addedBy: user.email ?? "master",
                addedAt: new Date().toISOString(),
            });
        }
        const nextData = { ...dataAtual, skills };
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
//# sourceMappingURL=skill.service.js.map