import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { RaridadeModel } from "./models/raridade.model.js";
import type { CriarRaridadeDto, EditarRaridadeDto } from "./raridade.dto.js";

export type RaridadeApi = {
  item: number;
  descricao: string;
  ordem: number;
  /** Number, não string: o Sequelize devolve DECIMAL como texto. */
  multiplicador_valor: number;
  dificuldade_base: number | null;
  disponibilidade: string;
  cor: string;
};

/** Tabelas que apontam para raridade. Cresce junto com consumiveis e itens. */
const TABELAS_QUE_USAM_RARIDADE = ["equipamentos"] as const;

@Injectable()
export class RaridadeService {
  constructor(
    @InjectModel(RaridadeModel)
    private readonly modeloRaridade: typeof RaridadeModel,
    private readonly sequelize: Sequelize,
  ) {}

  async listar(): Promise<RaridadeApi[]> {
    const encontradas = await this.modeloRaridade.findAll({ order: [["ordem", "ASC"]] });
    return encontradas.map((raridade) => this.paraApi(raridade));
  }

  async criar(dados: CriarRaridadeDto): Promise<RaridadeApi> {
    const criada = await this.modeloRaridade.create({
      descricao: dados.descricao.trim(),
      ordem: dados.ordem,
      multiplicadorValor: dados.multiplicador_valor,
      dificuldadeBase: dados.dificuldade_base ?? null,
      disponibilidade: dados.disponibilidade?.trim() ?? "",
      cor: dados.cor?.trim() || "zinc",
    });
    return this.paraApi(criada);
  }

  async editar(item: number, dados: EditarRaridadeDto): Promise<RaridadeApi> {
    const registro = await this.buscarOuFalhar(item);

    if (dados.descricao !== undefined) registro.descricao = dados.descricao.trim();
    if (dados.ordem !== undefined) registro.ordem = dados.ordem;
    if (dados.multiplicador_valor !== undefined) {
      registro.multiplicadorValor = String(dados.multiplicador_valor);
    }
    if (dados.dificuldade_base !== undefined) registro.dificuldadeBase = dados.dificuldade_base;
    if (dados.disponibilidade !== undefined) registro.disponibilidade = dados.disponibilidade.trim();
    if (dados.cor !== undefined) registro.cor = dados.cor.trim() || "zinc";

    await registro.save();
    return this.paraApi(registro);
  }

  /**
   * Recusa apagar uma raridade que algum item ainda usa. Sem FOREIGN KEY no
   * banco, nada impediria — e o item ficaria apontando para o vazio, sem erro
   * nenhum, até alguém abrir a tela e ver um campo em branco.
   */
  async deletar(item: number): Promise<void> {
    const registro = await this.buscarOuFalhar(item);

    for (const tabela of TABELAS_QUE_USAM_RARIDADE) {
      const [{ total }] = await this.sequelize.query<{ total: string }>(
        `SELECT count(*)::text AS total FROM ${tabela}
          WHERE raridade_item = :item AND deleted_at IS NULL`,
        { replacements: { item }, type: QueryTypes.SELECT },
      );

      if (Number(total) > 0) {
        throw new BadRequestException(
          `Não dá para apagar: ${total} registro(s) em "${tabela}" ainda usam esta raridade.`,
        );
      }
    }

    await registro.destroy();
  }

  private async buscarOuFalhar(item: number): Promise<RaridadeModel> {
    const registro = await this.modeloRaridade.findByPk(item);
    if (!registro) throw new NotFoundException("Raridade não encontrada.");
    return registro;
  }

  private paraApi(raridade: RaridadeModel): RaridadeApi {
    return {
      item: raridade.item,
      descricao: raridade.descricao,
      ordem: raridade.ordem,
      multiplicador_valor: Number(raridade.multiplicadorValor),
      dificuldade_base: raridade.dificuldadeBase,
      disponibilidade: raridade.disponibilidade,
      cor: raridade.cor,
    };
  }
}
