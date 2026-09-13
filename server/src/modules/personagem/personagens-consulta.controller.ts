import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
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

  /** Jogador: os dele. Mestre: os do mundo (o do filtro ou o ativo), com a ficha inteira. */
  @UseGuards(JwtAuthGuard)
  @Get()
  listarMeus(
    @UsuarioLogado() usuario: UsuarioAutenticado,
    @Query() filtro: ListarMeusPersonagensDto,
  ) {
    if (usuario.tipo === "gm") {
      return this.servicoConsulta.listarDoMundo(filtro.campaignId ?? undefined);
    }
    return this.servicoConsulta.listarDoUsuario(usuario.usuarioId, {
      nome: filtro.nome,
      minLevel: filtro.minLevel,
      maxLevel: filtro.maxLevel,
      campaignId: filtro.campaignId,
    });
  }

  /**
   * Precisa ficar por último: uma rota com parâmetro casa com qualquer
   * caminho de um segmento, então declarada antes engoliria "pagina".
   *
   * Substitui o par /personagens/:id + /personagens/admin/:id que existia
   * antes. Os dois só eram separados porque a versão Supabase precisava de
   * clientes diferentes (anon x service_role); aqui o tipo do usuário vem no
   * token e o service resolve a permissão sozinho.
   */
  @UseGuards(JwtAuthGuard)
  @Get(":characterId")
  obterPorId(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoConsulta.obterPorId(personagemId, usuario);
  }
}
