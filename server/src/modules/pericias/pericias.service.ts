import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import {
  CAMPO_DA_BOLSA,
  PericiaModel,
  RANK_MAXIMO,
  custoDoRank,
} from "./models/pericia.model.js";
import type { CriarPericiaDto, EditarPericiaDto } from "./pericias.dto.js";

/** Uma perícia do personagem, como fica gravada em `data.pericias`. */
export type PericiaDoPersonagem = {
  periciaId: number;
  nome: string;
  rank: number;
  /** Ranks que vieram do passado. Não custaram ponto e não são reembolsáveis. */
  rankInicial?: number;
};

@Injectable()
export class PericiasService {
  constructor(
    @InjectModel(PericiaModel)
    private readonly modeloPericia: typeof PericiaModel,
  ) {}

  async listar(): Promise<PericiaModel[]> {
    return this.modeloPericia.findAll({ order: [["categoria", "ASC"], ["nome", "ASC"]] });
  }

  async buscarOuFalhar(id: number): Promise<PericiaModel> {
    const registro = await this.modeloPericia.findByPk(id);
    if (!registro) throw new NotFoundException("Perícia não encontrada.");
    return registro;
  }

  async criar(dados: CriarPericiaDto): Promise<PericiaModel> {
    return this.modeloPericia.create({
      nome: dados.nome.trim(),
      descricao: dados.descricao?.trim() ?? "",
      atributoBase: dados.atributo_base,
      categoria: dados.categoria,
    });
  }

  async editar(id: number, dados: EditarPericiaDto): Promise<PericiaModel> {
    const registro = await this.buscarOuFalhar(id);
    if (dados.nome !== undefined) registro.nome = dados.nome.trim();
    if (dados.descricao !== undefined) registro.descricao = dados.descricao?.trim() ?? "";
    if (dados.atributo_base !== undefined) registro.atributoBase = dados.atributo_base;
    if (dados.categoria !== undefined) registro.categoria = dados.categoria;
    await registro.save();
    return registro;
  }

  async deletar(id: number): Promise<void> {
    const registro = await this.buscarOuFalhar(id);
    await registro.destroy();
  }

  // ── Regras usadas pelo módulo de personagem ───────────────────────────────

  /** Lê `data.pericias` com o formato garantido. */
  lerPericias(dados: Record<string, unknown>): PericiaDoPersonagem[] {
    return Array.isArray(dados.pericias) ? [...(dados.pericias as PericiaDoPersonagem[])] : [];
  }

  /**
   * Sobe um rank, cobrando o custo daquele degrau. Devolve a lista nova e os
   * pontos restantes — quem chama grava.
   */
  /** Onde estão os pontos que esta perícia consome, dentro de `data`. */
  campoDaBolsa(pericia: PericiaModel): string {
    return CAMPO_DA_BOLSA[pericia.bolsa] ?? CAMPO_DA_BOLSA.mundana;
  }

  subirUmRank(
    pericias: PericiaDoPersonagem[],
    pontosDisponiveis: number,
    pericia: PericiaModel,
  ): { pericias: PericiaDoPersonagem[]; pontosRestantes: number } {
    const posicao = pericias.findIndex((entrada) => entrada.periciaId === pericia.id);
    const rankAtual = posicao === -1 ? 0 : pericias[posicao].rank;

    if (rankAtual >= RANK_MAXIMO) {
      throw new BadRequestException(
        `${pericia.nome} já está no rank máximo (${RANK_MAXIMO}).`,
      );
    }

    const rankNovo = rankAtual + 1;
    const custo = custoDoRank(rankNovo);
    if (pontosDisponiveis < custo) {
      // Dizer a bolsa importa: o jogador pode ter 12 pontos mundanos e zero de
      // virtude, e "você tem 0" sem contexto pareceria um bug.
      const nomeDaBolsa = pericia.bolsa === "virtude" ? "de Virtude" : "de perícia";
      throw new BadRequestException(
        `Subir ${pericia.nome} para o rank ${rankNovo} custa ${custo} ponto(s) ${nomeDaBolsa}, e você tem ${pontosDisponiveis}.`,
      );
    }

    const lista = [...pericias];
    if (posicao === -1) {
      lista.push({ periciaId: pericia.id, nome: pericia.nome, rank: rankNovo });
    } else {
      lista[posicao] = { ...lista[posicao], rank: rankNovo, nome: pericia.nome };
    }

    return { pericias: lista, pontosRestantes: pontosDisponiveis - custo };
  }

  /**
   * Copia os ranks que o passado concede. Chamado ao escolher o passado no
   * onboarding — os ranks são de graça e ficam registrados em `rankInicial`,
   * para o dia em que alguém precise saber o que foi comprado e o que veio
   * de origem.
   */
  async aplicarPericiasDoPassado(
    pericias: PericiaDoPersonagem[],
    periciasIniciais: Array<{ periciaId: number; rank: number }>,
  ): Promise<PericiaDoPersonagem[]> {
    if (periciasIniciais.length === 0) return pericias;

    const catalogo = await this.listar();
    const porId = new Map(catalogo.map((pericia) => [pericia.id, pericia]));
    const lista = [...pericias];

    for (const inicial of periciasIniciais) {
      const doCatalogo = porId.get(inicial.periciaId);
      if (!doCatalogo) continue; // perícia apagada: ignora em vez de quebrar

      const posicao = lista.findIndex((entrada) => entrada.periciaId === inicial.periciaId);
      if (posicao === -1) {
        lista.push({
          periciaId: inicial.periciaId,
          nome: doCatalogo.nome,
          rank: inicial.rank,
          rankInicial: inicial.rank,
        });
      } else {
        // Já tinha a perícia: fica o maior dos dois, e o inicial é registrado.
        lista[posicao] = {
          ...lista[posicao],
          rank: Math.max(lista[posicao].rank, inicial.rank),
          rankInicial: inicial.rank,
        };
      }
    }

    return lista;
  }
}
