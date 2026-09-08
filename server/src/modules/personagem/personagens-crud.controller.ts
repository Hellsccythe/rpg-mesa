import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { UsuarioLogado } from "../../common/auth/usuario-logado.decorator.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { PersonagensCrudService } from "./personagens-crud.service.js";
import { EditarPersonagemDto } from "./personagens-crud.dto.js";

const TAMANHO_MAXIMO_AVATAR_BYTES = 5 * 1024 * 1024;
const TAMANHO_MAXIMO_DOCUMENTO_BYTES = 10 * 1024 * 1024;
const SUBPASTA_PERSONAGENS = "personagens";

const EXTENSOES_DE_DOCUMENTO = new Set([".pdf", ".doc", ".docx", ".odt", ".rtf", ".txt"]);

@Controller("personagens")
export class PersonagensCrudController {
  constructor(
    private readonly servicoCrud: PersonagensCrudService,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  /**
   * Avatar e documento de história de um personagem que já existe — é o que
   * o jogador anexa ao pedir alteração. Iam direto para os buckets do
   * Supabase pelo navegador; agora passam por aqui, e a rota confere que o
   * personagem é de quem está enviando.
   *
   * O caminho leva o id do personagem só para essa checagem: os arquivos vão
   * todos para a mesma subpasta.
   */
  @UseGuards(JwtAuthGuard)
  @Post(":characterId/upload-avatar")
  @UseInterceptors(FileInterceptor("file"))
  async enviarAvatar(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @UsuarioLogado() usuario: UsuarioAutenticado,
    @UploadedFile() arquivo?: Express.Multer.File,
  ) {
    await this.servicoCrud.garantirAcesso(personagemId, usuario);

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
      SUBPASTA_PERSONAGENS,
      arquivo.originalname || "avatar",
      imagemComprimida,
      "png",
    );

    return {
      path: caminhoRelativo,
      publicUrl: this.armazenamentoArquivos.montarUrlPublica(caminhoRelativo),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(":characterId/upload-historia")
  @UseInterceptors(FileInterceptor("file"))
  async enviarHistoria(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @UsuarioLogado() usuario: UsuarioAutenticado,
    @UploadedFile() arquivo?: Express.Multer.File,
  ) {
    await this.servicoCrud.garantirAcesso(personagemId, usuario);

    if (!arquivo?.buffer?.length) {
      throw new BadRequestException("Arquivo ausente.");
    }
    if (arquivo.size > TAMANHO_MAXIMO_DOCUMENTO_BYTES) {
      throw new BadRequestException("Documento excede 10 MB.");
    }

    const extensao = extname(arquivo.originalname || "").toLowerCase();
    if (!EXTENSOES_DE_DOCUMENTO.has(extensao)) {
      throw new BadRequestException(
        `Formato não aceito. Envie um dos seguintes: ${[...EXTENSOES_DE_DOCUMENTO].join(", ")}.`,
      );
    }

    const caminhoRelativo = await this.armazenamentoArquivos.salvar(
      SUBPASTA_PERSONAGENS,
      arquivo.originalname,
      arquivo.buffer,
      extensao.replace(".", ""),
    );

    return {
      path: caminhoRelativo,
      name: arquivo.originalname,
      mimeType: arquivo.mimetype || null,
      publicUrl: this.armazenamentoArquivos.montarUrlPublica(caminhoRelativo),
    };
  }

  /** Antes da rota com parâmetro de um segmento só. */
  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:characterId")
  async deletarComoMestre(@Param("characterId", ParseIntPipe) personagemId: number) {
    await this.servicoCrud.deletarComoMestre(personagemId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":characterId")
  editar(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: EditarPersonagemDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoCrud.editar(personagemId, dados, usuario);
  }
}
