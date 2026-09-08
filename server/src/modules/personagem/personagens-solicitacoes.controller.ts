import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { UsuarioLogado } from "../../common/auth/usuario-logado.decorator.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PersonagensSolicitacoesService } from "./personagens-solicitacoes.service.js";
import { RevisarSolicitacaoDto, SolicitarAlteracaoDto } from "./personagens-solicitacoes.dto.js";

@Controller("personagens")
export class PersonagensSolicitacoesController {
  constructor(private readonly servicoSolicitacoes: PersonagensSolicitacoesService) {}

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin/solicitacoes")
  listarPendentes() {
    return this.servicoSolicitacoes.listarPendentes();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/solicitacoes/:characterId/revisar")
  revisar(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: RevisarSolicitacaoDto,
  ) {
    return this.servicoSolicitacoes.revisar(personagemId, dados.approve);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":characterId/solicitacao")
  solicitarAlteracao(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: SolicitarAlteracaoDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoSolicitacoes.solicitarAlteracao(personagemId, dados, usuario);
  }
}
