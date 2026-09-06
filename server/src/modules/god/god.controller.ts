import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import sharp from "sharp";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { GodService } from "./god.service.js";
import { EditarGodDto, SalvarGodDto } from "./god.dto.js";

const TAMANHO_MAXIMO_IMAGEM_BYTES = 30 * 1024 * 1024;
const SUBPASTA_IMAGENS = "gods";

@Controller("gods")
export class GodController {
  constructor(
    private readonly servicoDeuses: GodService,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  /**
   * Listagem pública e listagem do mestre devolvem exatamente os mesmos dados.
   * Na versão Supabase elas eram métodos separados porque uma usava o client
   * anônimo (sujeito a RLS) e a outra o client admin; sem RLS a distinção
   * deixou de existir, mas as duas rotas continuam para não quebrar o frontend.
   */
  @Get()
  listarPublico() {
    return this.servicoDeuses.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin")
  listarParaMestre() {
    return this.servicoDeuses.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  salvar(@Body() dadosCriacao: SalvarGodDto) {
    return this.servicoDeuses.salvar(dadosCriacao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:godId")
  editar(@Param("godId", ParseIntPipe) godId: number, @Body() dadosEdicao: EditarGodDto) {
    return this.servicoDeuses.editar(godId, dadosEdicao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:godId")
  async deletar(@Param("godId", ParseIntPipe) godId: number) {
    await this.servicoDeuses.deletar(godId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/upload-image")
  @UseInterceptors(FileInterceptor("file"))
  async enviarImagem(@UploadedFile() arquivo?: Express.Multer.File) {
    if (!arquivo?.buffer?.length) {
      throw new BadRequestException("Arquivo de imagem invalido");
    }
    if (!arquivo.mimetype?.startsWith("image/")) {
      throw new BadRequestException("Formato invalido. Envie uma imagem");
    }
    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM_BYTES) {
      throw new BadRequestException("Imagem excede o limite de 30MB");
    }

    const imagemComprimida = await sharp(arquivo.buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const caminhoRelativo = await this.armazenamentoArquivos.salvar(
      SUBPASTA_IMAGENS,
      arquivo.originalname || "deus",
      imagemComprimida,
      "png",
    );

    // path é o que deve ser gravado no banco; publicUrl serve para o preview
    // imediato no frontend. O backend aceita qualquer um dos dois de volta.
    return {
      path: caminhoRelativo,
      publicUrl: this.armazenamentoArquivos.montarUrlPublica(caminhoRelativo),
    };
  }
}
