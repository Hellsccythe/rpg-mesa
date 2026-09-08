import { Type } from "class-transformer";
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { MOEDAS, type Moeda } from "./models/passado.model.js";

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

/**
 * Uma rolagem do dinheiro inicial. Os limites são generosos mas existem: sem
 * eles, um `999999d1000000` digitado por engano no painel do mestre viraria
 * uma rolagem que trava o servidor.
 */
export class RolagemDeDinheiroDto {
  @IsInt() @Min(1) @Max(100)
  quantidade!: number;

  @IsInt() @Min(2) @Max(1000)
  faces!: number;

  @IsIn(MOEDAS, { message: `moeda deve ser uma de: ${MOEDAS.join(", ")}.` })
  moeda!: Moeda;
}

export class PericiaInicialDto {
  @IsInt() @Min(1)
  periciaId!: number;

  @IsInt() @Min(1) @Max(5)
  rank!: number;
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

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => RolagemDeDinheiroDto)
  dinheiro_inicial?: RolagemDeDinheiroDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PericiaInicialDto)
  pericias_iniciais?: PericiaInicialDto[];
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

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => RolagemDeDinheiroDto)
  dinheiro_inicial?: RolagemDeDinheiroDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PericiaInicialDto)
  pericias_iniciais?: PericiaInicialDto[];
}
