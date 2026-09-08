import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CriarItemDto {
  @IsString()
  @MinLength(1, { message: "Campo 'nome' é obrigatório." })
  @MaxLength(255)
  nome!: string;

  @IsOptional() @IsString()
  descricao?: string;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  peso?: number | null;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  valor?: number | null;

  @IsOptional() @IsBoolean()
  empilhavel?: boolean;

  @IsOptional() @IsInt() @Min(1)
  raridade_item?: number | null;

  @IsOptional() @IsInt() @Min(1)
  categoria_item?: number | null;
}

export class EditarItemDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(255)
  nome?: string;

  @IsOptional() @IsString()
  descricao?: string;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  peso?: number | null;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  valor?: number | null;

  @IsOptional() @IsBoolean()
  empilhavel?: boolean;

  @IsOptional() @IsInt() @Min(1)
  raridade_item?: number | null;

  @IsOptional() @IsInt() @Min(1)
  categoria_item?: number | null;
}

export class CriarCategoriaItemDto {
  @IsString() @MinLength(1) @MaxLength(100)
  descricao!: string;

  @IsOptional() @IsString() @MaxLength(100)
  icone?: string;
}

export class EditarCategoriaItemDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  descricao?: string;

  @IsOptional() @IsString() @MaxLength(100)
  icone?: string;
}
