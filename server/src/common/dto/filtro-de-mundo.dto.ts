import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

/**
 * Filtro das leituras públicas de catálogo de mundo (deuses, raças,
 * passados, mapas). Com characterId, o mundo é o do personagem; sem, o do
 * header X-Campanha ou a única campanha ativa — ver
 * CampanhasService.resolverCampanhaDoCatalogo.
 */
export class FiltroDeMundoDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  characterId?: number;
}
