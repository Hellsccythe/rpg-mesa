import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class SalvarClasseDto {
  @IsString()
  name: string;

  @IsString()
  tier: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxLevel?: number;

  @IsOptional()
  statBonuses?: Record<string, unknown> | null;

  @IsOptional()
  requirements?: { min_level?: number; required_classes?: (string | number)[] } | null;

  @IsOptional()
  startingSkills?: string[] | null;

  @IsOptional()
  passiveSkills?: string[] | null;

  @IsOptional()
  @IsString()
  signatureSkill?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  signatureSkillNivel?: number | null;

  @IsOptional()
  requerDeus?: boolean;
}

export class CriarProgressaoDto {
  @IsNumber()
  @Min(1)
  classe_id: number;

  @IsNumber()
  @Min(1)
  nivel: number;

  @IsNumber()
  @Min(0)
  xp_necessario: number;
}

export class EditarProgressaoDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  xp_necessario?: number;
}

export class EditarClasseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  tier?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxLevel?: number | null;

  @IsOptional()
  statBonuses?: Record<string, unknown> | null;

  @IsOptional()
  requirements?: { min_level?: number; required_classes?: (string | number)[] } | null;

  @IsOptional()
  startingSkills?: string[] | null;

  @IsOptional()
  passiveSkills?: string[] | null;

  @IsOptional()
  @IsString()
  signatureSkill?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  signatureSkillNivel?: number | null;

  @IsOptional()
  requerDeus?: boolean;
}
