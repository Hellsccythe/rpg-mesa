import { IsString, IsOptional, MaxLength, IsInt, Min, IsNumber, IsArray } from "class-validator";

export class AdicionarSkillPersonagemDto {
  @IsString()
  skillName: string;
}

export class CriarSkillCatalogoDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsArray()
  raca_vinculada?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  skill_natureza_item?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  skill_tipo_item?: number;

  @IsOptional()
  @IsArray()
  skill_categoria_item?: number[];

  @IsOptional()
  @IsArray()
  skill_tipo_dano_item?: number[];

  @IsOptional()
  @IsArray()
  multiplicador_atributo?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(60)
  damage_base?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  effect_description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  custo?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cooldown?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  range?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  required_class?: string;
}

export class EditarSkillCatalogoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsArray()
  raca_vinculada?: string[] | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  skill_natureza_item?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  skill_tipo_item?: number | null;

  @IsOptional()
  @IsArray()
  skill_categoria_item?: number[] | null;

  @IsOptional()
  @IsArray()
  skill_tipo_dano_item?: number[] | null;

  @IsOptional()
  @IsArray()
  multiplicador_atributo?: string[] | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  damage_base?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  effect_description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  custo?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  cooldown?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  range?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  required_class?: string | null;
}

export class CriarSkillOverrideDto {
  @IsString()
  skill_name: string;

  @IsInt()
  @Min(1)
  character_id: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  damage_base_override?: string | null;

  @IsOptional()
  @IsArray()
  multiplicador_override?: string[] | null;
}

export class EditarSkillOverrideDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  damage_base_override?: string | null;

  @IsOptional()
  @IsArray()
  multiplicador_override?: string[] | null;
}

export class CriarSkillNivelDto {
  @IsInt()
  @Min(1)
  skill_id: number;

  @IsInt()
  @Min(2)
  nivel: number;

  // Nível 2
  @IsOptional()
  @IsInt()
  @Min(1)
  damage_multiplier_pct?: number | null;

  // Nível 3
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nome_override?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  damage_base_override?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  multiplicador_override?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  effect_description_override?: string | null;
}

export class EditarSkillNivelDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  damage_multiplier_pct?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nome_override?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  damage_base_override?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  multiplicador_override?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  effect_description_override?: string | null;
}
