import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { UsuarioLogado } from "../../common/auth/usuario-logado.decorator.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PersonagensConsultaService } from "./personagens-consulta.service.js";
import { ListarMeusPersonagensDto } from "./personagens-consulta.dto.js";

/**
 * Primeiro bloco do antigo módulo de personagens a migrar. As demais rotas
 * de /api/personagens continuam no router Express até serem migradas — o
 * main.ts registra as rotas do Nest antes, então estas duas ganham a disputa.
 */
@Controller("personagens")
export class PersonagensConsultaController {
  constructor(private readonly servicoConsulta: PersonagensConsultaService) {}

  /** Tela de entrada, sem autenticação: qualquer visitante carrega. */
  @Get("pagina")
  paginaInicial(@Query("campaignSlug") campaignSlug?: string) {
    return this.servicoConsulta.montarPaginaInicial(campaignSlug?.trim() || undefined);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  listarMeus(
    @UsuarioLogado() usuario: UsuarioAutenticado,
    @Query() filtro: ListarMeusPersonagensDto,
  ) {
    return this.servicoConsulta.listarDoUsuario(usuario.usuarioId, {
      nome: filtro.nome,
      minLevel: filtro.minLevel,
      maxLevel: filtro.maxLevel,
      campaignId: filtro.campaignId,
    });
  }
}
