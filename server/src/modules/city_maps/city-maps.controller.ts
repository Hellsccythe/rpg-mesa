import { cityMapsService } from "./city-maps.service.js";
import type { SalvarCityMapDto } from "./city-maps.dto.js";

export const cityMapsController = {
  async salvar(dto: SalvarCityMapDto, accessToken?: string) {
    if (!dto.name?.trim()) throw new Error("Nome da cidade é obrigatório");
    if (!dto.mapReference?.trim()) throw new Error("Referência do mapa é obrigatória");
    return cityMapsService.salvar(dto, accessToken);
  },
};
