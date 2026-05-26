import { IsString, IsOptional, MaxLength, IsInt, Min, IsNumber } from "class-validator";

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
  @IsString()
  @MaxLength(100)
  raca_vinculada?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  skill_tipo_item?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  skill_categoria_item?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  skill_tipo_dano_item?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  damage_display?: string;

  @IsOptional()
  @IsNumber()
  damage_base?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  effect_description?: string;

  @IsOptional()
  @IsNumber()
  effect_value?: number;

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
  @IsString()
  @MaxLength(100)
  raca_vinculada?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  skill_tipo_item?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  skill_categoria_item?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  skill_tipo_dano_item?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  damage_display?: string | null;

  @IsOptional()
  @IsNumber()
  damage_base?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  effect_description?: string | null;

  @IsOptional()
  @IsNumber()
  effect_value?: number | null;

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
