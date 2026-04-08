import { cityMapsService } from "./city-maps.service.js";
export const cityMapsController = {
    async salvar(dto, accessToken) {
        if (!dto.name?.trim())
            throw new Error("Nome da cidade é obrigatório");
        if (!dto.mapReference?.trim())
            throw new Error("Referência do mapa é obrigatória");
        return cityMapsService.salvar(dto, accessToken);
    },
};
//# sourceMappingURL=city-maps.controller.js.map