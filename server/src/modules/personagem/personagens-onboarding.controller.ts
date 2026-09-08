import { Body, Controller, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { UsuarioLogado } from "../../common/auth/usuario-logado.decorator.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PersonagensOnboardingService } from "./personagens-onboarding.service.js";
import {
  ConcluirOnboardingDto,
  DefinirAtributosDto,
  EscolherClasseInicialDto,
  EscolherDeusDto,
  EscolherPassadoDto,
  EscolherRacaDto,
  EscolherSkillInicialDto,
} from "./personagens-onboarding.dto.js";

/**
 * Todas as rotas exigem apenas estar autenticado: quem pode mexer em qual
 * personagem é o service que decide (dono ou mestre). Um MasterGuard aqui
 * barraria justamente o jogador, que é quem faz o onboarding.
 */
@UseGuards(JwtAuthGuard)
@Controller("personagens")
export class PersonagensOnboardingController {
  constructor(private readonly servicoOnboarding: PersonagensOnboardingService) {}

  @Patch(":characterId/escolher-raca")
  escolherRaca(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: EscolherRacaDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoOnboarding.escolherRaca(personagemId, dados.raca_id, usuario);
  }

  @Patch(":characterId/escolher-classe")
  escolherClasseInicial(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: EscolherClasseInicialDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoOnboarding.escolherClasseInicial(personagemId, dados.classe_id, usuario);
  }

  @Post(":characterId/escolher-skill-inicial")
  escolherSkillInicial(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: EscolherSkillInicialDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoOnboarding.escolherSkillInicial(personagemId, dados, usuario);
  }

  /**
   * Sem corpo: o que rolar vem do passado do personagem, e o resultado é
   * sorteado no servidor. Nada aqui aceita valor vindo do cliente.
   */
  @Post(":characterId/rolar-dinheiro-inicial")
  rolarDinheiroInicial(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoOnboarding.rolarDinheiroInicial(personagemId, usuario);
  }

  @Patch(":characterId/escolher-passado")
  escolherPassado(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: EscolherPassadoDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoOnboarding.escolherPassado(personagemId, dados.passado_id, usuario);
  }

  @Patch(":characterId/definir-atributos")
  definirAtributos(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: DefinirAtributosDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoOnboarding.definirAtributos(personagemId, dados, usuario);
  }

  @Patch(":characterId/escolher-deus")
  escolherDeus(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: EscolherDeusDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoOnboarding.escolherDeus(personagemId, dados.deus_id ?? null, usuario);
  }

  @Patch(":characterId/concluir-onboarding")
  concluirOnboarding(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: ConcluirOnboardingDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoOnboarding.concluirOnboarding(personagemId, dados, usuario);
  }
}
