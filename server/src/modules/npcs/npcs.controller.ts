import {
  BadRequestException,
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import sharp from "sharp";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { UsuarioLogado } from "../../common/auth/usuario-logado.decorator.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { NpcsService } from "./npcs.service.js";
import { CriarNpcDto, EditarNpcDto, FiltroNpcsDoPersonagemDto } from "./npcs.dto.js";

const TAMANHO_MAXIMO_IMAGEM_BYTES = 8 * 1024 * 1024;
const SUBPASTA_IMAGENS = "npcs";

@Controller("npcs")
export class NpcsController {
  constructor(
    private readonly servicoNpcs: NpcsService,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  /**
   * A rota de upload era aberta: qualquer um podia gravar arquivo no bucket.
   * Agora exige mestre, como as demais telas de catálogo.
   */
  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/upload-image")
  @UseInterceptors(FileInterceptor("file"))
  async enviarImagem(@UploadedFile() arquivo?: Express.Multer.File) {
    if (!arquivo?.buffer?.length) {
      throw new BadRequestException("Arquivo ausente.");
    }
    if (!arquivo.mimetype?.startsWith("image/")) {
      throw new BadRequestException("Envie uma imagem.");
    }
    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM_BYTES) {
      throw new BadRequestException("Imagem excede 8 MB.");
    }

    // PNG sem perdas: a versão anterior recomprimia em JPEG a 85%.
    const imagemComprimida = await sharp(arquivo.buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const caminhoRelativo = await this.armazenamentoArquivos.salvar(
      SUBPASTA_IMAGENS,
      arquivo.originalname || "npc",
      imagemComprimida,
      "png",
    );

    return {
      path: caminhoRelativo,
      publicUrl: this.armazenamentoArquivos.montarUrlPublica(caminhoRelativo),
    };
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin")
  listarParaMestre() {
    return this.servicoNpcs.listarParaMestre();
  }

  @UseGuards(JwtAuthGuard)
  @Get("player")
  listarParaPersonagem(
    @Query() filtro: FiltroNpcsDoPersonagemDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoNpcs.listarParaPersonagem(filtro.characterId, usuario);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dados: CriarNpcDto) {
    return this.servicoNpcs.criar(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin/:id/acessos")
  listarAcessos(@Param("id", ParseIntPipe) npcId: number) {
    return this.servicoNpcs.listarAcessos(npcId);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/:id/acessos/:characterId")
  @HttpCode(204)
  async concederAcesso(
    @Param("id", ParseIntPipe) npcId: number,
    @Param("characterId", ParseIntPipe) personagemId: number,
  ) {
    await this.servicoNpcs.concederAcesso(npcId, personagemId);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id/acessos/:characterId")
  @HttpCode(204)
  async revogarAcesso(
    @Param("id", ParseIntPipe) npcId: number,
    @Param("characterId", ParseIntPipe) personagemId: number,
  ) {
    await this.servicoNpcs.revogarAcesso(npcId, personagemId);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dados: EditarNpcDto) {
    return this.servicoNpcs.editar(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id")
  @HttpCode(204)
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoNpcs.deletar(id);
  }
}
