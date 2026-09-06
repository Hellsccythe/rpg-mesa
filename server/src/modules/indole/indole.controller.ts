import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { IndoleService } from "./indole.service.js";
import { CriarIndoleDto, EditarIndoleDto } from "./indole.dto.js";

@Controller("indole")
export class IndoleController {
  constructor(private readonly servicoIndole: IndoleService) {}

  @Get()
  listar() {
    return this.servicoIndole.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dadosCriacao: CriarIndoleDto) {
    return this.servicoIndole.criar(dadosCriacao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dadosEdicao: EditarIndoleDto) {
    return this.servicoIndole.editar(id, dadosEdicao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id")
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoIndole.deletar(id);
    return { success: true };
  }
}
