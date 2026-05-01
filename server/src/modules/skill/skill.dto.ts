import { IsString, IsOptional, MaxLength } from "class-validator";

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
  @MaxLength(60)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  raca_vinculada?: string;
}
