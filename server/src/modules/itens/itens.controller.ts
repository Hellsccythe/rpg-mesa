import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { ItensService } from "./itens.service.js";
import {
  CriarCategoriaItemDto,
  CriarItemDto,
  EditarCategoriaItemDto,
  EditarItemDto,
} from "./itens.dto.js";

@Controller("itens")
export class ItensController {
  constructor(private readonly servicoItens: ItensService) {}

  /** Rotas literais antes das que têm `:id`, senão "categorias" vira id. */
  @Get("categorias")
  listarCategorias() {
    return this.servicoItens.listarCategorias();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("categorias/admin")
  criarCategoria(@Body() dados: CriarCategoriaItemDto) {
    return this.servicoItens.criarCategoria(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("categorias/admin/:item")
  editarCategoria(
    @Param("item", ParseIntPipe) item: number,
    @Body() dados: EditarCategoriaItemDto,
  ) {
    return this.servicoItens.editarCategoria(item, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("categorias/admin/:item")
  async deletarCategoria(@Param("item", ParseIntPipe) item: number) {
    await this.servicoItens.deletarCategoria(item);
    return { ok: true };
  }

  @Get()
  listar() {
    return this.servicoItens.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dados: CriarItemDto) {
    return this.servicoItens.criar(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dados: EditarItemDto) {
    return this.servicoItens.editar(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id")
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoItens.deletar(id);
    return { ok: true };
  }
}
