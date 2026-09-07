import { Body, Controller, Get, Param, ParseIntPipe, Put, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { UsuarioLogado } from "../../common/auth/usuario-logado.decorator.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PlayerTelasService } from "./player-telas.service.js";
import { DefinirTelasDto, FiltroTelasDoPersonagemDto } from "./player-telas.dto.js";

@Controller("player-telas")
export class PlayerTelasController {
  constructor(private readonly servicoPlayerTelas: PlayerTelasService) {}

  /** Lista fixa de telas liberáveis — nada de personagem aqui. */
  @Get("disponiveis")
  listarDisponiveis() {
    return this.servicoPlayerTelas.listarDisponiveis();
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  listarDoPersonagem(
    @Query() filtro: FiltroTelasDoPersonagemDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoPlayerTelas.listarDoPersonagem(filtro.characterId, usuario);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin/:characterId")
  listarParaMestre(@Param("characterId", ParseIntPipe) personagemId: number) {
    return this.servicoPlayerTelas.listarParaMestre(personagemId);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Put("admin/:characterId")
  definirTelas(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: DefinirTelasDto,
  ) {
    return this.servicoPlayerTelas.definirTelas(personagemId, dados.telas);
  }
}
