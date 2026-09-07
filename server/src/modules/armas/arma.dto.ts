import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

/**
 * Nomes em snake_case porque é o que o frontend já envia.
 *
 * Cuidado com a assimetria de categoria (uma) contra classe, tipo e
 * propriedade (listas) — é o mesmo formato das colunas.
 */

export class CriarEquipamentoDto {
  @IsString()
  @MinLength(1, { message: "Campo 'nome' é obrigatório." })
  @MaxLength(255)
  nome!: string;

  @IsOptional() @IsString() @MaxLength(60)
  dano?: string | null;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(999999)
  peso?: number | null;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(9999999999)
  valor?: number | null;

  @IsOptional() @IsInt() @Min(1)
  categoria_equipamento_item?: number | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsInt({ each: true }) @Min(1, { each: true })
  classe_equipamento_item?: number[];

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsInt({ each: true }) @Min(1, { each: true })
  tipo_equipamento_item?: number[];

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsInt({ each: true }) @Min(1, { each: true })
  propriedade_equipamento_item?: number[];

  @IsOptional() @IsString() @MaxLength(500)
  descricao_equipamento?: string | null;

  @IsOptional() @IsString() @MaxLength(300)
  pre_requisitos?: string | null;
}

export class EditarEquipamentoDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(255)
  nome?: string;

  @IsOptional() @IsString() @MaxLength(60)
  dano?: string | null;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(999999)
  peso?: number | null;

  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(9999999999)
  valor?: number | null;

  @IsOptional() @IsInt() @Min(1)
  categoria_equipamento_item?: number | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsInt({ each: true }) @Min(1, { each: true })
  classe_equipamento_item?: number[];

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsInt({ each: true }) @Min(1, { each: true })
  tipo_equipamento_item?: number[];

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsInt({ each: true }) @Min(1, { each: true })
  propriedade_equipamento_item?: number[];

  @IsOptional() @IsString() @MaxLength(500)
  descricao_equipamento?: string | null;

  @IsOptional() @IsString() @MaxLength(300)
  pre_requisitos?: string | null;
}

// ── Tabelas de apoio ────────────────────────────────────────────────────────

export class CriarCategoriaEquipamentoDto {
  @IsString() @MinLength(1, { message: "Campo 'descricao' é obrigatório." }) @MaxLength(100)
  descricao!: string;

  @IsOptional() @IsString() @MaxLength(100)
  icone?: string | null;
}

export class EditarCategoriaEquipamentoDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  descricao?: string;

  @IsOptional() @IsString() @MaxLength(100)
  icone?: string | null;
}

export class CriarClasseEquipamentoDto {
  @IsString() @MinLength(1, { message: "Campo 'descricao' é obrigatório." }) @MaxLength(100)
  descricao!: string;
}

export class EditarClasseEquipamentoDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  descricao?: string;
}

/** Serve para tipo e para propriedade, que têm a mesma forma. */
export class CriarFilhoDeCategoriaDto {
  @IsString() @MinLength(1, { message: "Campo 'descricao' é obrigatório." }) @MaxLength(100)
  descricao!: string;

  @IsInt({ message: "categoria_item é obrigatório." }) @Min(1)
  categoria_item!: number;
}

export class EditarFilhoDeCategoriaDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  descricao?: string;

  @IsOptional() @IsInt() @Min(1)
  categoria_item?: number;
}

export class FiltroPorCategoriaDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  categoria?: number;
}
