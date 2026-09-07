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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import sharp from "sharp";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { CampanhasService } from "./campanhas.service.js";
import { AdicionarGmDto, CriarCampanhaDto, EditarCampanhaDto } from "./campanhas.dto.js";

const TAMANHO_MAXIMO_IMAGEM_BYTES = 8 * 1024 * 1024;
const SUBPASTA_IMAGENS = "campanhas";

/**
 * Ordem dos métodos importa: tudo que começa com "admin" vem antes de
 * ":slug", que casa com qualquer caminho de um segmento.
 */
@Controller("campanhas")
export class CampanhasController {
  constructor(
    private readonly servicoCampanhas: CampanhasService,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  @Get()
  listarAtivas() {
    return this.servicoCampanhas.listarAtivas();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin/listar")
  listarParaMestre() {
    return this.servicoCampanhas.listarParaMestre();
  }

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

    const imagemComprimida = await sharp(arquivo.buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const caminhoRelativo = await this.armazenamentoArquivos.salvar(
      SUBPASTA_IMAGENS,
      arquivo.originalname || "capa",
      imagemComprimida,
      "png",
    );

    return {
      path: caminhoRelativo,
      publicUrl: this.armazenamentoArquivos.montarUrlPublica(caminhoRelativo),
    };
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin/:id/gms")
  listarGms(@Param("id", ParseIntPipe) campanhaId: number) {
    return this.servicoCampanhas.listarGms(campanhaId);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/:id/gms")
  adicionarGm(@Param("id", ParseIntPipe) campanhaId: number, @Body() dados: AdicionarGmDto) {
    return this.servicoCampanhas.adicionarGm(campanhaId, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id/gms/:gmId")
  @HttpCode(204)
  async removerGm(
    @Param("id", ParseIntPipe) campanhaId: number,
    @Param("gmId", ParseIntPipe) gmId: number,
  ) {
    await this.servicoCampanhas.removerGm(campanhaId, gmId);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dados: CriarCampanhaDto) {
    return this.servicoCampanhas.criar(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dados: EditarCampanhaDto) {
    return this.servicoCampanhas.editar(id, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id")
  @HttpCode(204)
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoCampanhas.deletar(id);
  }

  /** Por último: casa com qualquer caminho de um segmento. */
  @Get(":slug")
  buscarPorSlug(@Param("slug") slug: string) {
    return this.servicoCampanhas.buscarPorSlug(slug);
  }
}
