import {
  Body,
  Controller,
  Delete,
  Get,
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
import { LevelProgressionService } from "../level-progression/level-progression.service.js";
import { ClassesService } from "./classes.service.js";
import {
  CriarProgressaoClasseDto,
  EditarClasseDto,
  EditarProgressaoClasseDto,
  FiltroClassesParaPlayerDto,
  FiltroProgressaoClasseDto,
  ProgressaoClasseEmLoteDto,
  RevelarClasseSecretaDto,
  SalvarClasseDto,
} from "./classes.dto.js";

/**
 * Ordem dos métodos importa: os caminhos literais ("progressao", "admin",
 * "secretas") vêm antes de qualquer rota com parâmetro. Hoje não há rota
 * com parâmetro no primeiro nível, mas manter a ordem evita que adicionar
 * uma no futuro engula as literais em silêncio.
 */
@Controller("classes")
export class ClassesController {
  constructor(
    private readonly servicoClasses: ClassesService,
    private readonly servicoLevelProgression: LevelProgressionService,
  ) {}

  @Get()
  listarPublico() {
    return this.servicoClasses.listarPublico();
  }

  /**
   * Progressão do personagem (não da classe). É a mesma tabela servida em
   * /personagens/admin/level-progression, mas aquela é restrita ao mestre e
   * esta a tela de classes do jogador também precisa — por isso delega ao
   * mesmo service em vez de repetir a consulta.
   */
  @UseGuards(JwtAuthGuard)
  @Get("level-progression")
  listarProgressaoDeNivel() {
    return this.servicoLevelProgression.listar();
  }

  // ── Progressão de XP por classe ───────────────────────────────────────────

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("progressao")
  listarProgressaoDeClasse(@Query() filtro: FiltroProgressaoClasseDto) {
    return this.servicoClasses.listarProgressao(filtro.classe_id);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("progressao/admin/bulk")
  salvarProgressaoEmLote(@Body() dados: ProgressaoClasseEmLoteDto) {
    return this.servicoClasses.salvarProgressaoEmLote(dados.entradas);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("progressao/admin")
  criarProgressao(@Body() dados: CriarProgressaoClasseDto) {
    return this.servicoClasses.criarProgressao(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("progressao/admin/:id")
  editarProgressao(
    @Param("id", ParseIntPipe) id: number,
    @Body() dados: EditarProgressaoClasseDto,
  ) {
    return this.servicoClasses.editarProgressao(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("progressao/admin/:id")
  async deletarProgressao(@Param("id", ParseIntPipe) id: number) {
    await this.servicoClasses.deletarProgressao(id);
    return { ok: true };
  }

  // ── Classes secretas ──────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("secretas/admin")
  listarSecretas() {
    return this.servicoClasses.listarSecretasParaMestre();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("secretas/admin/revelar")
  async revelarSecreta(@Body() dados: RevelarClasseSecretaDto) {
    await this.servicoClasses.revelarClasseSecreta(dados.classeId, dados.characterId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("secretas/admin/revogar/:classeId")
  async revogarSecreta(@Param("classeId", ParseIntPipe) classeId: number) {
    await this.servicoClasses.revogarClasseSecreta(classeId);
    return { success: true };
  }

  // ── Catálogo ──────────────────────────────────────────────────────────────

  /**
   * Passa a exigir mestre. Antes era aberta, e é a listagem que inclui as
   * classes secretas — qualquer visitante podia ler o que a mecânica existe
   * para esconder.
   */
  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin")
  listarParaMestre() {
    return this.servicoClasses.listarParaMestre();
  }

  /**
   * Também era aberta, recebendo o characterId por query string: bastava
   * chutar um número para descobrir quais classes secretas cada personagem
   * tinha. Agora exige login e o service confere se o personagem é de quem
   * está pedindo (ou se quem pede é o mestre).
   */
  @UseGuards(JwtAuthGuard)
  @Get("para-player")
  listarParaPersonagem(
    @Query() filtro: FiltroClassesParaPlayerDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoClasses.listarParaPersonagem(filtro.characterId, usuario);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dados: SalvarClasseDto) {
    return this.servicoClasses.criar(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dados: EditarClasseDto) {
    return this.servicoClasses.editar(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id")
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoClasses.deletar(id);
    return { ok: true };
  }
}
