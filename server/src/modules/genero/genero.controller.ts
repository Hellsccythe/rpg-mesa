import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { GeneroService } from "./genero.service.js";
import { CriarGeneroDto, EditarGeneroDto } from "./genero.dto.js";

@Controller("genero")
export class GeneroController {
  constructor(private readonly servicoGenero: GeneroService) {}

  @Get()
  listar() {
    return this.servicoGenero.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dadosCriacao: CriarGeneroDto) {
    return this.servicoGenero.criar(dadosCriacao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dadosEdicao: EditarGeneroDto) {
    return this.servicoGenero.editar(id, dadosEdicao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id")
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoGenero.deletar(id);
    return { success: true };
  }
}
