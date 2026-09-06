import { Type } from "class-transformer";
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

/**
 * Os nomes dos campos são snake_case de propósito: é o formato que o frontend
 * já envia hoje (herdado das colunas do Supabase). Mudar isso exigiria alterar
 * o frontend junto, então fica pra uma limpeza futura — aqui só o backend muda.
 */
export class AtributoBonusDto {
  @IsOptional() @IsInt() aura?: number;
  @IsOptional() @IsInt() forca?: number;
  @IsOptional() @IsInt() destreza?: number;
  @IsOptional() @IsInt() resistencia?: number;
  @IsOptional() @IsInt() inteligencia?: number;
}

export class CriarPassadoDto {
  @IsString()
  @MinLength(1, { message: "Campo 'nome' é obrigatório." })
  @MaxLength(100)
  nome!: string;

  @IsOptional() @IsString()
  descricao?: string;

  @IsOptional() @IsString()
  foto_url?: string;

  @IsOptional() @IsArray() @ArrayUnique() @IsInt({ each: true }) @Min(1, { each: true })
  skill_ids?: number[];

  @IsOptional() @IsArray() @ArrayUnique() @IsInt({ each: true }) @Min(1, { each: true })
  titulo_ids?: number[];

  @IsOptional() @IsObject() @ValidateNested() @Type(() => AtributoBonusDto)
  atributo_bonus?: AtributoBonusDto | null;
}

export class EditarPassadoDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  nome?: string;

  @IsOptional() @IsString()
  descricao?: string;

  @IsOptional() @IsString()
  foto_url?: string;

  @IsOptional() @IsArray() @ArrayUnique() @IsInt({ each: true }) @Min(1, { each: true })
  skill_ids?: number[];

  @IsOptional() @IsArray() @ArrayUnique() @IsInt({ each: true }) @Min(1, { each: true })
  titulo_ids?: number[];

  @IsOptional() @IsObject() @ValidateNested() @Type(() => AtributoBonusDto)
  atributo_bonus?: AtributoBonusDto | null;
}
