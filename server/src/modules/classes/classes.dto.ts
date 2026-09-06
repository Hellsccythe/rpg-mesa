import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
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

/**
 * O payload de classe é camelCase (maxLevel, startingSkills) e o de progressão
 * é snake_case (classe_id, xp_necessario). A mistura é o que o frontend já
 * envia hoje; uniformizar exigiria mexer nas telas junto.
 */

export class RequisitosDeClasseDto {
  @IsOptional() @IsInt() @Min(1)
  min_level?: number;

  @IsOptional() @IsArray() @ArrayMaxSize(50)
  required_classes?: (string | number)[];
}

export class SalvarClasseDto {
  @IsString() @MinLength(1, { message: "Campo 'name' é obrigatório." }) @MaxLength(100)
  name!: string;

  @IsString() @MinLength(1, { message: "Campo 'tier' é obrigatório." }) @MaxLength(30)
  tier!: string;

  @IsString() @MinLength(1, { message: "Campo 'description' é obrigatório." })
  description!: string;

  @IsOptional() @IsInt() @Min(1)
  maxLevel?: number;

  @IsOptional() @IsObject()
  statBonuses?: Record<string, unknown> | null;

  @IsOptional() @IsObject() @ValidateNested() @Type(() => RequisitosDeClasseDto)
  requirements?: RequisitosDeClasseDto | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true })
  startingSkills?: string[] | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true })
  passiveSkills?: string[] | null;

  @IsOptional() @IsString() @MaxLength(200)
  signatureSkill?: string | null;

  @IsOptional() @IsInt() @Min(1)
  signatureSkillNivel?: number | null;

  @IsOptional() @IsBoolean()
  requerDeus?: boolean;

  @IsOptional() @IsBoolean()
  isSecret?: boolean;
}

export class EditarClasseDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  name?: string;

  @IsOptional() @IsString() @MinLength(1) @MaxLength(30)
  tier?: string;

  @IsOptional() @IsString() @MinLength(1)
  description?: string;

  @IsOptional() @IsInt() @Min(1)
  maxLevel?: number;

  @IsOptional() @IsObject()
  statBonuses?: Record<string, unknown> | null;

  @IsOptional() @IsObject() @ValidateNested() @Type(() => RequisitosDeClasseDto)
  requirements?: RequisitosDeClasseDto | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true })
  startingSkills?: string[] | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true })
  passiveSkills?: string[] | null;

  @IsOptional() @IsString() @MaxLength(200)
  signatureSkill?: string | null;

  @IsOptional() @IsInt() @Min(1)
  signatureSkillNivel?: number | null;

  @IsOptional() @IsBoolean()
  requerDeus?: boolean;

  @IsOptional() @IsBoolean()
  isSecret?: boolean;
}

// ── Progressão de XP por classe ─────────────────────────────────────────────

export class EntradaProgressaoClasseDto {
  @IsInt() @Min(1)
  classe_id!: number;

  @IsInt({ message: "nivel deve ser inteiro." })
  @Min(1) @Max(20, { message: "nivel deve estar entre 1 e 20." })
  nivel!: number;

  @IsInt() @Min(0)
  xp_necessario!: number;
}

export class CriarProgressaoClasseDto extends EntradaProgressaoClasseDto {}

export class EditarProgressaoClasseDto {
  @IsOptional() @IsInt() @Min(0)
  xp_necessario?: number;
}

export class ProgressaoClasseEmLoteDto {
  @IsArray() @ArrayMaxSize(500)
  @ValidateNested({ each: true }) @Type(() => EntradaProgressaoClasseDto)
  entradas!: EntradaProgressaoClasseDto[];
}

export class FiltroProgressaoClasseDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  classe_id?: number;
}

// ── Classes secretas ────────────────────────────────────────────────────────

export class RevelarClasseSecretaDto {
  @IsInt({ message: "classeId é obrigatório." }) @Min(1)
  classeId!: number;

  @IsInt({ message: "characterId é obrigatório." }) @Min(1)
  characterId!: number;
}

export class FiltroClassesParaPlayerDto {
  @Type(() => Number)
  @IsInt({ message: "characterId inválido." }) @Min(1)
  characterId!: number;
}
