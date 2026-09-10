import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { CondicoesService } from "./condicoes.service.js";
import { CriarCondicaoDto, EditarCondicaoDto } from "./condicoes.dto.js";

@Controller("condicoes")
export class CondicoesController {
  constructor(private readonly servicoCondicoes: CondicoesService) {}

  /**
   * Pública: saber o que Cegueira faz é conhecimento de mundo, e o jogador
   * precisa disso para decidir se compra o antídoto antes de descer na cripta.
   */
  @Get()
  listar() {
    return this.servicoCondicoes.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dados: CriarCondicaoDto) {
    return this.servicoCondicoes.criar(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dados: EditarCondicaoDto) {
    return this.servicoCondicoes.editar(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id")
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoCondicoes.deletar(id);
    return { ok: true };
  }
}
