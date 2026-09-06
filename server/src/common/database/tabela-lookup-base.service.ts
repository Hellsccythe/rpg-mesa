import { NotFoundException } from "@nestjs/common";
import type { ModelStatic, Model } from "sequelize";

export interface RegistroLookup extends Model {
  item: number;
  descricao: string;
}

/**
 * CRUD compartilhado por tabelas de lookup simples (item INTEGER + descricao
 * + soft delete + auditoria). O "item" não é IDENTITY no banco — é calculado
 * manualmente como MAX(item)+1, mesmo comportamento de antes (Supabase).
 *
 * paranoid: true no model já filtra registros deletados nas buscas e faz
 * soft delete automático no destroy() — não precisa tratar deleted_at aqui.
 */
export class TabelaLookupBaseService<TRegistro extends RegistroLookup> {
  constructor(private readonly modeloSequelize: ModelStatic<TRegistro>) {}

  async listar(): Promise<TRegistro[]> {
    return this.modeloSequelize.findAll({ order: [["item", "ASC"]] });
  }

  async criar(camposExtras: Record<string, unknown>): Promise<TRegistro> {
    const maiorItemExistente = await this.modeloSequelize.max<number, TRegistro>("item");
    const proximoItem = (maiorItemExistente ?? 0) + 1;
    return this.modeloSequelize.create({ ...camposExtras, item: proximoItem } as any);
  }

  async editar(item: number, alteracoes: Record<string, unknown>): Promise<TRegistro> {
    const registro = await this.buscarOuFalhar(item);
    registro.set(alteracoes);
    await registro.save();
    return registro;
  }

  async deletar(item: number): Promise<{ ok: true }> {
    const registro = await this.buscarOuFalhar(item);
    await registro.destroy();
    return { ok: true };
  }

  private async buscarOuFalhar(item: number): Promise<TRegistro> {
    const registro = await this.modeloSequelize.findByPk(item);
    if (!registro) {
      throw new NotFoundException(`Registro ${item} não encontrado`);
    }
    return registro;
  }
}
