import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { extname } from "node:path";
import sharp from "sharp";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { CharacterCreationService } from "./character-creation.service.js";
import { AprovarSolicitacaoDto, RejeitarSolicitacaoDto, SubmeterSolicitacaoDto } from "./character-creation.dto.js";

const TAMANHO_MAXIMO_AVATAR_BYTES = 5 * 1024 * 1024;
const TAMANHO_MAXIMO_DOCUMENTO_BYTES = 10 * 1024 * 1024;
const SUBPASTA_PENDENTES = "pendentes";

/** Tipos aceitos para o documento de história. */
const EXTENSOES_DE_DOCUMENTO = new Set([".pdf", ".doc", ".docx", ".odt", ".rtf", ".txt"]);

@Controller("character-creation-requests")
export class CharacterCreationController {
  constructor(
    private readonly servicoCriacao: CharacterCreationService,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  /**
   * Públicas de propósito: quem ainda não tem conta precisa enviar o avatar e
   * a história antes de submeter o pedido.
   */
  @Post("upload-avatar")
  @UseInterceptors(FileInterceptor("file"))
  async enviarAvatar(@UploadedFile() arquivo?: Express.Multer.File) {
    if (!arquivo?.buffer?.length) {
      throw new BadRequestException("Arquivo ausente.");
    }
    if (!arquivo.mimetype?.startsWith("image/")) {
      throw new BadRequestException("Envie uma imagem.");
    }
    if (arquivo.size > TAMANHO_MAXIMO_AVATAR_BYTES) {
      throw new BadRequestException("Imagem excede 5 MB.");
    }

    const imagemComprimida = await sharp(arquivo.buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const caminhoRelativo = await this.armazenamentoArquivos.salvar(
      SUBPASTA_PENDENTES,
      arquivo.originalname || "avatar",
      imagemComprimida,
      "png",
    );

    return {
      path: caminhoRelativo,
      publicUrl: this.armazenamentoArquivos.montarUrlPublica(caminhoRelativo),
    };
  }

  @Post("upload-historia")
  @UseInterceptors(FileInterceptor("file"))
  async enviarHistoria(@UploadedFile() arquivo?: Express.Multer.File) {
    if (!arquivo?.buffer?.length) {
      throw new BadRequestException("Arquivo ausente.");
    }
    if (arquivo.size > TAMANHO_MAXIMO_DOCUMENTO_BYTES) {
      throw new BadRequestException("Documento excede 10 MB.");
    }

    // A versão anterior aceitava qualquer arquivo e o publicava num bucket
    // aberto; aqui a extensão é conferida antes de gravar.
    const extensao = extname(arquivo.originalname || "").toLowerCase();
    if (!EXTENSOES_DE_DOCUMENTO.has(extensao)) {
      throw new BadRequestException(
        `Formato não aceito. Envie um dos seguintes: ${[...EXTENSOES_DE_DOCUMENTO].join(", ")}.`,
      );
    }

    const caminhoRelativo = await this.armazenamentoArquivos.salvar(
      SUBPASTA_PENDENTES,
      arquivo.originalname,
      arquivo.buffer,
      extensao.replace(".", ""),
    );

    return {
      path: caminhoRelativo,
      publicUrl: this.armazenamentoArquivos.montarUrlPublica(caminhoRelativo),
    };
  }

  @Post()
  submeter(@Body() dados: SubmeterSolicitacaoDto) {
    return this.servicoCriacao.submeter(dados);
  }

  /** Só a contagem: o sino do painel do mestre a consulta a cada carga. */
  @UseGuards(JwtAuthGuard)
  @Get("admin/pendentes/count")
  async contarPendentes() {
    return { count: await this.servicoCriacao.contarPendentes() };
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin")
  listar() {
    return this.servicoCriacao.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id/aprovar")
  aprovar(@Param("id", ParseIntPipe) id: number, @Body() dados: AprovarSolicitacaoDto) {
    return this.servicoCriacao.aprovar(id, dados.campaign_id);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id/rejeitar")
  rejeitar(@Param("id", ParseIntPipe) id: number, @Body() dados: RejeitarSolicitacaoDto) {
    return this.servicoCriacao.rejeitar(id, dados.motivo);
  }
}
