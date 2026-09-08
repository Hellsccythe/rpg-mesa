import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { TABELAS_DE_ITEM, type TabelaDeItem } from "./models/receita.model.js";

export class IngredienteDaReceitaDto {
  @IsIn(TABELAS_DE_ITEM, { message: `ingrediente_tabela deve ser uma de: ${TABELAS_DE_ITEM.join(", ")}.` })
  ingrediente_tabela!: TabelaDeItem;

  @IsInt() @Min(1)
  ingrediente_id!: number;

  @IsInt() @Min(1) @Max(999)
  quantidade!: number;

  @IsOptional() @IsBoolean()
  consumido?: boolean;
}

export class CriarReceitaDto {
  @IsString() @MinLength(1, { message: "Campo 'nome' é obrigatório." }) @MaxLength(255)
  nome!: string;

  @IsOptional() @IsString()
  descricao?: string;

  @IsIn(TABELAS_DE_ITEM, { message: `produto_tabela deve ser uma de: ${TABELAS_DE_ITEM.join(", ")}.` })
  produto_tabela!: TabelaDeItem;

  @IsInt() @Min(1)
  produto_id!: number;

  @IsOptional() @IsInt() @Min(1) @Max(999)
  quantidade_produzida?: number;

  @IsOptional() @IsInt() @Min(1) @Max(100000)
  tempo_minutos?: number;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  dificuldade?: number;

  @IsArray() @ArrayMinSize(1, { message: "A receita precisa de pelo menos um ingrediente." })
  @ValidateNested({ each: true }) @Type(() => IngredienteDaReceitaDto)
  ingredientes!: IngredienteDaReceitaDto[];
}

export class EditarReceitaDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(255)
  nome?: string;

  @IsOptional() @IsString()
  descricao?: string;

  @IsOptional() @IsIn(TABELAS_DE_ITEM)
  produto_tabela?: TabelaDeItem;

  @IsOptional() @IsInt() @Min(1)
  produto_id?: number;

  @IsOptional() @IsInt() @Min(1) @Max(999)
  quantidade_produzida?: number;

  @IsOptional() @IsInt() @Min(1) @Max(100000)
  tempo_minutos?: number;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  dificuldade?: number;

  /** Quando vem, SUBSTITUI o conjunto inteiro de ingredientes. */
  @IsOptional() @IsArray() @ArrayMinSize(1)
  @ValidateNested({ each: true }) @Type(() => IngredienteDaReceitaDto)
  ingredientes?: IngredienteDaReceitaDto[];
}
