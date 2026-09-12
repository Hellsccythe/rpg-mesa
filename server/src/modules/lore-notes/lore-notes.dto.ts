import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { FORMATOS_DA_NOTA, type FormatoDaNota } from "./models/lore-note.model.js";

export class FiltroLoreNotesDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  characterId?: number;
}

export class CriarLoreNoteDto {
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

  /** Nulo ou ausente = nota global. */
  @IsOptional() @IsInt() @Min(1)
  characterId?: number | null;

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

  @IsOptional() @IsInt() @Min(1)
  characterId?: number | null;

  @IsOptional() @IsIn(FORMATOS_DA_NOTA)
  formato?: FormatoDaNota;

  @IsOptional() @IsString() @MaxLength(500)
  capaUrl?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  contracapaUrl?: string | null;
}
