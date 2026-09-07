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
import { RacaService } from "./raca.service.js";
import { CriarRacaDto, EditarRacaDto } from "./raca.dto.js";

const TAMANHO_MAXIMO_IMAGEM_BYTES = 8 * 1024 * 1024;
const SUBPASTA_IMAGENS = "racas";

@Controller("racas")
export class RacaController {
  constructor(
    private readonly servicoRacas: RacaService,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  @Get()
  listarPublico() {
    return this.servicoRacas.listarPublico();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin")
  listarParaMestre() {
    return this.servicoRacas.listarParaMestre();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  criar(@Body() dados: CriarRacaDto) {
    return this.servicoRacas.criar(dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:racaId")
  editar(@Param("racaId", ParseIntPipe) racaId: number, @Body() dados: EditarRacaDto) {
    return this.servicoRacas.editar(racaId, dados);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:racaId")
  async deletar(@Param("racaId", ParseIntPipe) racaId: number) {
    await this.servicoRacas.deletar(racaId);
    return { success: true };
  }

  /**
   * Antes o navegador subia a foto direto para o bucket "racas" do Supabase.
   * Agora o arquivo passa por aqui: valida, comprime e grava em disco. E ganha
   * autenticação de mestre — subir arquivo era uma operação aberta a qualquer
   * um que tivesse a chave anônima, que vai no bundle do frontend.
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

    const imagemComprimida = await sharp(arquivo.buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const caminhoRelativo = await this.armazenamentoArquivos.salvar(
      SUBPASTA_IMAGENS,
      arquivo.originalname || "raca",
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
