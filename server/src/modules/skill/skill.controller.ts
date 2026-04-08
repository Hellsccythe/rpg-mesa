import { skillService } from "./skill.service.js";
import type { AdicionarSkillPersonagemDto } from "./skill.dto.js";

export const skillController = {
  async adicionarEmPersonagem(
    characterId: string,
    dto: AdicionarSkillPersonagemDto,
    accessToken?: string,
  ) {
    if (!characterId) throw new Error("ID do personagem é obrigatório");
    if (!dto.skillName?.trim()) throw new Error("Nome da skill é obrigatório");
    return skillService.adicionarEmPersonagem(characterId, dto, accessToken);
  },
};
