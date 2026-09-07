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
import { TitulosService } from "./titulos.service.js";
import {
  AdicionarTituloPersonagemDto,
  EditarTituloDto,
  SalvarTituloDto,
} from "./titulos.dto.js";

@Controller("titulos")
export class TitulosController {
  constructor(private readonly servicoTitulos: TitulosService) {}

  @Get("catalogo")
  listarCatalogo() {
    return this.servicoTitulos.listarCatalogo();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/personagens/:characterId")
  adicionarEmPersonagem(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: AdicionarTituloPersonagemDto,
  ) {
    return this.servicoTitulos.adicionarEmPersonagem(personagemId, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dados: SalvarTituloDto) {
    return this.servicoTitulos.criar(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dados: EditarTituloDto) {
    return this.servicoTitulos.editar(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id")
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoTitulos.deletar(id);
    return { success: true };
  }
}
