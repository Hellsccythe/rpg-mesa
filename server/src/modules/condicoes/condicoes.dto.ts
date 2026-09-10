import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { CATEGORIAS_CONDICAO, type CategoriaCondicao } from "./models/condicao.model.js";

export class CriarCondicaoDto {
  @IsString() @MinLength(1, { message: "Campo 'nome' é obrigatório." }) @MaxLength(100)
  nome!: string;

  @IsOptional() @IsString()
  descricao?: string;

  @IsOptional() @IsString()
  efeito?: string;

  @IsIn(CATEGORIAS_CONDICAO, { message: `categoria deve ser uma de: ${CATEGORIAS_CONDICAO.join(", ")}.` })
  categoria!: CategoriaCondicao;

  @IsOptional() @IsInt() @Min(1)
  raridade_item?: number | null;

  @IsOptional() @IsString() @MaxLength(60)
  duracao?: string;

  @IsOptional() @IsString() @MaxLength(60)
  janela_de_cura?: string | null;

  @IsOptional() @IsString()
  se_nao_tratada?: string | null;

  @IsOptional() @IsBoolean()
  acumulativa?: boolean;
}

export class EditarCondicaoDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  nome?: string;

  @IsOptional() @IsString()
  descricao?: string;

  @IsOptional() @IsString()
  efeito?: string;

  @IsOptional() @IsIn(CATEGORIAS_CONDICAO)
  categoria?: CategoriaCondicao;

  @IsOptional() @IsInt() @Min(1)
  raridade_item?: number | null;

  @IsOptional() @IsString() @MaxLength(60)
  duracao?: string;

  @IsOptional() @IsString() @MaxLength(60)
  janela_de_cura?: string | null;

  @IsOptional() @IsString()
  se_nao_tratada?: string | null;

  @IsOptional() @IsBoolean()
  acumulativa?: boolean;
}
