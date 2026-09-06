import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { LevelProgressionService } from "./level-progression.service.js";
import { FiltroLevelProgressionDto, SalvarLevelProgressionDto } from "./level-progression.dto.js";

/**
 * Catálogo próprio, mas servido sob /personagens/admin/level-progression:
 * são os caminhos que o frontend já chama, e mudá-los só geraria retrabalho
 * na tela sem ganho nenhum.
 */
@UseGuards(JwtAuthGuard, MasterGuard)
@Controller("personagens/admin/level-progression")
export class LevelProgressionController {
  constructor(private readonly servicoLevelProgression: LevelProgressionService) {}

  @Get()
  listar(@Query() filtro: FiltroLevelProgressionDto) {
    return this.servicoLevelProgression.listar(filtro.tier?.trim() || undefined);
  }

  @Post()
  salvar(@Body() dados: SalvarLevelProgressionDto) {
    return this.servicoLevelProgression.salvarEmLote(dados.entradas);
  }

  @Delete(":id")
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoLevelProgression.deletar(id);
    return { success: true };
  }
}
