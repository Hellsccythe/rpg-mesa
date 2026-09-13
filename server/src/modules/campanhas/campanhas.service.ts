import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { obterCampanhaDoContexto } from "../../common/cls/contexto-requisicao.js";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { CampanhaModel } from "./models/campanha.model.js";
import { CampanhaGmModel } from "./models/campanha-gm.model.js";
import type { AdicionarGmDto, CriarCampanhaDto, EditarCampanhaDto } from "./campanhas.dto.js";

export type CampanhaApi = {
  id: number;
  /** O número do mundo — "Mundo 2 — Elyra". É lore, editável; o id continua sendo a chave. */
  numero: number;
  slug: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type CampanhaGmApi = {
  id: number;
  campaign_id: number;
  email: string;
  created_at: string | null;
  created_by: string | null;
};

function formatarData(valor: unknown): string | null {
  return valor instanceof Date ? valor.toISOString() : null;
}

function textoOuNulo(valor: string | null | undefined): string | null {
  const texto = typeof valor === "string" ? valor.trim() : "";
  return texto === "" ? null : texto;
}

/** Só letras minúsculas, números e hífen — é o que vai na URL. */
function normalizarSlug(valor: string): string {
  return valor.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

@Injectable()
export class CampanhasService {
  constructor(
    @InjectModel(CampanhaModel)
    private readonly modeloCampanha: typeof CampanhaModel,
    @InjectModel(CampanhaGmModel)
    private readonly modeloCampanhaGm: typeof CampanhaGmModel,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  // ── Campanhas ─────────────────────────────────────────────────────────────

  /** Listagem pública: só as ativas, na ordem dos números de mundo. */
  async listarAtivas(): Promise<CampanhaApi[]> {
    const encontradas = await this.modeloCampanha.findAll({
      where: { isActive: true },
      order: [["numero", "ASC"]],
    });
    return encontradas.map((campanha) => this.mapear(campanha));
  }

  /** Listagem do mestre: inclui as inativas. */
  async listarParaMestre(): Promise<CampanhaApi[]> {
    const encontradas = await this.modeloCampanha.findAll({ order: [["numero", "ASC"]] });
    return encontradas.map((campanha) => this.mapear(campanha));
  }

  async buscarPorSlug(slug: string): Promise<CampanhaApi> {
    const campanha = await this.modeloCampanha.findOne({ where: { slug: slug.trim() } });
    if (!campanha) {
      throw new NotFoundException("Campanha não encontrada.");
    }
    return this.mapear(campanha);
  }

  async criar(dados: CriarCampanhaDto): Promise<CampanhaApi> {
    const slug = normalizarSlug(dados.slug);
    if (!slug) {
      throw new ConflictException("Slug inválido depois de normalizado.");
    }
    await this.garantirSlugLivre(slug);
    const numero = dados.numero ?? (await this.proximoNumeroLivre());
    await this.garantirNumeroLivre(numero);

    const criada = await this.modeloCampanha.create({
      slug,
      name: dados.name.trim(),
      numero,
      description: textoOuNulo(dados.description),
      coverImageUrl: this.armazenamentoArquivos.normalizarParaArmazenamento(
        dados.cover_image_url ?? null,
      ),
      isActive: dados.is_active ?? true,
    });

    return this.mapear(criada);
  }

  async editar(id: number, dados: EditarCampanhaDto): Promise<CampanhaApi> {
    const campanha = await this.modeloCampanha.findByPk(id);
    if (!campanha) {
      throw new NotFoundException("Campanha não encontrada.");
    }

    if (dados.slug !== undefined) {
      const slug = normalizarSlug(dados.slug);
      if (!slug) {
        throw new ConflictException("Slug inválido depois de normalizado.");
      }
      if (slug !== campanha.slug) {
        await this.garantirSlugLivre(slug);
        campanha.slug = slug;
      }
    }
    if (dados.name !== undefined) campanha.name = dados.name.trim();
    if (dados.numero !== undefined && dados.numero !== campanha.numero) {
      await this.garantirNumeroLivre(dados.numero);
      campanha.numero = dados.numero;
    }
    if (dados.description !== undefined) campanha.description = textoOuNulo(dados.description);
    if (dados.cover_image_url !== undefined) {
      campanha.coverImageUrl = this.armazenamentoArquivos.normalizarParaArmazenamento(
        dados.cover_image_url,
      );
    }
    if (dados.is_active !== undefined) campanha.isActive = dados.is_active;

    await campanha.save();
    return this.mapear(campanha);
  }

  async deletar(id: number): Promise<void> {
    const campanha = await this.modeloCampanha.findByPk(id);
    if (!campanha) {
      throw new NotFoundException("Campanha não encontrada.");
    }
    await campanha.destroy();
  }

  // ── Mestres da campanha ───────────────────────────────────────────────────

  async listarGms(campanhaId: number): Promise<CampanhaGmApi[]> {
    await this.garantirCampanhaExistente(campanhaId);

    const encontrados = await this.modeloCampanhaGm.findAll({
      where: { campaignId: campanhaId },
      order: [["createdAt", "ASC"]],
    });

    return encontrados.map((gm) => ({
      id: gm.id,
      campaign_id: gm.campaignId,
      email: gm.email,
      created_at: formatarData(gm.get("createdAt")),
      created_by: gm.createdBy,
    }));
  }

  /**
   * A tabela não tem índice único em (campaign_id, email): o código antigo
   * tratava o erro 23505 de chave duplicada, que nunca podia acontecer, e o
   * mesmo GM podia ser cadastrado várias vezes. A checagem passa a ser feita
   * aqui.
   */
  async adicionarGm(campanhaId: number, dados: AdicionarGmDto): Promise<CampanhaGmApi> {
    await this.garantirCampanhaExistente(campanhaId);

    const email = dados.email.trim().toLowerCase();
    const jaVinculado = await this.modeloCampanhaGm.findOne({
      where: { campaignId: campanhaId, email },
    });
    if (jaVinculado) {
      throw new ConflictException("Este GM já está vinculado a esta campanha.");
    }

    const criado = await this.modeloCampanhaGm.create({ campaignId: campanhaId, email });

    return {
      id: criado.id,
      campaign_id: criado.campaignId,
      email: criado.email,
      created_at: formatarData(criado.get("createdAt")),
      created_by: criado.createdBy,
    };
  }

  async removerGm(campanhaId: number, gmId: number): Promise<void> {
    const gm = await this.modeloCampanhaGm.findOne({
      where: { id: gmId, campaignId: campanhaId },
    });
    if (!gm) {
      throw new NotFoundException("Vínculo de GM não encontrado nesta campanha.");
    }
    // Soft delete: aqui não há índice único travando a recriação, então a
    // auditoria da tabela pode ser usada como foi desenhada.
    await gm.destroy();
  }

  /**
   * Resolve o mundo de uma operação que não carrega personagem
   * (docs/MUNDOS.md, "Campanha ativa"), nesta ordem:
   *
   *   1. o id explícito (query/corpo), que precisa existir;
   *   2. o mundo do header X-Campanha, já validado no contexto pelo
   *      CampanhaAtivaInterceptor;
   *   3. a única campanha ativa.
   *
   * Com duas ou mais ativas e nada acima, o servidor não adivinha: responde
   * 400 pedindo o mundo, nunca devolve "todos os mundos".
   */
  async resolverCampanhaAtiva(campanhaId?: number): Promise<number> {
    if (campanhaId !== undefined) {
      await this.garantirCampanhaExistente(campanhaId);
      return campanhaId;
    }
    const doContexto = obterCampanhaDoContexto();
    if (doContexto !== undefined) return doContexto;

    const ativas = await this.modeloCampanha.findAll({ where: { isActive: true }, attributes: ["id"] });
    if (ativas.length === 1) return ativas[0]!.id;
    if (ativas.length === 0) throw new BadRequestException("Nenhuma campanha ativa: crie um mundo antes.");
    throw new BadRequestException("Há mais de um mundo ativo: informe a campanha (campaignId).");
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  /** O índice de número é parcial (só as vivas), então aqui a busca é a normal, sem paranoid: false. */
  private async garantirNumeroLivre(numero: number): Promise<void> {
    const existente = await this.modeloCampanha.findOne({ where: { numero } });
    if (existente) {
      throw new ConflictException(`Já existe o Mundo ${numero} (${existente.name}).`);
    }
  }

  private async proximoNumeroLivre(): Promise<number> {
    const maior = await this.modeloCampanha.max<number, CampanhaModel>("numero");
    return (maior ?? 0) + 1;
  }

  private async garantirCampanhaExistente(id: number): Promise<void> {
    const campanha = await this.modeloCampanha.findByPk(id);
    if (!campanha) {
      throw new NotFoundException("Campanha não encontrada.");
    }
  }

  /**
   * O UNIQUE de slug é total, então uma campanha soft-deletada ainda ocupa o
   * nome. Por isso a busca inclui as deletadas — senão o erro que o usuário
   * veria seria um 500 de chave duplicada, sem explicação.
   */
  private async garantirSlugLivre(slug: string): Promise<void> {
    const existente = await this.modeloCampanha.findOne({ where: { slug }, paranoid: false });
    if (existente) {
      throw new ConflictException("Já existe uma campanha com esse slug.");
    }
  }

  /** O banco guarda o caminho relativo; a API responde com a URL completa. */
  private mapear(campanha: CampanhaModel): CampanhaApi {
    return {
      id: campanha.id,
      numero: campanha.numero,
      slug: campanha.slug,
      name: campanha.name,
      description: campanha.description,
      cover_image_url:
        this.armazenamentoArquivos.montarUrlPublica(campanha.coverImageUrl) || null,
      is_active: campanha.isActive,
      created_at: formatarData(campanha.get("createdAt")),
      updated_at: formatarData(campanha.get("updatedAt")),
    };
  }
}
