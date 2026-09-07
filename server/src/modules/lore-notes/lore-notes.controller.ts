import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { UsuarioLogado } from "../../common/auth/usuario-logado.decorator.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { LoreNotesService } from "./lore-notes.service.js";
import { CriarLoreNoteDto, EditarLoreNoteDto, FiltroLoreNotesDto } from "./lore-notes.dto.js";

@Controller("lore-notes")
export class LoreNotesController {
  constructor(private readonly servicoLoreNotes: LoreNotesService) {}

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin")
  listarParaMestre() {
    return this.servicoLoreNotes.listarParaMestre();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dados: CriarLoreNoteDto) {
    return this.servicoLoreNotes.criar(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dados: EditarLoreNoteDto) {
    return this.servicoLoreNotes.editar(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id")
  @HttpCode(204)
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoLoreNotes.deletar(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  listarParaPersonagem(
    @Query() filtro: FiltroLoreNotesDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoLoreNotes.listarParaPersonagem(filtro.characterId, usuario);
  }
}
