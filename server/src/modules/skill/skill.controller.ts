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
import { SkillService } from "./skill.service.js";
import {
  AdicionarSkillPersonagemDto,
  CriarSkillCatalogoDto,
  CriarSkillNivelDto,
  CriarSkillOverrideDto,
  EditarSkillCatalogoDto,
  EditarSkillNivelDto,
  EditarSkillOverrideDto,
  FiltroNiveisDto,
  FiltroOverridesDto,
  SalvarLookupSkillDto,
} from "./skill.dto.js";

/**
 * As quatro tabelas de apoio (naturezas, tipos, categorias, tipos-dano) têm
 * rotas idênticas em forma. No Express isso era uma função que registrava as
 * quatro; aqui os métodos ficam escritos, porque os decorators do Nest são
 * lidos na definição da classe e não podem ser gerados em laço.
 */
@Controller("skills")
export class SkillController {
  constructor(private readonly servicoSkills: SkillService) {}

  // ── Catálogo ──────────────────────────────────────────────────────────────

  @Get("catalogo")
  listarCatalogo() {
    return this.servicoSkills.listarCatalogo();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/catalogo")
  criarNoCatalogo(@Body() dados: CriarSkillCatalogoDto) {
    return this.servicoSkills.criarNoCatalogo(dados);
  }

  /** Antes de PATCH admin/catalogo/:id, por ser o caminho mais específico. */
  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin/catalogo/:id/referencias")
  listarReferencias(@Param("id", ParseIntPipe) id: number) {
    return this.servicoSkills.listarReferencias(id);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/catalogo/:id")
  editarNoCatalogo(@Param("id", ParseIntPipe) id: number, @Body() dados: EditarSkillCatalogoDto) {
    return this.servicoSkills.editarNoCatalogo(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/catalogo/:id")
  async deletarDoCatalogo(@Param("id", ParseIntPipe) id: number) {
    await this.servicoSkills.deletarDoCatalogo(id);
    return { ok: true };
  }

  // ── Overrides por personagem ──────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin/overrides")
  listarOverrides(@Query() filtro: FiltroOverridesDto) {
    return this.servicoSkills.listarOverrides(filtro.character_id);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/overrides")
  criarOverride(@Body() dados: CriarSkillOverrideDto) {
    return this.servicoSkills.criarOverride(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/overrides/:id")
  editarOverride(@Param("id", ParseIntPipe) id: number, @Body() dados: EditarSkillOverrideDto) {
    return this.servicoSkills.editarOverride(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/overrides/:id")
  async deletarOverride(@Param("id", ParseIntPipe) id: number) {
    await this.servicoSkills.deletarOverride(id);
    return { ok: true };
  }

  // ── Níveis de skill ───────────────────────────────────────────────────────

  @Get("niveis")
  listarNiveis(@Query() filtro: FiltroNiveisDto) {
    return this.servicoSkills.listarNiveis(filtro.skill_id);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/niveis")
  criarNivel(@Body() dados: CriarSkillNivelDto) {
    return this.servicoSkills.criarNivel(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/niveis/:id")
  editarNivel(@Param("id", ParseIntPipe) id: number, @Body() dados: EditarSkillNivelDto) {
    return this.servicoSkills.editarNivel(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/niveis/:id")
  async deletarNivel(@Param("id", ParseIntPipe) id: number) {
    await this.servicoSkills.deletarNivel(id);
    return { ok: true };
  }

  // ── Skill concedida a um personagem ───────────────────────────────────────

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/personagens/:characterId")
  adicionarEmPersonagem(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: AdicionarSkillPersonagemDto,
  ) {
    return this.servicoSkills.adicionarEmPersonagem(personagemId, dados);
  }

  // ── Naturezas ─────────────────────────────────────────────────────────────

  @Get("naturezas")
  listarNaturezas() {
    return this.servicoSkills.listarNaturezas();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("naturezas/admin")
  criarNatureza(@Body() dados: SalvarLookupSkillDto) {
    return this.servicoSkills.criarNatureza(dados.descricao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("naturezas/admin/:item")
  editarNatureza(@Param("item", ParseIntPipe) item: number, @Body() dados: SalvarLookupSkillDto) {
    return this.servicoSkills.editarNatureza(item, dados.descricao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("naturezas/admin/:item")
  async deletarNatureza(@Param("item", ParseIntPipe) item: number) {
    await this.servicoSkills.deletarNatureza(item);
    return { ok: true };
  }

  // ── Tipos ─────────────────────────────────────────────────────────────────

  @Get("tipos")
  listarTipos() {
    return this.servicoSkills.listarTipos();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("tipos/admin")
  criarTipo(@Body() dados: SalvarLookupSkillDto) {
    return this.servicoSkills.criarTipo(dados.descricao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("tipos/admin/:item")
  editarTipo(@Param("item", ParseIntPipe) item: number, @Body() dados: SalvarLookupSkillDto) {
    return this.servicoSkills.editarTipo(item, dados.descricao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("tipos/admin/:item")
  async deletarTipo(@Param("item", ParseIntPipe) item: number) {
    await this.servicoSkills.deletarTipo(item);
    return { ok: true };
  }

  // ── Categorias ────────────────────────────────────────────────────────────

  @Get("categorias")
  listarCategorias() {
    return this.servicoSkills.listarCategorias();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("categorias/admin")
  criarCategoria(@Body() dados: SalvarLookupSkillDto) {
    return this.servicoSkills.criarCategoria(dados.descricao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("categorias/admin/:item")
  editarCategoria(@Param("item", ParseIntPipe) item: number, @Body() dados: SalvarLookupSkillDto) {
    return this.servicoSkills.editarCategoria(item, dados.descricao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("categorias/admin/:item")
  async deletarCategoria(@Param("item", ParseIntPipe) item: number) {
    await this.servicoSkills.deletarCategoria(item);
    return { ok: true };
  }

  // ── Tipos de dano ─────────────────────────────────────────────────────────

  @Get("tipos-dano")
  listarTiposDano() {
    return this.servicoSkills.listarTiposDano();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("tipos-dano/admin")
  criarTipoDano(@Body() dados: SalvarLookupSkillDto) {
    return this.servicoSkills.criarTipoDano(dados.descricao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("tipos-dano/admin/:item")
  editarTipoDano(@Param("item", ParseIntPipe) item: number, @Body() dados: SalvarLookupSkillDto) {
    return this.servicoSkills.editarTipoDano(item, dados.descricao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("tipos-dano/admin/:item")
  async deletarTipoDano(@Param("item", ParseIntPipe) item: number) {
    await this.servicoSkills.deletarTipoDano(item);
    return { ok: true };
  }
}
