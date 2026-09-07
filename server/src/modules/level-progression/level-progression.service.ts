import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { LevelProgressionModel } from "./models/level-progression.model.js";
import type { EntradaLevelProgressionDto } from "./level-progression.dto.js";

export type LevelProgressionApi = {
  id: number;
  level: number;
  tier: string;
  multiplier: number;
  xp_required_next: number;
  xp_total_accumulated: number;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class LevelProgressionService {
  constructor(
    @InjectModel(LevelProgressionModel)
    private readonly modeloLevelProgression: typeof LevelProgressionModel,
  ) {}

  async listar(tier?: string): Promise<LevelProgressionApi[]> {
    const registros = await this.modeloLevelProgression.findAll({
      where: tier ? { tier } : undefined,
      order: [["level", "ASC"]],
    });
    return registros.map((registro) => this.converterParaApi(registro));
  }

  /**
   * Grava as entradas informadas, criando ou atualizando conforme o nível já
   * exista (level é único na tabela). Percorre uma a uma de propósito: um
   * bulkCreate com updateOnDuplicate não dispararia os hooks de auditoria,
   * que preenchem created_by/updated_by.
   */
  async salvarEmLote(entradas: EntradaLevelProgressionDto[]): Promise<LevelProgressionApi[]> {
    const salvos: LevelProgressionModel[] = [];

    for (const entrada of entradas) {
      const existente = await this.modeloLevelProgression.findOne({
        where: { level: entrada.level },
      });

      if (existente) {
        existente.tier = entrada.tier.trim();
        existente.multiplier = entrada.multiplier;
        existente.xpRequiredNext = entrada.xp_required_next;
        existente.xpTotalAccumulated = entrada.xp_total_accumulated;
        await existente.save();
        salvos.push(existente);
        continue;
      }

      salvos.push(
        await this.modeloLevelProgression.create({
          level: entrada.level,
          tier: entrada.tier.trim(),
          multiplier: entrada.multiplier,
          xpRequiredNext: entrada.xp_required_next,
          xpTotalAccumulated: entrada.xp_total_accumulated,
        }),
      );
    }

    return salvos.map((registro) => this.converterParaApi(registro));
  }

  async deletar(id: number): Promise<void> {
    const registro = await this.modeloLevelProgression.findByPk(id);
    if (!registro) {
      throw new NotFoundException("Nível não encontrado.");
    }
    // Soft delete: a versão anterior apagava de verdade, e esta tabela é
    // balanceamento de jogo — perder uma faixa sem querer é caro.
    await registro.destroy();
  }

  private converterParaApi(registro: LevelProgressionModel): LevelProgressionApi {
    return {
      id: registro.id,
      level: registro.level,
      tier: registro.tier,
      // DECIMAL e BIGINT chegam como texto pelo driver; a API sempre devolveu
      // número nesses campos.
      multiplier: Number(registro.multiplier),
      xp_required_next: Number(registro.xpRequiredNext),
      xp_total_accumulated: Number(registro.xpTotalAccumulated),
      created_at: registro.createdAt,
      updated_at: registro.updatedAt,
    };
  }
}
