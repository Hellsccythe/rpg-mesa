import { Type } from "class-transformer";
import {
  IsInt,
  IsNotEmptyObject,
  IsObject,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class EscolherClasseDto {
  @IsString() @MinLength(1, { message: "classId é obrigatório." }) @MaxLength(20)
  classId!: string;

  @IsString() @MinLength(1, { message: "className é obrigatório." }) @MaxLength(100)
  className!: string;

  @IsString() @MinLength(1, { message: "classTier é obrigatório." }) @MaxLength(30)
  classTier!: string;
}

export class LevelarClasseDto {
  @IsString() @MinLength(1, { message: "classId é obrigatório." }) @MaxLength(20)
  classId!: string;
}

export class PontosDeClasseDto {
  @IsInt({ message: "pontos deve ser um número inteiro positivo." })
  @Min(1, { message: "pontos deve ser um número inteiro positivo." })
  @Max(1000)
  pontos!: number;
}

export class SkillPointsDeClasseDto {
  @IsString() @MinLength(1, { message: "classId é obrigatório." }) @MaxLength(20)
  classId!: string;

  @IsInt({ message: "pontos deve ser um número inteiro positivo." })
  @Min(1, { message: "pontos deve ser um número inteiro positivo." })
  @Max(1000)
  pontos!: number;
}

export class AtribuirXpDeClasseDto {
  @IsString() @MinLength(1, { message: "classId é obrigatório." }) @MaxLength(20)
  classId!: string;

  @IsInt({ message: "xp deve ser inteiro >= 1." }) @Min(1) @Max(100000000)
  xp!: number;
}

export class AtribuirXpDto {
  @IsInt({ message: "xp deve ser inteiro >= 1." }) @Min(1) @Max(100000000)
  xp!: number;
}

/**
 * Distribuição de pontos de atributo: { forca: 2, destreza: 1 }. Os nomes
 * aceitos são conferidos no service, junto com o total disponível.
 */
export class DistribuirPontosAtributoDto {
  @IsObject()
  @IsNotEmptyObject({}, { message: "Distribuição não pode ser vazia." })
  @Type(() => Object)
  distribuicao!: Record<string, number>;
}
