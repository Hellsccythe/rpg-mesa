import { cityMapsService } from "./city-maps.service.js";
export const cityMapsController = {
    async listar(accessToken) {
        return cityMapsService.listar(accessToken);
    },
    async salvar(dto, accessToken) {
        if (!dto.name?.trim())
            throw new Error("Nome da cidade é obrigatório");
        if (!dto.mapReference?.trim())
            throw new Error("Referência do mapa é obrigatória");
        return cityMapsService.salvar(dto, accessToken);
    },
    async editar(cityMapId, dto, accessToken) {
        if (dto.name !== undefined && !dto.name.trim()) {
            throw new Error("Nome da cidade não pode ficar vazio");
        }
        if (dto.mapReference !== undefined && !dto.mapReference.trim()) {
            throw new Error("Referência do mapa não pode ficar vazia");
        }
        return cityMapsService.editar(cityMapId, dto, accessToken);
    },
};
//# sourceMappingURL=city-maps.controller.js.map