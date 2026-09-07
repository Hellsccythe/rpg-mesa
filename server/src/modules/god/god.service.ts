import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { GodModel } from "./models/god.model.js";
import type { EditarGodDto, SalvarGodDto } from "./god.dto.js";

type IndoleResumo = { id: number; codigo: string; descricao: string } | null;

/** Formato de resposta da API — mantido idêntico ao da versão Supabase. */
export type GodApi = {
  id: string;
  name: string;
  description: string;
  title: string;
  indole: string;
  indole_id: number | null;
  indole_obj: IndoleResumo;
  dogma: string;
  anatema: string;
  weapons: string;
  shortDescription: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

type LinhaGod = {
  id: number;
  name: string;
  description: string;
  title: string | null;
  indole_legado: string;
  indole_id: number | null;
  dogma: string;
  anatema: string;
  weapons: string;
  short_description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  indole_codigo: string | null;
  indole_descricao: string | null;
};

/**
 * O JOIN com indole substitui o fetchIndoleMap da versão anterior, que
 * carregava a tabela inteira em memória e montava um Map a cada listagem.
 */
const SQL_LISTAR_DEUSES = `
  SELECT
    gods.id,
    gods.name,
    gods.description,
    gods.title,
    gods.indole AS indole_legado,
    gods.indole_id,
    gods.dogma,
    gods.anatema,
    gods.weapons,
    gods.short_description,
    gods.image_url,
    gods.created_at,
    gods.updated_at,
    indole.codigo AS indole_codigo,
    indole.descricao AS indole_descricao
  FROM gods
  LEFT JOIN indole ON indole.id = gods.indole_id
  WHERE gods.deleted_at IS NULL
`;

function normalizarTexto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/**
 * Registros antigos usam o texto "Sem título" como sinônimo de "sem título
 * nenhum"; a API sempre devolveu string vazia nesse caso.
 */
function normalizarTituloDeus(valor: unknown): string {
  const titulo = normalizarTexto(valor);
  const semAcentoMinusculo = titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  return semAcentoMinusculo === "sem titulo" ? "" : titulo;
}

@Injectable()
export class GodService {
  constructor(
    @InjectModel(GodModel)
    private readonly modeloDeus: typeof GodModel,
    private readonly sequelize: Sequelize,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  // ── Leitura (SQL cru com JOIN) ────────────────────────────────────────────

  async listar(): Promise<GodApi[]> {
    const linhas = await this.sequelize.query<LinhaGod>(
      `${SQL_LISTAR_DEUSES} ORDER BY gods.created_at DESC`,
      { type: QueryTypes.SELECT },
    );
    return linhas.map((linha) => this.converterParaApi(linha));
  }

  private async buscarOuFalhar(id: number): Promise<GodApi> {
    const linhas = await this.sequelize.query<LinhaGod>(
      `${SQL_LISTAR_DEUSES} AND gods.id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );

    if (linhas.length === 0) {
      throw new NotFoundException("Deus não encontrado");
    }
    return this.converterParaApi(linhas[0]);
  }

  private converterParaApi(linha: LinhaGod): GodApi {
    const indoleResumo: IndoleResumo =
      linha.indole_id !== null && linha.indole_codigo !== null
        ? {
            id: linha.indole_id,
            codigo: linha.indole_codigo,
            descricao: linha.indole_descricao ?? "",
          }
        : null;

    return {
      id: String(linha.id),
      name: normalizarTexto(linha.name),
      description: normalizarTexto(linha.description),
      title: normalizarTituloDeus(linha.title),
      // O frontend filtra pelo código da índole; o texto legado é o fallback
      // para registros que nunca receberam indole_id.
      indole: indoleResumo ? indoleResumo.codigo : normalizarTexto(linha.indole_legado),
      indole_id: linha.indole_id,
      indole_obj: indoleResumo,
      dogma: normalizarTexto(linha.dogma),
      anatema: normalizarTexto(linha.anatema),
      weapons: normalizarTexto(linha.weapons),
      shortDescription: normalizarTexto(linha.short_description),
      imageUrl: this.armazenamentoArquivos.montarUrlPublica(linha.image_url),
      createdAt: linha.created_at,
      updatedAt: linha.updated_at,
    };
  }

  // ── Escrita (ORM, pra os hooks de auditoria dispararem) ───────────────────

  async salvar(dados: SalvarGodDto): Promise<GodApi> {
    const criado = await this.modeloDeus.create({
      name: dados.name.trim(),
      description: normalizarTexto(dados.description),
      title: normalizarTituloDeus(dados.title),
      indole: normalizarTexto(dados.indole),
      indoleId: dados.indole_id ?? null,
      dogma: normalizarTexto(dados.dogma),
      anatema: normalizarTexto(dados.anatema),
      weapons: normalizarTexto(dados.weapons),
      shortDescription: normalizarTexto(dados.shortDescription),
      imageUrl: this.armazenamentoArquivos.normalizarParaArmazenamento(dados.imageUrl),
    });

    return this.buscarOuFalhar(criado.id);
  }

  async editar(id: number, dados: EditarGodDto): Promise<GodApi> {
    const registro = await this.modeloDeus.findByPk(id);
    if (!registro) {
      throw new NotFoundException("Deus não encontrado");
    }

    if (dados.name !== undefined) registro.name = normalizarTexto(dados.name);
    if (dados.description !== undefined) registro.description = normalizarTexto(dados.description);
    if (dados.title !== undefined) registro.title = normalizarTituloDeus(dados.title);
    if (dados.indole !== undefined) registro.indole = normalizarTexto(dados.indole);
    if (dados.indole_id !== undefined) registro.indoleId = dados.indole_id ?? null;
    if (dados.dogma !== undefined) registro.dogma = normalizarTexto(dados.dogma);
    if (dados.anatema !== undefined) registro.anatema = normalizarTexto(dados.anatema);
    if (dados.weapons !== undefined) registro.weapons = normalizarTexto(dados.weapons);
    if (dados.shortDescription !== undefined) {
      registro.shortDescription = normalizarTexto(dados.shortDescription);
    }
    if (dados.imageUrl !== undefined) {
      registro.imageUrl = this.armazenamentoArquivos.normalizarParaArmazenamento(dados.imageUrl);
    }

    await registro.save();
    return this.buscarOuFalhar(id);
  }

  async deletar(id: number): Promise<void> {
    const registro = await this.modeloDeus.findByPk(id);
    if (!registro) {
      throw new NotFoundException("Deus não encontrado");
    }
    // Soft delete (paranoid). A imagem em disco é preservada de propósito:
    // o registro pode ser restaurado, e o arquivo não voltaria.
    await registro.destroy();
  }
}
