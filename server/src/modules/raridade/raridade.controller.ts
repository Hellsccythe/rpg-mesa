import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { RaridadeService } from "./raridade.service.js";
import { CriarRaridadeDto, EditarRaridadeDto } from "./raridade.dto.js";

@Controller("raridades")
export class RaridadeController {
  constructor(private readonly servicoRaridade: RaridadeService) {}

  /**
   * Pública: a raridade aparece ao lado de todo item, e as telas de catálogo
   * (equipamentos, deuses, classes) já são públicas. Não há nada a esconder
   * numa escala de raridade.
   */
  @Get()
  listar() {
    return this.servicoRaridade.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dados: CriarRaridadeDto) {
    return this.servicoRaridade.criar(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:item")
  editar(@Param("item", ParseIntPipe) item: number, @Body() dados: EditarRaridadeDto) {
    return this.servicoRaridade.editar(item, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:item")
  async deletar(@Param("item", ParseIntPipe) item: number) {
    await this.servicoRaridade.deletar(item);
    return { ok: true };
  }
}
