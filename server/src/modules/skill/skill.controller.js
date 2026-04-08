import { skillService } from "./skill.service.js";
export const skillController = {
    async adicionarEmPersonagem(characterId, dto, accessToken) {
        if (!characterId)
            throw new Error("ID do personagem é obrigatório");
        if (!dto.skillName?.trim())
            throw new Error("Nome da skill é obrigatório");
        return skillService.adicionarEmPersonagem(characterId, dto, accessToken);
    },
};
//# sourceMappingURL=skill.controller.js.map