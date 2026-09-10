import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import {
  ATRIBUTOS, BOLSAS, CATEGORIAS_PERICIA, RANK_MAXIMO,
  type Atributo, type BolsaDePericia, type CategoriaPericia,
} from "./models/pericia.model.js";

export class CriarPericiaDto {
  @IsString() @MinLength(1, { message: "Campo 'nome' é obrigatório." }) @MaxLength(100)
  nome!: string;

  @IsOptional() @IsString()
  descricao?: string;

  @IsIn(ATRIBUTOS, { message: `atributo_base deve ser um de: ${ATRIBUTOS.join(", ")}.` })
  atributo_base!: Atributo;

  @IsIn(CATEGORIAS_PERICIA, { message: `categoria deve ser uma de: ${CATEGORIAS_PERICIA.join(", ")}.` })
  categoria!: CategoriaPericia;
}

export class EditarPericiaDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  nome?: string;

  @IsOptional() @IsString()
  descricao?: string;

  @IsOptional() @IsIn(ATRIBUTOS)
  atributo_base?: Atributo;

  @IsOptional() @IsIn(CATEGORIAS_PERICIA)
  categoria?: CategoriaPericia;
}

/** O jogador sobe UM rank de uma vez, pagando o custo daquele rank. */
export class SubirPericiaDto {
  @IsInt() @Min(1)
  pericia_id!: number;
}

export class ConcederPontosPericiaDto {
  @IsInt() @Min(1) @Max(999)
  pontos!: number;

  /** Qual bolsa recebe. Omitido, vai para a mundana (o caso do downtime). */
  @IsOptional() @IsIn(BOLSAS, { message: `bolsa deve ser uma de: ${BOLSAS.join(", ")}.` })
  bolsa?: BolsaDePericia;
}

/** O mestre pode fixar um rank direto, sem passar por pontos. */
export class DefinirRankDto {
  @IsInt() @Min(1)
  pericia_id!: number;

  @IsInt() @Min(0) @Max(RANK_MAXIMO)
  rank!: number;
}
