import { titulosService } from "./titulos.service.js";
export const titulosController = {
    async salvar(dto, accessToken) {
        if (!dto.name?.trim())
            throw new Error("Nome do título é obrigatório");
        if (!dto.tier?.trim())
            throw new Error("Tier do título é obrigatório");
        if (!dto.description?.trim())
            throw new Error("Descrição do título é obrigatória");
        return titulosService.salvar(dto, accessToken);
    },
    async adicionarEmPersonagem(characterId, dto, accessToken) {
        if (!characterId)
            throw new Error("ID do personagem é obrigatório");
        if (!dto.titleName?.trim())
            throw new Error("Nome do título é obrigatório");
        return titulosService.adicionarEmPersonagem(characterId, dto, accessToken);
    },
};
//# sourceMappingURL=titulos.controller.js.map