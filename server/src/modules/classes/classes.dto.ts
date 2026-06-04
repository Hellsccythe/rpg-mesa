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
  requerDeus?: boolean;
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
  requerDeus?: boolean;
}
