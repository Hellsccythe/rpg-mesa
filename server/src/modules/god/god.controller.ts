import { godService } from "./god.service.js";
import type { EditarGodDto, SalvarGodDto } from "./god.dto.js";

export const godController = {
  async uploadImagem(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    accessToken?: string,
  ) {
    return godService.uploadImagem(file, accessToken);
  },

  async listarPublico() {
    return godService.listarPublico();
  },

  async listar(accessToken?: string) {
    return godService.listar(accessToken);
  },

  async salvar(dto: SalvarGodDto, accessToken?: string) {
    if (!dto.name?.trim()) throw new Error("Nome do deus é obrigatório");
    return godService.salvar(dto, accessToken);
  },

  async editar(godId: string, dto: EditarGodDto, accessToken?: string) {
    if (dto.name !== undefined && !dto.name.trim()) {
      throw new Error("Nome do deus não pode ficar vazio");
    }
    return godService.editar(godId, dto, accessToken);
  },
};
