import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { IndoleModel } from "./models/indole.model.js";
import type { CriarIndoleDto, EditarIndoleDto } from "./indole.dto.js";

@Injectable()
export class IndoleService {
  constructor(
    @InjectModel(IndoleModel)
    private readonly modeloIndole: typeof IndoleModel,
  ) {}

  async listar(): Promise<IndoleModel[]> {
    return this.modeloIndole.findAll({ order: [["id", "ASC"]] });
  }

  async criar(dados: CriarIndoleDto): Promise<IndoleModel> {
    return this.modeloIndole.create({
      codigo: dados.codigo.trim(),
      descricao: dados.descricao.trim(),
    });
  }

  async editar(id: number, dados: EditarIndoleDto): Promise<IndoleModel> {
    const registro = await this.buscarOuFalhar(id);
    if (dados.codigo !== undefined) registro.codigo = dados.codigo.trim();
    if (dados.descricao !== undefined) registro.descricao = dados.descricao.trim();
    await registro.save();
    return registro;
  }

  async deletar(id: number): Promise<void> {
    const registro = await this.buscarOuFalhar(id);
    // Soft delete: a versão anterior apagava de verdade, o que deixaria
    // gods.indole_id e characters.indole_id apontando para o vazio.
    await registro.destroy();
  }

  private async buscarOuFalhar(id: number): Promise<IndoleModel> {
    const registro = await this.modeloIndole.findByPk(id);
    if (!registro) throw new NotFoundException("Índole não encontrada");
    return registro;
  }
}
