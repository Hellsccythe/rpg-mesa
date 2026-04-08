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
}
