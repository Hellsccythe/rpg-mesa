import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { CityMapModel, type DadosCityMap } from "./models/city-map.model.js";
import type { EditarCityMapDto, PointOfInterestDto, SalvarCityMapDto } from "./city-maps.dto.js";

/** Formato de resposta da API — mantido idêntico ao da versão Supabase. */
export type CityMapApi = {
  id: string;
  name: string;
  mapReference: string;
  description: string;
  imageUrl: string;
  citySlug: string;
  cityName: string;
  cityDescription: string;
  cityCulture: string;
  mapType: "city" | "localized";
  parentCityMapId: string;
  pointsOfInterest: PointOfInterestDto[];
  createdAt: string;
  updatedAt: string;
};

const CIDADE_PADRAO_SLUG = "hamlet";
const CIDADE_PADRAO_NOME = "Hamlet";

function normalizarTexto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/**
 * Os pontos vêm do frontend com coordenadas em porcentagem da imagem.
 * Descarta os inválidos (sem nome ou sem coordenada numérica) e prende
 * x e y na faixa 0–100, para um ponto não cair fora do mapa.
 */
function sanitizarPontosDeInteresse(pontos: unknown): PointOfInterestDto[] {
  if (!Array.isArray(pontos)) return [];

  return pontos
    .map((ponto: any, indice: number) => ({
      id: normalizarTexto(ponto?.id) || `poi-${indice + 1}`,
      name: normalizarTexto(ponto?.name),
      x: Number(ponto?.x),
      y: Number(ponto?.y),
      description: normalizarTexto(ponto?.description),
      targetCityMapId: normalizarTexto(ponto?.targetCityMapId),
      targetLabel: normalizarTexto(ponto?.targetLabel),
    }))
    .filter((ponto) => ponto.name && Number.isFinite(ponto.x) && Number.isFinite(ponto.y))
    .map((ponto) => ({
      ...ponto,
      x: Math.min(100, Math.max(0, ponto.x)),
      y: Math.min(100, Math.max(0, ponto.y)),
    }));
}

@Injectable()
export class CityMapsService {
  constructor(
    @InjectModel(CityMapModel)
    private readonly modeloCityMap: typeof CityMapModel,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  // ── Leitura ───────────────────────────────────────────────────────────────
  // Sem JOIN aqui: a tabela não referencia nenhuma outra, então o ORM resolve
  // sozinho e não há motivo para SQL cru.

  async listar(): Promise<CityMapApi[]> {
    const registros = await this.modeloCityMap.findAll({ order: [["createdAt", "DESC"]] });
    return registros.map((registro) => this.converterParaApi(registro));
  }

  private converterParaApi(registro: CityMapModel): CityMapApi {
    const dados: DadosCityMap = registro.data ?? {};
    const idMapaPai = normalizarTexto(dados.parentCityMapId);

    return {
      id: String(registro.id),
      name: normalizarTexto(registro.name),
      mapReference: normalizarTexto(registro.mapReference),
      description: normalizarTexto(registro.description),
      imageUrl: this.armazenamentoArquivos.montarUrlPublica(dados.imageUrl),
      citySlug: normalizarTexto(dados.citySlug) || CIDADE_PADRAO_SLUG,
      cityName: normalizarTexto(dados.cityName) || CIDADE_PADRAO_NOME,
      cityDescription: normalizarTexto(dados.cityDescription),
      cityCulture: normalizarTexto(dados.cityCulture),
      // Ter mapa pai implica ser localizado, mesmo que mapType venha em branco.
      mapType: normalizarTexto(dados.mapType) === "localized" || idMapaPai ? "localized" : "city",
      parentCityMapId: idMapaPai,
      pointsOfInterest: sanitizarPontosDeInteresse(dados.pointsOfInterest),
      createdAt: registro.createdAt,
      updatedAt: registro.updatedAt,
    };
  }

  // ── Escrita (ORM, pra os hooks de auditoria dispararem) ───────────────────

  async salvar(dados: SalvarCityMapDto): Promise<CityMapApi> {
    const criado = await this.modeloCityMap.create({
      name: dados.name.trim(),
      mapReference: dados.mapReference.trim(),
      description: normalizarTexto(dados.description),
      data: {
        imageUrl: this.armazenamentoArquivos.normalizarParaArmazenamento(dados.imageUrl) ?? "",
        pointsOfInterest: sanitizarPontosDeInteresse(dados.pointsOfInterest),
        citySlug: normalizarTexto(dados.citySlug) || CIDADE_PADRAO_SLUG,
        cityName: normalizarTexto(dados.cityName) || CIDADE_PADRAO_NOME,
        cityDescription: normalizarTexto(dados.cityDescription),
        cityCulture: normalizarTexto(dados.cityCulture),
        mapType: normalizarTexto(dados.mapType) === "localized" ? "localized" : "city",
        parentCityMapId: normalizarTexto(dados.parentCityMapId),
      },
    });

    return this.converterParaApi(criado);
  }

  async editar(id: number, dados: EditarCityMapDto): Promise<CityMapApi> {
    const registro = await this.modeloCityMap.findByPk(id);
    if (!registro) {
      throw new NotFoundException("Mapa não encontrado");
    }

    if (dados.name !== undefined) registro.name = normalizarTexto(dados.name);
    if (dados.mapReference !== undefined) registro.mapReference = normalizarTexto(dados.mapReference);
    if (dados.description !== undefined) registro.description = normalizarTexto(dados.description);

    const dadosAtuais: DadosCityMap = registro.data ?? {};
    const dadosNovos: DadosCityMap = { ...dadosAtuais };

    if (dados.imageUrl !== undefined) {
      dadosNovos.imageUrl = this.armazenamentoArquivos.normalizarParaArmazenamento(dados.imageUrl) ?? "";
    }
    if (dados.pointsOfInterest !== undefined) {
      dadosNovos.pointsOfInterest = sanitizarPontosDeInteresse(dados.pointsOfInterest);
    }
    if (dados.citySlug !== undefined) {
      dadosNovos.citySlug = normalizarTexto(dados.citySlug) || CIDADE_PADRAO_SLUG;
    }
    if (dados.cityName !== undefined) {
      dadosNovos.cityName = normalizarTexto(dados.cityName) || CIDADE_PADRAO_NOME;
    }
    if (dados.cityDescription !== undefined) {
      dadosNovos.cityDescription = normalizarTexto(dados.cityDescription);
    }
    if (dados.cityCulture !== undefined) {
      dadosNovos.cityCulture = normalizarTexto(dados.cityCulture);
    }
    if (dados.mapType !== undefined) {
      dadosNovos.mapType = normalizarTexto(dados.mapType) === "localized" ? "localized" : "city";
    }
    if (dados.parentCityMapId !== undefined) {
      dadosNovos.parentCityMapId = normalizarTexto(dados.parentCityMapId);
    }

    // Atribuir um objeto novo (em vez de mutar) é o que faz o Sequelize
    // perceber a mudança num campo JSONB e realmente gravá-la.
    registro.data = dadosNovos;
    await registro.save();

    return this.converterParaApi(registro);
  }
}
