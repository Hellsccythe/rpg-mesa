import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";

/**
 * Os nomes em snake_case (foto_url, atributos_bonus) são os que o frontend já
 * envia. Mesma decisão de passados.dto.ts.
 *
 * foto_url não usa @IsUrl: desde a saída do Supabase Storage o que se grava é
 * um caminho relativo ("racas/elfo.png"), não uma URL. A versão anterior tinha
 * @IsUrl aqui, mas nada rodava o validador — o router Express passava req.body
 * direto para o service. Sob o ValidationPipe do Nest a regra passaria a valer
 * de verdade e recusaria toda criação de raça com foto.
 */
export class HabilidadeDeRacaDto {
  @IsString() @MinLength(1) @MaxLength(100)
  nome!: string;

  @IsString() @MaxLength(1000)
  descricao!: string;
}

export class BonusDeAtributoDeRacaDto {
  @IsString() @MinLength(1) @MaxLength(60)
  atributo!: string;

  @IsString() @MaxLength(30)
  valor!: string;
}

export class CriarRacaDto {
  @IsString()
  @MinLength(1, { message: "Campo 'nome' é obrigatório." })
  @MaxLength(100)
  nome!: string;

  @IsOptional() @IsString()
  foto_url?: string | null;

  @IsOptional() @IsString() @MaxLength(2000)
  descricao?: string | null;

  @IsOptional() @IsString() @MaxLength(5000)
  lore?: string | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50)
  @ValidateNested({ each: true }) @Type(() => HabilidadeDeRacaDto)
  habilidades?: HabilidadeDeRacaDto[];

  @IsOptional() @IsArray() @ArrayMaxSize(50)
  @ValidateNested({ each: true }) @Type(() => BonusDeAtributoDeRacaDto)
  atributos_bonus?: BonusDeAtributoDeRacaDto[];
}

export class EditarRacaDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  nome?: string;

  @IsOptional() @IsString()
  foto_url?: string | null;

  @IsOptional() @IsString() @MaxLength(2000)
  descricao?: string | null;

  @IsOptional() @IsString() @MaxLength(5000)
  lore?: string | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50)
  @ValidateNested({ each: true }) @Type(() => HabilidadeDeRacaDto)
  habilidades?: HabilidadeDeRacaDto[];

  @IsOptional() @IsArray() @ArrayMaxSize(50)
  @ValidateNested({ each: true }) @Type(() => BonusDeAtributoDeRacaDto)
  atributos_bonus?: BonusDeAtributoDeRacaDto[];
}
