import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";

export class EntradaLevelProgressionDto {
  @IsInt() @Min(1) @Max(100)
  level!: number;

  @IsString()
  tier!: string;

  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  multiplier!: number;

  @IsInt() @Min(0)
  xp_required_next!: number;

  @IsInt() @Min(0)
  xp_total_accumulated!: number;
}

export class SalvarLevelProgressionDto {
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => EntradaLevelProgressionDto)
  entradas!: EntradaLevelProgressionDto[];
}

export class FiltroLevelProgressionDto {
  @IsOptional() @IsString()
  tier?: string;
}
