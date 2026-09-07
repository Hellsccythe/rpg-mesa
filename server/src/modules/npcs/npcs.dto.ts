import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";

export class FiltroNpcsDoPersonagemDto {
  @Type(() => Number)
  @IsInt({ message: "characterId inválido." })
  @Min(1)
  characterId!: number;
}

export class CriarNpcDto {
  @IsString()
  @MinLength(1, { message: "Campo 'nome' é obrigatório." })
  @MaxLength(255)
  nome!: string;

  @IsOptional() @IsInt() @Min(1)
  raca_id?: number | null;

  @IsOptional() @IsString() @MaxLength(5000)
  descricao?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  foto_url?: string | null;
}

export class EditarNpcDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(255)
  nome?: string;

  @IsOptional() @IsInt() @Min(1)
  raca_id?: number | null;

  @IsOptional() @IsString() @MaxLength(5000)
  descricao?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  foto_url?: string | null;
}
