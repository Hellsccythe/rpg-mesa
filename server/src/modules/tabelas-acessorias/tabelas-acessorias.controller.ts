import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { TabelasAcessoriasService } from "./tabelas-acessorias.service.js";
import {
  CriarTipoEquipamentoDto,
  EditarTipoEquipamentoDto,
  CriarCategoriaArmaDto,
  EditarCategoriaArmaDto,
  CriarCategoriaArmaduraDto,
  EditarCategoriaArmaduraDto,
  CriarCategoriaVariadosDto,
  EditarCategoriaVariadosDto,
  CriarFilhoArmaDto,
  EditarFilhoArmaDto,
  CriarFilhoArmaduraDto,
  EditarFilhoArmaduraDto,
  CriarFilhoVariadosDto,
  EditarFilhoVariadosDto,
} from "./tabelas-acessorias.dto.js";

const ITEM_USO_EQUIPAMENTO_ARMA = 1;
const ITEM_USO_EQUIPAMENTO_ARMADURA = 2;
const ITEM_USO_EQUIPAMENTO_VARIADOS = 3;

@Controller("tabelas-acessorias")
export class TabelasAcessoriasController {
  constructor(private readonly servicoTabelasAcessorias: TabelasAcessoriasService) {}

  // ── uso_equipamento ──────────────────────────────────────────────────────
  @Get("uso-equipamento")
  listarTipos() {
    return this.servicoTabelasAcessorias.tipos.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("uso-equipamento/admin")
  criarTipo(@Body() dadosCriacao: CriarTipoEquipamentoDto) {
    return this.servicoTabelasAcessorias.tipos.criar({
      descricao: dadosCriacao.descricao.trim(),
    });
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("uso-equipamento/admin/:item")
  editarTipo(
    @Param("item", ParseIntPipe) item: number,
    @Body() dadosEdicao: EditarTipoEquipamentoDto,
  ) {
    const alteracoes: Record<string, unknown> = {};
    if (dadosEdicao.descricao !== undefined) alteracoes.descricao = dadosEdicao.descricao.trim();
    return this.servicoTabelasAcessorias.tipos.editar(item, alteracoes);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("uso-equipamento/admin/:item")
  deletarTipo(@Param("item", ParseIntPipe) item: number) {
    return this.servicoTabelasAcessorias.tipos.deletar(item);
  }

  // ── categoria_arma ────────────────────────────────────────────────────────
  @Get("categorias-arma")
  listarCategoriasArma() {
    return this.servicoTabelasAcessorias.categoriasArma.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("categorias-arma/admin")
  criarCategoriaArma(@Body() dadosCriacao: CriarCategoriaArmaDto) {
    return this.servicoTabelasAcessorias.categoriasArma.criar({
      descricao: dadosCriacao.descricao.trim(),
      usoEquipamentoItem: ITEM_USO_EQUIPAMENTO_ARMA,
    });
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("categorias-arma/admin/:item")
  editarCategoriaArma(
    @Param("item", ParseIntPipe) item: number,
    @Body() dadosEdicao: EditarCategoriaArmaDto,
  ) {
    const alteracoes: Record<string, unknown> = {};
    if (dadosEdicao.descricao !== undefined) alteracoes.descricao = dadosEdicao.descricao.trim();
    return this.servicoTabelasAcessorias.categoriasArma.editar(item, alteracoes);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("categorias-arma/admin/:item")
  deletarCategoriaArma(@Param("item", ParseIntPipe) item: number) {
    return this.servicoTabelasAcessorias.categoriasArma.deletar(item);
  }

  // ── categoria_armadura ────────────────────────────────────────────────────
  @Get("categorias-armadura")
  listarCategoriasArmadura() {
    return this.servicoTabelasAcessorias.categoriasArmadura.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("categorias-armadura/admin")
  criarCategoriaArmadura(@Body() dadosCriacao: CriarCategoriaArmaduraDto) {
    return this.servicoTabelasAcessorias.categoriasArmadura.criar({
      descricao: dadosCriacao.descricao.trim(),
      usoEquipamentoItem: ITEM_USO_EQUIPAMENTO_ARMADURA,
    });
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("categorias-armadura/admin/:item")
  editarCategoriaArmadura(
    @Param("item", ParseIntPipe) item: number,
    @Body() dadosEdicao: EditarCategoriaArmaduraDto,
  ) {
    const alteracoes: Record<string, unknown> = {};
    if (dadosEdicao.descricao !== undefined) alteracoes.descricao = dadosEdicao.descricao.trim();
    return this.servicoTabelasAcessorias.categoriasArmadura.editar(item, alteracoes);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("categorias-armadura/admin/:item")
  deletarCategoriaArmadura(@Param("item", ParseIntPipe) item: number) {
    return this.servicoTabelasAcessorias.categoriasArmadura.deletar(item);
  }

  // ── categoria_variados ────────────────────────────────────────────────────
  @Get("categorias-variados")
  listarCategoriasVariados() {
    return this.servicoTabelasAcessorias.categoriasVariados.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("categorias-variados/admin")
  criarCategoriaVariados(@Body() dadosCriacao: CriarCategoriaVariadosDto) {
    return this.servicoTabelasAcessorias.categoriasVariados.criar({
      descricao: dadosCriacao.descricao.trim(),
      usoEquipamentoItem: ITEM_USO_EQUIPAMENTO_VARIADOS,
    });
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("categorias-variados/admin/:item")
  editarCategoriaVariados(
    @Param("item", ParseIntPipe) item: number,
    @Body() dadosEdicao: EditarCategoriaVariadosDto,
  ) {
    const alteracoes: Record<string, unknown> = {};
    if (dadosEdicao.descricao !== undefined) alteracoes.descricao = dadosEdicao.descricao.trim();
    return this.servicoTabelasAcessorias.categoriasVariados.editar(item, alteracoes);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("categorias-variados/admin/:item")
  deletarCategoriaVariados(@Param("item", ParseIntPipe) item: number) {
    return this.servicoTabelasAcessorias.categoriasVariados.deletar(item);
  }

  // ── propriedade_arma ──────────────────────────────────────────────────────
  @Get("propriedades-arma")
  listarPropriedadesArma() {
    return this.servicoTabelasAcessorias.propriedadesArma.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("propriedades-arma/admin")
  criarPropriedadeArma(@Body() dadosCriacao: CriarFilhoArmaDto) {
    return this.servicoTabelasAcessorias.propriedadesArma.criar({
      descricao: dadosCriacao.descricao.trim(),
      categoriaArmaItem: dadosCriacao.categoria_arma_item ?? null,
    });
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("propriedades-arma/admin/:item")
  editarPropriedadeArma(
    @Param("item", ParseIntPipe) item: number,
    @Body() dadosEdicao: EditarFilhoArmaDto,
  ) {
    const alteracoes: Record<string, unknown> = {};
    if (dadosEdicao.descricao !== undefined) alteracoes.descricao = dadosEdicao.descricao.trim();
    if (dadosEdicao.categoria_arma_item !== undefined) {
      alteracoes.categoriaArmaItem = dadosEdicao.categoria_arma_item;
    }
    return this.servicoTabelasAcessorias.propriedadesArma.editar(item, alteracoes);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("propriedades-arma/admin/:item")
  deletarPropriedadeArma(@Param("item", ParseIntPipe) item: number) {
    return this.servicoTabelasAcessorias.propriedadesArma.deletar(item);
  }

  // ── classe_arma ───────────────────────────────────────────────────────────
  @Get("classes-arma")
  listarClassesArma() {
    return this.servicoTabelasAcessorias.classesArma.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("classes-arma/admin")
  criarClasseArma(@Body() dadosCriacao: CriarFilhoArmaDto) {
    return this.servicoTabelasAcessorias.classesArma.criar({
      descricao: dadosCriacao.descricao.trim(),
      categoriaArmaItem: dadosCriacao.categoria_arma_item ?? null,
    });
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("classes-arma/admin/:item")
  editarClasseArma(
    @Param("item", ParseIntPipe) item: number,
    @Body() dadosEdicao: EditarFilhoArmaDto,
  ) {
    const alteracoes: Record<string, unknown> = {};
    if (dadosEdicao.descricao !== undefined) alteracoes.descricao = dadosEdicao.descricao.trim();
    if (dadosEdicao.categoria_arma_item !== undefined) {
      alteracoes.categoriaArmaItem = dadosEdicao.categoria_arma_item;
    }
    return this.servicoTabelasAcessorias.classesArma.editar(item, alteracoes);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("classes-arma/admin/:item")
  deletarClasseArma(@Param("item", ParseIntPipe) item: number) {
    return this.servicoTabelasAcessorias.classesArma.deletar(item);
  }

  // ── propriedade_armadura ──────────────────────────────────────────────────
  @Get("propriedades-armadura")
  listarPropriedadesArmadura() {
    return this.servicoTabelasAcessorias.propriedadesArmadura.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("propriedades-armadura/admin")
  criarPropriedadeArmadura(@Body() dadosCriacao: CriarFilhoArmaduraDto) {
    return this.servicoTabelasAcessorias.propriedadesArmadura.criar({
      descricao: dadosCriacao.descricao.trim(),
      categoriaArmaduraItem: dadosCriacao.categoria_armadura_item ?? null,
    });
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("propriedades-armadura/admin/:item")
  editarPropriedadeArmadura(
    @Param("item", ParseIntPipe) item: number,
    @Body() dadosEdicao: EditarFilhoArmaduraDto,
  ) {
    const alteracoes: Record<string, unknown> = {};
    if (dadosEdicao.descricao !== undefined) alteracoes.descricao = dadosEdicao.descricao.trim();
    if (dadosEdicao.categoria_armadura_item !== undefined) {
      alteracoes.categoriaArmaduraItem = dadosEdicao.categoria_armadura_item;
    }
    return this.servicoTabelasAcessorias.propriedadesArmadura.editar(item, alteracoes);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("propriedades-armadura/admin/:item")
  deletarPropriedadeArmadura(@Param("item", ParseIntPipe) item: number) {
    return this.servicoTabelasAcessorias.propriedadesArmadura.deletar(item);
  }

  // ── classe_armadura ───────────────────────────────────────────────────────
  @Get("classes-armadura")
  listarClassesArmadura() {
    return this.servicoTabelasAcessorias.classesArmadura.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("classes-armadura/admin")
  criarClasseArmadura(@Body() dadosCriacao: CriarFilhoArmaduraDto) {
    return this.servicoTabelasAcessorias.classesArmadura.criar({
      descricao: dadosCriacao.descricao.trim(),
      categoriaArmaduraItem: dadosCriacao.categoria_armadura_item ?? null,
    });
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("classes-armadura/admin/:item")
  editarClasseArmadura(
    @Param("item", ParseIntPipe) item: number,
    @Body() dadosEdicao: EditarFilhoArmaduraDto,
  ) {
    const alteracoes: Record<string, unknown> = {};
    if (dadosEdicao.descricao !== undefined) alteracoes.descricao = dadosEdicao.descricao.trim();
    if (dadosEdicao.categoria_armadura_item !== undefined) {
      alteracoes.categoriaArmaduraItem = dadosEdicao.categoria_armadura_item;
    }
    return this.servicoTabelasAcessorias.classesArmadura.editar(item, alteracoes);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("classes-armadura/admin/:item")
  deletarClasseArmadura(@Param("item", ParseIntPipe) item: number) {
    return this.servicoTabelasAcessorias.classesArmadura.deletar(item);
  }

  // ── propriedade_variados ──────────────────────────────────────────────────
  @Get("propriedades-variados")
  listarPropriedadesVariados() {
    return this.servicoTabelasAcessorias.propriedadesVariados.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("propriedades-variados/admin")
  criarPropriedadeVariados(@Body() dadosCriacao: CriarFilhoVariadosDto) {
    return this.servicoTabelasAcessorias.propriedadesVariados.criar({
      descricao: dadosCriacao.descricao.trim(),
      categoriaVariadosItem: dadosCriacao.categoria_variados_item ?? null,
    });
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("propriedades-variados/admin/:item")
  editarPropriedadeVariados(
    @Param("item", ParseIntPipe) item: number,
    @Body() dadosEdicao: EditarFilhoVariadosDto,
  ) {
    const alteracoes: Record<string, unknown> = {};
    if (dadosEdicao.descricao !== undefined) alteracoes.descricao = dadosEdicao.descricao.trim();
    if (dadosEdicao.categoria_variados_item !== undefined) {
      alteracoes.categoriaVariadosItem = dadosEdicao.categoria_variados_item;
    }
    return this.servicoTabelasAcessorias.propriedadesVariados.editar(item, alteracoes);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("propriedades-variados/admin/:item")
  deletarPropriedadeVariados(@Param("item", ParseIntPipe) item: number) {
    return this.servicoTabelasAcessorias.propriedadesVariados.deletar(item);
  }

  // ── classe_variados ───────────────────────────────────────────────────────
  @Get("classes-variados")
  listarClassesVariados() {
    return this.servicoTabelasAcessorias.classesVariados.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("classes-variados/admin")
  criarClasseVariados(@Body() dadosCriacao: CriarFilhoVariadosDto) {
    return this.servicoTabelasAcessorias.classesVariados.criar({
      descricao: dadosCriacao.descricao.trim(),
      categoriaVariadosItem: dadosCriacao.categoria_variados_item ?? null,
    });
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("classes-variados/admin/:item")
  editarClasseVariados(
    @Param("item", ParseIntPipe) item: number,
    @Body() dadosEdicao: EditarFilhoVariadosDto,
  ) {
    const alteracoes: Record<string, unknown> = {};
    if (dadosEdicao.descricao !== undefined) alteracoes.descricao = dadosEdicao.descricao.trim();
    if (dadosEdicao.categoria_variados_item !== undefined) {
      alteracoes.categoriaVariadosItem = dadosEdicao.categoria_variados_item;
    }
    return this.servicoTabelasAcessorias.classesVariados.editar(item, alteracoes);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("classes-variados/admin/:item")
  deletarClasseVariados(@Param("item", ParseIntPipe) item: number) {
    return this.servicoTabelasAcessorias.classesVariados.deletar(item);
  }
}
