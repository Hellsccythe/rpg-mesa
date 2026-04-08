import { godService } from "./god.service.js";
export const godController = {
    async salvar(dto, accessToken) {
        if (!dto.name?.trim())
            throw new Error("Nome do deus é obrigatório");
        return godService.salvar(dto, accessToken);
    },
};
//# sourceMappingURL=god.controller.js.map