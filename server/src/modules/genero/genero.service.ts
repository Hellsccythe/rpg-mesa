import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { GeneroModel } from "./models/genero.model.js";
import type { CriarGeneroDto, EditarGeneroDto } from "./genero.dto.js";

@Injectable()
export class GeneroService {
  constructor(
    @InjectModel(GeneroModel)
    private readonly modeloGenero: typeof GeneroModel,
  ) {}

  async listar(): Promise<GeneroModel[]> {
    return this.modeloGenero.findAll({ order: [["id", "ASC"]] });
  }

  async criar(dados: CriarGeneroDto): Promise<GeneroModel> {
    return this.modeloGenero.create({
      codigo: dados.codigo.trim(),
      descricao: dados.descricao.trim(),
      pronome: dados.pronome?.trim() ?? "",
    });
  }

  async editar(id: number, dados: EditarGeneroDto): Promise<GeneroModel> {
    const registro = await this.buscarOuFalhar(id);
    if (dados.codigo !== undefined) registro.codigo = dados.codigo.trim();
    if (dados.descricao !== undefined) registro.descricao = dados.descricao.trim();
    if (dados.pronome !== undefined) registro.pronome = dados.pronome.trim();
    await registro.save();
    return registro;
  }

  async deletar(id: number): Promise<void> {
    const registro = await this.buscarOuFalhar(id);
    // Soft delete: a versão anterior apagava de verdade, o que deixaria
    // characters.genero_id apontando para o vazio.
    await registro.destroy();
  }

  private async buscarOuFalhar(id: number): Promise<GeneroModel> {
    const registro = await this.modeloGenero.findByPk(id);
    if (!registro) throw new NotFoundException("Gênero não encontrado");
    return registro;
  }
}
