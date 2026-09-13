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
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import sharp from "sharp";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { FiltroDeMundoDto } from "../../common/dto/filtro-de-mundo.dto.js";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { CityMapsService } from "./city-maps.service.js";
import { EditarCityMapDto, SalvarCityMapDto } from "./city-maps.dto.js";

const TAMANHO_MAXIMO_IMAGEM_BYTES = 30 * 1024 * 1024;
const LADO_MAXIMO_PIXELS = 2200;
const SUBPASTA_IMAGENS = "maps";

@Controller("city-maps")
export class CityMapsController {
  constructor(
    private readonly servicoCityMaps: CityMapsService,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  /**
   * A listagem exige apenas estar logado (qualquer jogador vê os mapas da
   * cidade); a versão /admin existe porque o frontend a usa na tela do mestre.
   * Ambas devolvem os mesmos dados.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  listar(@Query() filtro: FiltroDeMundoDto) {
    return this.servicoCityMaps.listar(filtro.characterId);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Get("admin")
  listarParaMestre() {
    return this.servicoCityMaps.listar();
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Post("admin")
  salvar(@Body() dadosCriacao: SalvarCityMapDto) {
    return this.servicoCityMaps.salvar(dadosCriacao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Patch("admin/:cityMapId")
  editar(
    @Param("cityMapId", ParseIntPipe) cityMapId: number,
    @Body() dadosEdicao: EditarCityMapDto,
  ) {
    return this.servicoCityMaps.editar(cityMapId, dadosEdicao);
  }

  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:cityMapId")
  async deletar(@Param("cityMapId", ParseIntPipe) cityMapId: number) {
    await this.servicoCityMaps.deletar(cityMapId);
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

    // Mapas comportam mais pixels que retratos: o jogador dá zoom para achar
    // pontos de interesse, então o lado máximo aqui é maior.
    const imagemProcessada = await sharp(arquivo.buffer, { failOn: "none" })
      .rotate()
      .resize({
        width: LADO_MAXIMO_PIXELS,
        height: LADO_MAXIMO_PIXELS,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const caminhoRelativo = await this.armazenamentoArquivos.salvar(
      SUBPASTA_IMAGENS,
      arquivo.originalname || "mapa",
      imagemProcessada,
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
