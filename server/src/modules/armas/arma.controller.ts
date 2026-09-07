import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { ArmaService } from "./arma.service.js";
import {
  CriarCategoriaEquipamentoDto,
  CriarClasseEquipamentoDto,
  CriarEquipamentoDto,
  CriarFilhoDeCategoriaDto,
  EditarCategoriaEquipamentoDto,
  EditarClasseEquipamentoDto,
  EditarEquipamentoDto,
  EditarFilhoDeCategoriaDto,
  FiltroPorCategoriaDto,
} from "./arma.dto.js";

/**
 * O caminho continua /armas por compatibilidade com o frontend, mas a tabela
 * é "equipamentos" e guarda armas, armaduras e itens variados.
 *
 * Ordem dos métodos importa: as rotas de "admin/categorias", "admin/classes",
 * "admin/tipos" e "admin/propriedades" ficam antes de "admin/:id" — a mais
 * genérica por último, sempre.
 */
@Controller("armas")
export class ArmaController {
  constructor(private readonly servicoArmas: ArmaService) {}

  // ── Tabelas de apoio: leitura pública ─────────────────────────────────────

  @Get("categorias")
  listarCategorias() {
    return this.servicoArmas.listarCategorias();
  }

  @Get("classes")
  listarClasses() {
    return this.servicoArmas.listarClasses();
  }

  @Get("tipos")
  listarTipos(@Query() filtro: FiltroPorCategoriaDto) {
    return this.servicoArmas.listarTipos(filtro.categoria);
  }

  @Get("propriedades")
  listarPropriedades(@Query() filtro: FiltroPorCategoriaDto) {
    return this.servicoArmas.listarPropriedades(filtro.categoria);
  }

  // ── Tabelas de apoio: escrita ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/categorias")
  criarCategoria(@Body() dados: CriarCategoriaEquipamentoDto) {
    return this.servicoArmas.criarCategoria(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/categorias/:item")
  editarCategoria(
    @Param("item", ParseIntPipe) item: number,
    @Body() dados: EditarCategoriaEquipamentoDto,
  ) {
    return this.servicoArmas.editarCategoria(item, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/categorias/:item")
  async deletarCategoria(@Param("item", ParseIntPipe) item: number) {
    await this.servicoArmas.deletarCategoria(item);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/classes")
  criarClasse(@Body() dados: CriarClasseEquipamentoDto) {
    return this.servicoArmas.criarClasse(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/classes/:item")
  editarClasse(
    @Param("item", ParseIntPipe) item: number,
    @Body() dados: EditarClasseEquipamentoDto,
  ) {
    return this.servicoArmas.editarClasse(item, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/classes/:item")
  async deletarClasse(@Param("item", ParseIntPipe) item: number) {
    await this.servicoArmas.deletarClasse(item);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/tipos")
  criarTipo(@Body() dados: CriarFilhoDeCategoriaDto) {
    return this.servicoArmas.criarTipo(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/tipos/:item")
  editarTipo(
    @Param("item", ParseIntPipe) item: number,
    @Body() dados: EditarFilhoDeCategoriaDto,
  ) {
    return this.servicoArmas.editarTipo(item, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/tipos/:item")
  async deletarTipo(@Param("item", ParseIntPipe) item: number) {
    await this.servicoArmas.deletarTipo(item);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/propriedades")
  criarPropriedade(@Body() dados: CriarFilhoDeCategoriaDto) {
    return this.servicoArmas.criarPropriedade(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/propriedades/:item")
  editarPropriedade(
    @Param("item", ParseIntPipe) item: number,
    @Body() dados: EditarFilhoDeCategoriaDto,
  ) {
    return this.servicoArmas.editarPropriedade(item, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/propriedades/:item")
  async deletarPropriedade(@Param("item", ParseIntPipe) item: number) {
    await this.servicoArmas.deletarPropriedade(item);
    return { success: true };
  }

  // ── Equipamentos ──────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin")
  listarParaMestre() {
    return this.servicoArmas.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dados: CriarEquipamentoDto) {
    return this.servicoArmas.criar(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:armaId")
  editar(@Param("armaId", ParseIntPipe) armaId: number, @Body() dados: EditarEquipamentoDto) {
    return this.servicoArmas.editar(armaId, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:armaId")
  async deletar(@Param("armaId", ParseIntPipe) armaId: number) {
    await this.servicoArmas.deletar(armaId);
    return { success: true };
  }

  @Get()
  listarPublico() {
    return this.servicoArmas.listar();
  }
}
