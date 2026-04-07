import { godService } from "./god.service.js";
import type { SalvarGodDto } from "./god.dto.js";

export const godController = {
  async salvar(dto: SalvarGodDto, accessToken?: string) {
    if (!dto.name?.trim()) throw new Error("Nome do deus é obrigatório");
    return godService.salvar(dto, accessToken);
  },
};
