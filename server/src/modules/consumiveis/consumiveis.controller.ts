import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { ConsumiveisService } from "./consumiveis.service.js";
import {
  CriarCategoriaConsumivelDto,
  CriarConsumivelDto,
  EditarCategoriaConsumivelDto,
  EditarConsumivelDto,
} from "./consumiveis.dto.js";

@Controller("consumiveis")
export class ConsumiveisController {
  constructor(private readonly servicoConsumiveis: ConsumiveisService) {}

  /**
   * As rotas literais vêm antes das que têm `:id`. Com a ordem trocada,
   * "categorias" seria lido como um id e o ParseIntPipe recusaria a
   * requisição — armadilha que já mordeu outros módulos deste projeto.
   */
  @Get("categorias")
  listarCategorias() {
    return this.servicoConsumiveis.listarCategorias();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("categorias/admin")
  criarCategoria(@Body() dados: CriarCategoriaConsumivelDto) {
    return this.servicoConsumiveis.criarCategoria(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("categorias/admin/:item")
  editarCategoria(
    @Param("item", ParseIntPipe) item: number,
    @Body() dados: EditarCategoriaConsumivelDto,
  ) {
    return this.servicoConsumiveis.editarCategoria(item, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("categorias/admin/:item")
  async deletarCategoria(@Param("item", ParseIntPipe) item: number) {
    await this.servicoConsumiveis.deletarCategoria(item);
    return { ok: true };
  }

  /** Pública, como o catálogo de armas: o jogador precisa ver o que existe. */
  @Get()
  listar() {
    return this.servicoConsumiveis.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dados: CriarConsumivelDto) {
    return this.servicoConsumiveis.criar(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dados: EditarConsumivelDto) {
    return this.servicoConsumiveis.editar(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id")
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoConsumiveis.deletar(id);
    return { ok: true };
  }
}
