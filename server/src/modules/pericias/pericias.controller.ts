import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { PericiasService } from "./pericias.service.js";
import { CriarPericiaDto, EditarPericiaDto } from "./pericias.dto.js";

@Controller("pericias")
export class PericiasController {
  constructor(private readonly servicoPericias: PericiasService) {}

  /** Pública: o catálogo de perícias é conhecimento de mundo, como as classes. */
  @Get()
  listar() {
    return this.servicoPericias.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dados: CriarPericiaDto) {
    return this.servicoPericias.criar(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dados: EditarPericiaDto) {
    return this.servicoPericias.editar(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id")
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoPericias.deletar(id);
    return { ok: true };
  }
}
