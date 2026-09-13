import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import {
  FORMATOS_DA_NOTA,
  VISIBILIDADES_DA_NOTA,
  type FormatoDaNota,
  type VisibilidadeDaNota,
} from "./models/lore-note.model.js";

/** O jogador sempre diz de qual personagem está lendo — é dele que sai o mundo. */
export class FiltroLoreNotesDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  characterId?: number;
}

/** O mestre pode dizer o mundo; sem ele, vale a única campanha ativa. */
export class FiltroLoreNotesMestreDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  campaignId?: number;
}

export class CriarLoreNoteDto {
  @IsOptional() @IsInt() @Min(1)
  campaignId?: number;

  @IsString()
  @MinLength(1, { message: "Título é obrigatório." })
  @MaxLength(200)
  title!: string;

  @IsOptional() @IsString() @MaxLength(300)
  subtitle?: string | null;

  @IsOptional() @IsString()
  content?: string;

  @IsOptional() @IsString() @MaxLength(500)
  pdfUrl?: string | null;

  @IsOptional() @IsInt() @Min(0)
  ordem?: number;

  @IsOptional() @IsIn(VISIBILIDADES_DA_NOTA)
  visibilidade?: VisibilidadeDaNota;

  /** A lista de quem lê quando a visibilidade é 'escolhidos'. Substitui o conjunto inteiro. */
  @IsOptional() @IsArray() @ArrayMaxSize(200) @IsInt({ each: true }) @Min(1, { each: true })
  characterIds?: number[];

  @IsOptional() @IsIn(FORMATOS_DA_NOTA)
  formato?: FormatoDaNota;

  /** Caminhos devolvidos por upload-capa. Nulo apaga. */
  @IsOptional() @IsString() @MaxLength(500)
  capaUrl?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  contracapaUrl?: string | null;
}

export class EditarLoreNoteDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(200)
  title?: string;

  @IsOptional() @IsString() @MaxLength(300)
  subtitle?: string | null;

  @IsOptional() @IsString()
  content?: string;

  @IsOptional() @IsString() @MaxLength(500)
  pdfUrl?: string | null;

  @IsOptional() @IsInt() @Min(0)
  ordem?: number;

  @IsOptional() @IsIn(VISIBILIDADES_DA_NOTA)
  visibilidade?: VisibilidadeDaNota;

  /** Ausente = não mexe na lista; array (mesmo vazio) = substitui o conjunto. */
  @IsOptional() @IsArray() @ArrayMaxSize(200) @IsInt({ each: true }) @Min(1, { each: true })
  characterIds?: number[];

  @IsOptional() @IsIn(FORMATOS_DA_NOTA)
  formato?: FormatoDaNota;

  @IsOptional() @IsString() @MaxLength(500)
  capaUrl?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  contracapaUrl?: string | null;
}
