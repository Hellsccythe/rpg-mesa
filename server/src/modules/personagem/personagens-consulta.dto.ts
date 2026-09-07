import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

/** Filtros chegam pela query string, então precisam ser convertidos de texto. */
export class ListarMeusPersonagensDto {
  @IsOptional() @IsString()
  nome?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  minLevel?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  maxLevel?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  campaignId?: number;
}
