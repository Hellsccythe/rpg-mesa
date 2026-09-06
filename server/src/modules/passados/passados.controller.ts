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
import { PassadosService } from "./passados.service.js";
import { CriarPassadoDto, EditarPassadoDto } from "./passados.dto.js";

const TAMANHO_MAXIMO_IMAGEM_BYTES = 8 * 1024 * 1024;
const SUBPASTA_IMAGENS = "passados";

@Controller("passados")
export class PassadosController {
  constructor(
    private readonly servicoPassados: PassadosService,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  @Get()
  listar() {
    return this.servicoPassados.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dadosCriacao: CriarPassadoDto) {
    return this.servicoPassados.criar(dadosCriacao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dadosEdicao: EditarPassadoDto) {
    return this.servicoPassados.editar(id, dadosEdicao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:id")
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoPassados.deletar(id);
    return { success: true };
  }

  /**
   * Antes o navegador enviava direto pro bucket do Supabase. Agora o arquivo
   * passa por aqui: valida, comprime com sharp e grava em disco.
   * Diferente da versão anterior, exige autenticação de mestre — a rota é
   * /admin/ e antes estava aberta a qualquer um.
   */
  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin/upload-image")
  @UseInterceptors(FileInterceptor("file"))
  async enviarImagem(@UploadedFile() arquivo?: Express.Multer.File) {
    if (!arquivo) {
      throw new BadRequestException("Arquivo ausente.");
    }
    if (!arquivo.mimetype.startsWith("image/")) {
      throw new BadRequestException("Envie uma imagem.");
    }
    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM_BYTES) {
      throw new BadRequestException("Imagem excede 8 MB.");
    }

    const imagemComprimida = await sharp(arquivo.buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const caminhoRelativo = await this.armazenamentoArquivos.salvar(
      SUBPASTA_IMAGENS,
      arquivo.originalname,
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
