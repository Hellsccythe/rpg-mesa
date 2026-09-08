import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CriarRaridadeDto {
  @IsString() @MinLength(1) @MaxLength(100)
  descricao!: string;

  @IsInt() @Min(1) @Max(999)
  ordem!: number;

  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(9999)
  multiplicador_valor!: number;

  /** Nulo é válido: Lendário não tem dificuldade fixa. */
  @IsOptional() @IsInt() @Min(0) @Max(100)
  dificuldade_base?: number | null;

  @IsOptional() @IsString() @MaxLength(300)
  disponibilidade?: string;

  @IsOptional() @IsString() @MaxLength(20)
  cor?: string;
}

export class EditarRaridadeDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  descricao?: string;

  @IsOptional() @IsInt() @Min(1) @Max(999)
  ordem?: number;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(9999)
  multiplicador_valor?: number;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  dificuldade_base?: number | null;

  @IsOptional() @IsString() @MaxLength(300)
  disponibilidade?: string;

  @IsOptional() @IsString() @MaxLength(20)
  cor?: string;
}
