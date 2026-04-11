import { cityMapsService } from "./city-maps.service.js";
import type { EditarCityMapDto, SalvarCityMapDto } from "./city-maps.dto.js";

export const cityMapsController = {
  async listarAutenticado(accessToken?: string) {
    return cityMapsService.listarAutenticado(accessToken);
  },

  async listar(accessToken?: string) {
    return cityMapsService.listar(accessToken);
  },

  async uploadImagem(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    accessToken?: string,
  ) {
    return cityMapsService.uploadImagem(file, accessToken);
  },

  async salvar(dto: SalvarCityMapDto, accessToken?: string) {
    if (!dto.name?.trim()) throw new Error("Nome da cidade é obrigatório");
    if (!dto.mapReference?.trim()) throw new Error("Referência do mapa é obrigatória");
    return cityMapsService.salvar(dto, accessToken);
  },

  async editar(cityMapId: string, dto: EditarCityMapDto, accessToken?: string) {
    if (dto.name !== undefined && !dto.name.trim()) {
      throw new Error("Nome da cidade não pode ficar vazio");
    }
    if (dto.mapReference !== undefined && !dto.mapReference.trim()) {
      throw new Error("Referência do mapa não pode ficar vazia");
    }
    return cityMapsService.editar(cityMapId, dto, accessToken);
  },
};
