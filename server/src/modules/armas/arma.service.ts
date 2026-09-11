import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { EquipamentoModel } from "./models/equipamento.model.js";
import {
  CategoriaEquipamentoModel,
  ClasseEquipamentoModel,
  PropriedadeEquipamentoModel,
  TipoEquipamentoModel,
} from "./models/lookups-equipamento.model.js";
import type {
  CriarCategoriaEquipamentoDto,
  CriarClasseEquipamentoDto,
  CriarEquipamentoDto,
  CriarFilhoDeCategoriaDto,
  EditarCategoriaEquipamentoDto,
  EditarClasseEquipamentoDto,
  EditarEquipamentoDto,
  EditarFilhoDeCategoriaDto,
} from "./arma.dto.js";

export type EquipamentoApi = {
  id: number;
  nome: string;
  /** Só a notação do dado. Ver o comentário da coluna no model. */
  dano: string;
  dano_alternativo: string | null;
  multiplicador_critico: number | null;
  tipo_dano_item: number | null;
  defesa_fisica: number | null;
  defesa_magica: number | null;
  pericia_id: number | null;
  alcance_ideal: number | null;
  alcance_maximo: number | null;
  raridade_item: number | null;
  peso: number | null;
  valor: number | null;
  categoria_equipamento_item: number | null;
  classe_equipamento_item: number[];
  tipo_equipamento_item: number[];
  propriedade_equipamento_item: number[];
  descricao_equipamento: string | null;
  pre_requisitos: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CategoriaEquipamentoApi = { item: number; descricao: string; icone: string | null };
export type ClasseEquipamentoApi = { item: number; descricao: string };
export type FilhoDeCategoriaApi = {
  item: number;
  descricao: string;
  categoria_item: number | null;
};

function formatarData(valor: unknown): string | null {
  return valor instanceof Date ? valor.toISOString() : null;
}

/**
 * DECIMAL chega como texto pelo driver do Postgres (para não perder precisão
 * em valores grandes). A API sempre devolveu número nestes dois campos.
 */
function paraNumeroOuNulo(valor: string | number | null): number | null {
  if (valor === null || valor === undefined) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

/**
 * Tipo e propriedade têm exatamente a mesma forma (item, descricao,
 * categoria_item) e as mesmas regras, então compartilham a implementação em
 * vez de repetir os quatro métodos duas vezes.
 */
type ModeloFilhoDeCategoria = typeof TipoEquipamentoModel | typeof PropriedadeEquipamentoModel;

function textoOuNulo(valor: string | null | undefined): string | null {
  const texto = typeof valor === "string" ? valor.trim() : "";
  return texto === "" ? null : texto;
}

@Injectable()
export class ArmaService {
  constructor(
    @InjectModel(EquipamentoModel)
    private readonly modeloEquipamento: typeof EquipamentoModel,
    @InjectModel(CategoriaEquipamentoModel)
    private readonly modeloCategoria: typeof CategoriaEquipamentoModel,
    @InjectModel(ClasseEquipamentoModel)
    private readonly modeloClasse: typeof ClasseEquipamentoModel,
    @InjectModel(TipoEquipamentoModel)
    private readonly modeloTipo: typeof TipoEquipamentoModel,
    @InjectModel(PropriedadeEquipamentoModel)
    private readonly modeloPropriedade: typeof PropriedadeEquipamentoModel,
  ) {}

  // ── Equipamentos ──────────────────────────────────────────────────────────

  /**
   * A listagem pública e a do mestre devolvem exatamente o mesmo conteúdo — a
   * diferença estava só em qual cliente do Supabase era usado, o que deixou de
   * existir. Ficam as duas porque o frontend chama as duas.
   */
  async listar(): Promise<EquipamentoApi[]> {
    const encontrados = await this.modeloEquipamento.findAll({ order: [["nome", "ASC"]] });
    return encontrados.map((equipamento) => this.mapearEquipamento(equipamento));
  }

  async criar(dados: CriarEquipamentoDto): Promise<EquipamentoApi> {
    const criado = await this.modeloEquipamento.create({
      nome: dados.nome.trim(),
      // dano é NOT NULL no banco; sem valor vira string vazia, não null.
      dano: dados.dano?.trim() ?? "",
      danoAlternativo: textoOuNulo(dados.dano_alternativo),
      multiplicadorCritico: dados.multiplicador_critico ?? null,
      tipoDanoItem: dados.tipo_dano_item ?? null,
      defesaFisica: dados.defesa_fisica ?? null,
      defesaMagica: dados.defesa_magica ?? null,
      periciaId: dados.pericia_id ?? null,
      alcanceIdeal: dados.alcance_ideal ?? null,
      alcanceMaximo: dados.alcance_maximo ?? null,
      raridadeItem: dados.raridade_item ?? null,
      peso: dados.peso ?? null,
      valor: dados.valor ?? null,
      categoriaEquipamentoItem: dados.categoria_equipamento_item ?? null,
      classeEquipamentoItem: dados.classe_equipamento_item ?? [],
      tipoEquipamentoItem: dados.tipo_equipamento_item ?? [],
      propriedadeEquipamentoItem: dados.propriedade_equipamento_item ?? [],
      descricaoEquipamento: textoOuNulo(dados.descricao_equipamento),
      preRequisitos: textoOuNulo(dados.pre_requisitos),
    });

    return this.mapearEquipamento(criado);
  }

  async editar(id: number, dados: EditarEquipamentoDto): Promise<EquipamentoApi> {
    const equipamento = await this.modeloEquipamento.findByPk(id);
    if (!equipamento) {
      throw new NotFoundException("Equipamento não encontrado.");
    }

    if (dados.nome !== undefined) equipamento.nome = dados.nome.trim();
    if (dados.dano !== undefined) equipamento.dano = dados.dano?.trim() ?? "";
    if (dados.dano_alternativo !== undefined) {
      equipamento.danoAlternativo = textoOuNulo(dados.dano_alternativo);
    }
    if (dados.multiplicador_critico !== undefined) {
      equipamento.multiplicadorCritico = dados.multiplicador_critico;
    }
    if (dados.tipo_dano_item !== undefined) equipamento.tipoDanoItem = dados.tipo_dano_item;
    if (dados.defesa_fisica !== undefined) equipamento.defesaFisica = dados.defesa_fisica;
    if (dados.defesa_magica !== undefined) equipamento.defesaMagica = dados.defesa_magica;
    if (dados.pericia_id !== undefined) equipamento.periciaId = dados.pericia_id;
    if (dados.alcance_ideal !== undefined) equipamento.alcanceIdeal = dados.alcance_ideal;
    if (dados.alcance_maximo !== undefined) equipamento.alcanceMaximo = dados.alcance_maximo;
    if (dados.raridade_item !== undefined) equipamento.raridadeItem = dados.raridade_item;
    if (dados.peso !== undefined) equipamento.peso = dados.peso;
    if (dados.valor !== undefined) equipamento.valor = dados.valor;
    if (dados.categoria_equipamento_item !== undefined) {
      equipamento.categoriaEquipamentoItem = dados.categoria_equipamento_item;
    }
    if (dados.classe_equipamento_item !== undefined) {
      equipamento.classeEquipamentoItem = dados.classe_equipamento_item ?? [];
    }
    if (dados.tipo_equipamento_item !== undefined) {
      equipamento.tipoEquipamentoItem = dados.tipo_equipamento_item ?? [];
    }
    if (dados.propriedade_equipamento_item !== undefined) {
      equipamento.propriedadeEquipamentoItem = dados.propriedade_equipamento_item ?? [];
    }
    if (dados.descricao_equipamento !== undefined) {
      equipamento.descricaoEquipamento = textoOuNulo(dados.descricao_equipamento);
    }
    if (dados.pre_requisitos !== undefined) {
      equipamento.preRequisitos = textoOuNulo(dados.pre_requisitos);
    }

    await equipamento.save();
    return this.mapearEquipamento(equipamento);
  }

  async deletar(id: number): Promise<void> {
    const equipamento = await this.modeloEquipamento.findByPk(id);
    if (!equipamento) {
      throw new NotFoundException("Equipamento não encontrado.");
    }
    await equipamento.destroy();
  }

  // ── Categorias ────────────────────────────────────────────────────────────

  async listarCategorias(): Promise<CategoriaEquipamentoApi[]> {
    const encontradas = await this.modeloCategoria.findAll({ order: [["item", "ASC"]] });
    return encontradas.map((categoria) => ({
      item: categoria.item,
      descricao: categoria.descricao,
      icone: categoria.icone,
    }));
  }

  async criarCategoria(dados: CriarCategoriaEquipamentoDto): Promise<CategoriaEquipamentoApi> {
    const criada = await this.modeloCategoria.create({
      descricao: dados.descricao.trim(),
      icone: textoOuNulo(dados.icone),
    });
    return { item: criada.item, descricao: criada.descricao, icone: criada.icone };
  }

  async editarCategoria(
    item: number,
    dados: EditarCategoriaEquipamentoDto,
  ): Promise<CategoriaEquipamentoApi> {
    const categoria = await this.modeloCategoria.findByPk(item);
    if (!categoria) {
      throw new NotFoundException("Categoria não encontrada.");
    }

    if (dados.descricao !== undefined) categoria.descricao = dados.descricao.trim();
    if (dados.icone !== undefined) categoria.icone = textoOuNulo(dados.icone);

    await categoria.save();
    return { item: categoria.item, descricao: categoria.descricao, icone: categoria.icone };
  }

  async deletarCategoria(item: number): Promise<void> {
    const categoria = await this.modeloCategoria.findByPk(item);
    if (!categoria) {
      throw new NotFoundException("Categoria não encontrada.");
    }
    await categoria.destroy();
  }

  // ── Classes ───────────────────────────────────────────────────────────────

  async listarClasses(): Promise<ClasseEquipamentoApi[]> {
    const encontradas = await this.modeloClasse.findAll({ order: [["item", "ASC"]] });
    return encontradas.map((classe) => ({ item: classe.item, descricao: classe.descricao }));
  }

  async criarClasse(dados: CriarClasseEquipamentoDto): Promise<ClasseEquipamentoApi> {
    const criada = await this.modeloClasse.create({ descricao: dados.descricao.trim() });
    return { item: criada.item, descricao: criada.descricao };
  }

  async editarClasse(
    item: number,
    dados: EditarClasseEquipamentoDto,
  ): Promise<ClasseEquipamentoApi> {
    const classe = await this.modeloClasse.findByPk(item);
    if (!classe) {
      throw new NotFoundException("Classe não encontrada.");
    }

    if (dados.descricao !== undefined) classe.descricao = dados.descricao.trim();

    await classe.save();
    return { item: classe.item, descricao: classe.descricao };
  }

  async deletarClasse(item: number): Promise<void> {
    const classe = await this.modeloClasse.findByPk(item);
    if (!classe) {
      throw new NotFoundException("Classe não encontrada.");
    }
    await classe.destroy();
  }

  // ── Tipos ─────────────────────────────────────────────────────────────────

  listarTipos(categoriaItem?: number): Promise<FilhoDeCategoriaApi[]> {
    return this.listarFilhosDeCategoria(this.modeloTipo, categoriaItem);
  }

  criarTipo(dados: CriarFilhoDeCategoriaDto): Promise<FilhoDeCategoriaApi> {
    return this.criarFilhoDeCategoria(this.modeloTipo, dados);
  }

  editarTipo(item: number, dados: EditarFilhoDeCategoriaDto): Promise<FilhoDeCategoriaApi> {
    return this.editarFilhoDeCategoria(this.modeloTipo, item, dados, "Tipo não encontrado.");
  }

  deletarTipo(item: number): Promise<void> {
    return this.deletarFilhoDeCategoria(this.modeloTipo, item, "Tipo não encontrado.");
  }

  // ── Propriedades ──────────────────────────────────────────────────────────

  listarPropriedades(categoriaItem?: number): Promise<FilhoDeCategoriaApi[]> {
    return this.listarFilhosDeCategoria(this.modeloPropriedade, categoriaItem);
  }

  criarPropriedade(dados: CriarFilhoDeCategoriaDto): Promise<FilhoDeCategoriaApi> {
    return this.criarFilhoDeCategoria(this.modeloPropriedade, dados);
  }

  editarPropriedade(item: number, dados: EditarFilhoDeCategoriaDto): Promise<FilhoDeCategoriaApi> {
    return this.editarFilhoDeCategoria(
      this.modeloPropriedade,
      item,
      dados,
      "Propriedade não encontrada.",
    );
  }

  deletarPropriedade(item: number): Promise<void> {
    return this.deletarFilhoDeCategoria(
      this.modeloPropriedade,
      item,
      "Propriedade não encontrada.",
    );
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  private async listarFilhosDeCategoria(
    modelo: ModeloFilhoDeCategoria,
    categoriaItem?: number,
  ): Promise<FilhoDeCategoriaApi[]> {
    const encontrados = await modelo.findAll({
      where: categoriaItem === undefined ? undefined : { categoriaItem },
      order: [["item", "ASC"]],
    });
    return encontrados.map((registro) => this.mapearFilhoDeCategoria(registro));
  }

  private async criarFilhoDeCategoria(
    modelo: ModeloFilhoDeCategoria,
    dados: CriarFilhoDeCategoriaDto,
  ): Promise<FilhoDeCategoriaApi> {
    await this.garantirCategoriaExistente(dados.categoria_item);

    const criado = await modelo.create({
      descricao: dados.descricao.trim(),
      categoriaItem: dados.categoria_item,
    });
    return this.mapearFilhoDeCategoria(criado);
  }

  private async editarFilhoDeCategoria(
    modelo: ModeloFilhoDeCategoria,
    item: number,
    dados: EditarFilhoDeCategoriaDto,
    mensagemDeErro: string,
  ): Promise<FilhoDeCategoriaApi> {
    const registro = await modelo.findByPk(item);
    if (!registro) {
      throw new NotFoundException(mensagemDeErro);
    }

    if (dados.descricao !== undefined) registro.descricao = dados.descricao.trim();
    if (dados.categoria_item !== undefined) {
      await this.garantirCategoriaExistente(dados.categoria_item);
      registro.categoriaItem = dados.categoria_item;
    }

    await registro.save();
    return this.mapearFilhoDeCategoria(registro);
  }

  private async deletarFilhoDeCategoria(
    modelo: ModeloFilhoDeCategoria,
    item: number,
    mensagemDeErro: string,
  ): Promise<void> {
    const registro = await modelo.findByPk(item);
    if (!registro) {
      throw new NotFoundException(mensagemDeErro);
    }
    await registro.destroy();
  }

  private async garantirCategoriaExistente(item: number): Promise<void> {
    const categoria = await this.modeloCategoria.findByPk(item);
    if (!categoria) {
      throw new NotFoundException("Categoria não encontrada.");
    }
  }

  private mapearFilhoDeCategoria(
    registro: TipoEquipamentoModel | PropriedadeEquipamentoModel,
  ): FilhoDeCategoriaApi {
    return {
      item: registro.item,
      descricao: registro.descricao,
      categoria_item: registro.categoriaItem,
    };
  }

  private mapearEquipamento(equipamento: EquipamentoModel): EquipamentoApi {
    return {
      id: equipamento.id,
      nome: equipamento.nome?.trim() ?? "",
      dano: equipamento.dano?.trim() ?? "",
      dano_alternativo: equipamento.danoAlternativo,
      multiplicador_critico: equipamento.multiplicadorCritico,
      tipo_dano_item: equipamento.tipoDanoItem,
      defesa_fisica: equipamento.defesaFisica,
      defesa_magica: equipamento.defesaMagica,
      pericia_id: equipamento.periciaId,
      alcance_ideal: equipamento.alcanceIdeal,
      alcance_maximo: equipamento.alcanceMaximo,
      raridade_item: equipamento.raridadeItem,
      peso: paraNumeroOuNulo(equipamento.peso),
      valor: paraNumeroOuNulo(equipamento.valor),
      categoria_equipamento_item: equipamento.categoriaEquipamentoItem,
      classe_equipamento_item: equipamento.classeEquipamentoItem ?? [],
      tipo_equipamento_item: equipamento.tipoEquipamentoItem ?? [],
      propriedade_equipamento_item: equipamento.propriedadeEquipamentoItem ?? [],
      descricao_equipamento: equipamento.descricaoEquipamento,
      pre_requisitos: equipamento.preRequisitos,
      createdAt: formatarData(equipamento.get("createdAt")),
      updatedAt: formatarData(equipamento.get("updatedAt")),
    };
  }
}
