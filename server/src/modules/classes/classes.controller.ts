import { classesService } from "./classes.service.js";
import type { SalvarClasseDto } from "./classes.dto.js";

export const classesController = {
  async salvar(dto: SalvarClasseDto, accessToken?: string) {
    if (!dto.name?.trim()) throw new Error("Nome da classe é obrigatório");
    if (!dto.tier?.trim()) throw new Error("Tier da classe é obrigatório");
    if (!dto.description?.trim()) throw new Error("Descrição da classe é obrigatória");
    return classesService.salvar(dto, accessToken);
  },
};
