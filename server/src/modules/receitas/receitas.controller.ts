import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { ReceitasService } from "./receitas.service.js";
import { CriarReceitaDto, EditarReceitaDto } from "./receitas.dto.js";

@Controller("receitas")
export class ReceitasController {
  constructor(private readonly servicoReceitas: ReceitasService) {}

  /**
   * Pública: saber que a Poção de Cura Menor sai de duas ervas e duas águas é
   * conhecimento de mundo, não segredo do mestre. Quem PODE fabricar depende
   * da perícia do personagem, e isso é checado na hora de fabricar.
   */
  @Get()
  listar() {
    return this.servicoReceitas.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dados: CriarReceitaDto) {
    return this.servicoReceitas.criar(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dados: EditarReceitaDto) {
    return this.servicoReceitas.editar(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id")
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoReceitas.deletar(id);
    return { ok: true };
  }
}
