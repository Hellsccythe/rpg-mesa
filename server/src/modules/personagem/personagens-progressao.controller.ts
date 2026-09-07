import { Body, Controller, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { UsuarioLogado } from "../../common/auth/usuario-logado.decorator.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PersonagensProgressaoService } from "./personagens-progressao.service.js";
import {
  AtribuirXpDeClasseDto,
  AtribuirXpDto,
  DistribuirPontosAtributoDto,
  EscolherClasseDto,
  LevelarClasseDto,
  PontosDeClasseDto,
  SkillPointsDeClasseDto,
} from "./personagens-progressao.dto.js";

/**
 * As rotas sob "admin" são ajustes que só o mestre faz; as demais são ações
 * do próprio jogador sobre o personagem dele (o mestre também pode, para
 * poder ajudar em mesa).
 */
@Controller("personagens")
export class PersonagensProgressaoController {
  constructor(private readonly servicoProgressao: PersonagensProgressaoService) {}

  // ── Ajustes do mestre ─────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/:characterId/class-points")
  adicionarPontosDeClasse(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: PontosDeClasseDto,
  ) {
    return this.servicoProgressao.adicionarPontosDeClasse(personagemId, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/:characterId/skill-points-classe")
  adicionarSkillPointsParaClasse(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: SkillPointsDeClasseDto,
  ) {
    return this.servicoProgressao.adicionarSkillPointsParaClasse(personagemId, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/:characterId/atribuir-pontos-atributo")
  adicionarPontosAtributo(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: PontosDeClasseDto,
  ) {
    return this.servicoProgressao.adicionarPontosAtributo(personagemId, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/:characterId/resetar-pontos-atributo")
  resetarPontosAtributo(@Param("characterId", ParseIntPipe) personagemId: number) {
    return this.servicoProgressao.resetarPontosAtributo(personagemId);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:characterId/atribuir-xp")
  atribuirXpDeClasse(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: AtribuirXpDeClasseDto,
  ) {
    return this.servicoProgressao.atribuirXpDeClasse(personagemId, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:characterId/atribuir-xp-personagem")
  atribuirXpAoPersonagem(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: AtribuirXpDto,
  ) {
    return this.servicoProgressao.atribuirXpAoPersonagem(personagemId, dados);
  }

  // ── Ações do jogador ──────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post(":characterId/escolher-classe")
  escolherClasse(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: EscolherClasseDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoProgressao.escolherClasse(personagemId, dados, usuario);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":characterId/levar-classe")
  levelarClasse(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: LevelarClasseDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoProgressao.levelarClasse(personagemId, dados.classId, usuario);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":characterId/distribuir-pontos-atributo")
  distribuirPontosAtributo(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: DistribuirPontosAtributoDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoProgressao.distribuirPontosAtributo(personagemId, dados, usuario);
  }
}
