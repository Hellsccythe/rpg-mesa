import { godService } from "./god.service.js";
export const godController = {
    async uploadImagem(file, accessToken) {
        return godService.uploadImagem(file, accessToken);
    },
    async listarPublico() {
        return godService.listarPublico();
    },
    async listar(accessToken) {
        return godService.listar(accessToken);
    },
    async salvar(dto, accessToken) {
        if (!dto.name?.trim())
            throw new Error("Nome do deus é obrigatório");
        return godService.salvar(dto, accessToken);
    },
    async editar(godId, dto, accessToken) {
        if (dto.name !== undefined && !dto.name.trim()) {
            throw new Error("Nome do deus não pode ficar vazio");
        }
        return godService.editar(godId, dto, accessToken);
    },
};
//# sourceMappingURL=god.controller.js.map