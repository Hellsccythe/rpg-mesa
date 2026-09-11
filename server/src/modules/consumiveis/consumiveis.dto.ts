import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ACOES_SOBRE_CONDICAO, type AcaoSobreCondicao } from "./models/consumivel-condicao.model.js";
import { VIAS_DE_VENENO, type ViaDeVeneno } from "./models/consumivel.model.js";

/** Um vínculo consumível → condição, como chega do formulário. */
export class VinculoDeCondicaoDto {
  @IsInt() @Min(1)
  condicao_id!: number;

  @IsIn(ACOES_SOBRE_CONDICAO as unknown as string[])
  acao!: AcaoSobreCondicao;
}

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

  /** Só veneno. `null` limpa. */
  @IsOptional() @IsIn([...VIAS_DE_VENENO, null])
  via?: ViaDeVeneno | null;

  /** Notação NdN. O regex barra "1d6 + 20%" — o percentual tem campo próprio. */
  @IsOptional() @IsString() @MaxLength(20) @Matches(/^[0-9]+d[0-9]+$/, {
    message: "cura_dado deve ser só o dado, ex: 1d6",
  })
  cura_dado?: string | null;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  cura_percentual?: number | null;

  @IsOptional() @IsString()
  efeito_bemfeito?: string | null;

  /**
   * Ausente significa "não mexa nos vínculos"; array vazio significa "apague
   * todos". A distinção importa: um PATCH que só muda o preço não pode
   * desvincular as condições sem querer.
   */
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => VinculoDeCondicaoDto)
  condicoes?: VinculoDeCondicaoDto[];
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

  /** Só veneno. `null` limpa. */
  @IsOptional() @IsIn([...VIAS_DE_VENENO, null])
  via?: ViaDeVeneno | null;

  /** Notação NdN. O regex barra "1d6 + 20%" — o percentual tem campo próprio. */
  @IsOptional() @IsString() @MaxLength(20) @Matches(/^[0-9]+d[0-9]+$/, {
    message: "cura_dado deve ser só o dado, ex: 1d6",
  })
  cura_dado?: string | null;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  cura_percentual?: number | null;

  @IsOptional() @IsString()
  efeito_bemfeito?: string | null;

  /**
   * Ausente significa "não mexa nos vínculos"; array vazio significa "apague
   * todos". A distinção importa: um PATCH que só muda o preço não pode
   * desvincular as condições sem querer.
   */
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => VinculoDeCondicaoDto)
  condicoes?: VinculoDeCondicaoDto[];
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
