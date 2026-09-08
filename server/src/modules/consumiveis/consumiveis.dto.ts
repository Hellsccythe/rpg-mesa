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

export class CriarConsumivelDto {
  @IsString()
  @MinLength(1, { message: "Campo 'nome' é obrigatório." })
  @MaxLength(255)
  nome!: string;

  @IsOptional() @IsString()
  descricao?: string;

  @IsOptional() @IsString()
  efeito?: string;

  @IsOptional() @IsInt() @Min(1) @Max(999)
  usos?: number;

  @IsOptional() @IsString() @MaxLength(60)
  duracao?: string;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  peso?: number | null;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  valor?: number | null;

  @IsOptional() @IsInt() @Min(1)
  raridade_item?: number | null;

  @IsOptional() @IsInt() @Min(1)
  categoria_consumivel_item?: number | null;
}

export class EditarConsumivelDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(255)
  nome?: string;

  @IsOptional() @IsString()
  descricao?: string;

  @IsOptional() @IsString()
  efeito?: string;

  @IsOptional() @IsInt() @Min(1) @Max(999)
  usos?: number;

  @IsOptional() @IsString() @MaxLength(60)
  duracao?: string;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  peso?: number | null;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  valor?: number | null;

  @IsOptional() @IsInt() @Min(1)
  raridade_item?: number | null;

  @IsOptional() @IsInt() @Min(1)
  categoria_consumivel_item?: number | null;
}

export class CriarCategoriaConsumivelDto {
  @IsString() @MinLength(1) @MaxLength(100)
  descricao!: string;

  @IsOptional() @IsString() @MaxLength(100)
  icone?: string;
}

export class EditarCategoriaConsumivelDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  descricao?: string;

  @IsOptional() @IsString() @MaxLength(100)
  icone?: string;
}
