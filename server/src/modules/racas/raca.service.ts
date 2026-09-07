import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import {
  RacaModel,
  type BonusDeAtributoDeRaca,
  type HabilidadeDeRaca,
} from "./models/raca.model.js";
import type { CriarRacaDto, EditarRacaDto } from "./raca.dto.js";

export type RacaApi = {
  id: number;
  nome: string;
  foto_url: string | null;
  descricao: string | null;
  lore: string | null;
  habilidades: HabilidadeDeRaca[];
  atributos_bonus: BonusDeAtributoDeRaca[];
  createdAt: string | null;
  updatedAt: string | null;
};

function formatarData(valor: unknown): string | null {
  return valor instanceof Date ? valor.toISOString() : null;
}

@Injectable()
export class RacaService {
  constructor(
    @InjectModel(RacaModel)
    private readonly modeloRaca: typeof RacaModel,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  // ── Leitura ───────────────────────────────────────────────────────────────

  /**
   * Listagem pública (tela de raças e onboarding). O lore é omitido de
   * propósito: é o texto que o mestre escreve para revelar aos poucos.
   */
  async listarPublico(): Promise<RacaApi[]> {
    const encontradas = await this.modeloRaca.findAll({ order: [["nome", "ASC"]] });
    return encontradas.map((raca) => ({ ...this.mapear(raca), lore: null }));
  }

  async listarParaMestre(): Promise<RacaApi[]> {
    const encontradas = await this.modeloRaca.findAll({ order: [["nome", "ASC"]] });
    return encontradas.map((raca) => this.mapear(raca));
  }

  // ── Escrita (ORM, pra os hooks de auditoria dispararem) ───────────────────

  async criar(dados: CriarRacaDto): Promise<RacaApi> {
    const criada = await this.modeloRaca.create({
      nome: dados.nome.trim(),
      fotoUrl: this.armazenamentoArquivos.normalizarParaArmazenamento(dados.foto_url ?? null),
      descricao: dados.descricao?.trim() || null,
      lore: dados.lore?.trim() || null,
      habilidades: dados.habilidades ?? [],
      atributosBonus: dados.atributos_bonus ?? [],
    });

    return this.mapear(criada);
  }

  async editar(id: number, dados: EditarRacaDto): Promise<RacaApi> {
    const raca = await this.buscarOuFalhar(id);

    if (dados.nome !== undefined) raca.nome = dados.nome.trim();
    if (dados.foto_url !== undefined) {
      raca.fotoUrl = this.armazenamentoArquivos.normalizarParaArmazenamento(dados.foto_url);
    }
    if (dados.descricao !== undefined) raca.descricao = dados.descricao?.trim() || null;
    if (dados.lore !== undefined) raca.lore = dados.lore?.trim() || null;
    if (dados.habilidades !== undefined) raca.habilidades = dados.habilidades;
    if (dados.atributos_bonus !== undefined) raca.atributosBonus = dados.atributos_bonus;

    await raca.save();
    return this.mapear(raca);
  }

  async deletar(id: number): Promise<void> {
    const raca = await this.buscarOuFalhar(id);
    // Soft delete (paranoid). A imagem em disco fica: o registro pode ser
    // restaurado, e o arquivo não voltaria.
    await raca.destroy();
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  private async buscarOuFalhar(id: number): Promise<RacaModel> {
    const raca = await this.modeloRaca.findByPk(id);
    if (!raca) {
      throw new NotFoundException("Raça não encontrada.");
    }
    return raca;
  }

  /** O banco guarda o caminho relativo; a API responde com a URL completa. */
  private mapear(raca: RacaModel): RacaApi {
    return {
      id: raca.id,
      nome: raca.nome?.trim() ?? "",
      foto_url: this.armazenamentoArquivos.montarUrlPublica(raca.fotoUrl) || null,
      descricao: raca.descricao,
      lore: raca.lore,
      habilidades: Array.isArray(raca.habilidades) ? raca.habilidades : [],
      atributos_bonus: Array.isArray(raca.atributosBonus) ? raca.atributosBonus : [],
      createdAt: formatarData(raca.get("createdAt")),
      updatedAt: formatarData(raca.get("updatedAt")),
    };
  }
}
