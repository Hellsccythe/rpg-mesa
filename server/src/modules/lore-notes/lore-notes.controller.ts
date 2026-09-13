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
import { extname } from "node:path";
import sharp from "sharp";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { UsuarioLogado } from "../../common/auth/usuario-logado.decorator.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { LoreNotesService } from "./lore-notes.service.js";
import {
  CriarLoreNoteDto,
  EditarLoreNoteDto,
  FiltroLoreNotesDto,
  FiltroLoreNotesMestreDto,
} from "./lore-notes.dto.js";

const TAMANHO_MAXIMO_PDF_BYTES = 20 * 1024 * 1024;
const TAMANHO_MAXIMO_IMAGEM_BYTES = 8 * 1024 * 1024;
const SUBPASTA_LORE = "lore";

@Controller("lore-notes")
export class LoreNotesController {
  constructor(
    private readonly servicoLoreNotes: LoreNotesService,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  /**
   * PDF anexado a uma nota de lore. Ia direto ao bucket do Supabase pelo
   * navegador, sem autenticação nenhuma; agora exige mestre.
   */
  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/upload-pdf")
  @UseInterceptors(FileInterceptor("file"))
  async enviarPdf(@UploadedFile() arquivo?: Express.Multer.File) {
    if (!arquivo?.buffer?.length) {
      throw new BadRequestException("Arquivo ausente.");
    }
    if (arquivo.size > TAMANHO_MAXIMO_PDF_BYTES) {
      throw new BadRequestException("PDF excede 20 MB.");
    }
    if (extname(arquivo.originalname || "").toLowerCase() !== ".pdf") {
      throw new BadRequestException("Envie um arquivo PDF.");
    }

    const caminhoRelativo = await this.armazenamentoArquivos.salvar(
      SUBPASTA_LORE,
      arquivo.originalname,
      arquivo.buffer,
      "pdf",
    );

    return {
      path: caminhoRelativo,
      publicUrl: this.armazenamentoArquivos.montarUrlPublica(caminhoRelativo),
    };
  }

  /**
   * Capa ou contracapa de um livro de lore. Mesmo tratamento das capas de
   * campanha: gira pelo EXIF, limita a 1600px e grava PNG sem perda.
   */
  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/upload-capa")
  @UseInterceptors(FileInterceptor("file"))
  async enviarCapa(@UploadedFile() arquivo?: Express.Multer.File) {
    if (!arquivo?.buffer?.length) {
      throw new BadRequestException("Arquivo ausente.");
    }
    if (!arquivo.mimetype?.startsWith("image/")) {
      throw new BadRequestException("Envie uma imagem.");
    }
    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM_BYTES) {
      throw new BadRequestException("Imagem excede 8 MB.");
    }

    const imagem = await sharp(arquivo.buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const caminhoRelativo = await this.armazenamentoArquivos.salvar(
      SUBPASTA_LORE,
      arquivo.originalname || "capa",
      imagem,
      "png",
    );

    return {
      path: caminhoRelativo,
      publicUrl: this.armazenamentoArquivos.montarUrlPublica(caminhoRelativo),
    };
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin")
  listarParaMestre(@Query() filtro: FiltroLoreNotesMestreDto) {
    return this.servicoLoreNotes.listarParaMestre(filtro.campaignId);
  }

  /** Os personagens de um mundo, para montar a lista de acesso de uma nota nova. */
  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin/personagens-do-mundo")
  listarPersonagensDoMundo(@Query() filtro: FiltroLoreNotesMestreDto) {
    return this.servicoLoreNotes.listarPersonagensDoMundo(filtro.campaignId);
  }

  /** Os personagens do mundo da nota, marcando quem está na lista de acesso. */
  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin/:id/acessos")
  listarAcessos(@Param("id", ParseIntPipe) id: number) {
    return this.servicoLoreNotes.listarAcessos(id);
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
