import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

/** Campos em snake_case: é o formato que o frontend já envia. */

export class CriarSkillCatalogoDto {
  @IsString()
  @MinLength(1, { message: "Campo 'name' é obrigatório." })
  @MaxLength(100)
  name!: string;

  @IsOptional() @IsString() @MaxLength(2000)
  description?: string | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true })
  raca_vinculada?: string[] | null;

  @IsOptional() @IsInt() @Min(1)
  skill_natureza_item?: number | null;

  @IsOptional() @IsInt() @Min(1)
  skill_tipo_item?: number | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsInt({ each: true }) @Min(1, { each: true })
  skill_categoria_item?: number[] | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsInt({ each: true }) @Min(1, { each: true })
  skill_tipo_dano_item?: number[] | null;

  /** text[] — lista plana de expressões, ex: ["2d8 + Destreza"]. */
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true })
  multiplicador_atributo?: string[] | null;

  @IsOptional() @IsString() @MaxLength(60)
  damage_base?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  effect_description?: string | null;

  @IsOptional() @IsInt() @Min(0)
  custo?: number | null;

  @IsOptional() @IsInt() @Min(0)
  cooldown?: number | null;

  @IsOptional() @IsString() @MaxLength(60)
  range?: string | null;

  @IsOptional() @IsString() @MaxLength(100)
  required_class?: string | null;
}

export class EditarSkillCatalogoDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  name?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  description?: string | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true })
  raca_vinculada?: string[] | null;

  @IsOptional() @IsInt() @Min(1)
  skill_natureza_item?: number | null;

  @IsOptional() @IsInt() @Min(1)
  skill_tipo_item?: number | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsInt({ each: true }) @Min(1, { each: true })
  skill_categoria_item?: number[] | null;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsInt({ each: true }) @Min(1, { each: true })
  skill_tipo_dano_item?: number[] | null;

  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true })
  multiplicador_atributo?: string[] | null;

  @IsOptional() @IsString() @MaxLength(60)
  damage_base?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  effect_description?: string | null;

  @IsOptional() @IsInt() @Min(0)
  custo?: number | null;

  @IsOptional() @IsInt() @Min(0)
  cooldown?: number | null;

  @IsOptional() @IsString() @MaxLength(60)
  range?: string | null;

  @IsOptional() @IsString() @MaxLength(100)
  required_class?: string | null;
}

// ── Tabelas de apoio ────────────────────────────────────────────────────────

export class SalvarLookupSkillDto {
  @IsString()
  @MinLength(1, { message: "Campo 'descricao' é obrigatório." })
  @MaxLength(100)
  descricao!: string;
}

// ── Overrides por personagem ────────────────────────────────────────────────

export class FiltroOverridesDto {
  @Type(() => Number)
  @IsInt({ message: "character_id inválido." })
  @Min(1)
  character_id!: number;
}

export class CriarSkillOverrideDto {
  @IsString() @MinLength(1, { message: "Campo 'skill_name' é obrigatório." }) @MaxLength(100)
  skill_name!: string;

  @IsInt({ message: "character_id é obrigatório." }) @Min(1)
  character_id!: number;

  @IsOptional() @IsString() @MaxLength(60)
  damage_base_override?: string | null;

  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true })
  multiplicador_override?: string[] | null;
}

export class EditarSkillOverrideDto {
  @IsOptional() @IsString() @MaxLength(60)
  damage_base_override?: string | null;

  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true })
  multiplicador_override?: string[] | null;
}

// ── Níveis de skill ─────────────────────────────────────────────────────────

export class FiltroNiveisDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  skill_id?: number;
}

export class CriarSkillNivelDto {
  @IsInt({ message: "skill_id é obrigatório." }) @Min(1)
  skill_id!: number;

  /** O CHECK do banco só aceita 2 ou 3. */
  @IsInt() @IsIn([2, 3], { message: "Nível deve ser 2 ou 3." })
  nivel!: number;

  @IsOptional() @IsInt() @Min(0) @Max(10000)
  damage_multiplier_pct?: number | null;

  @IsOptional() @IsString() @MaxLength(200)
  nome_override?: string | null;

  @IsOptional() @IsString() @MaxLength(60)
  damage_base_override?: string | null;

  @IsOptional() @IsString() @MaxLength(100)
  multiplicador_override?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  effect_description_override?: string | null;
}

export class EditarSkillNivelDto {
  @IsOptional() @IsInt() @Min(0) @Max(10000)
  damage_multiplier_pct?: number | null;

  @IsOptional() @IsString() @MaxLength(200)
  nome_override?: string | null;

  @IsOptional() @IsString() @MaxLength(60)
  damage_base_override?: string | null;

  @IsOptional() @IsString() @MaxLength(100)
  multiplicador_override?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  effect_description_override?: string | null;
}

// ── Skill concedida a um personagem ─────────────────────────────────────────

export class AdicionarSkillPersonagemDto {
  @IsString()
  @MinLength(1, { message: "Nome da skill é obrigatório." })
  @MaxLength(100)
  skillName!: string;
}
