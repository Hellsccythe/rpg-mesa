import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsInt, IsString, Min } from "class-validator";

export class FiltroTelasDoPersonagemDto {
  @Type(() => Number)
  @IsInt({ message: "characterId inválido." })
  @Min(1)
  characterId!: number;
}

export class DefinirTelasDto {
  @IsArray({ message: "Campo 'telas' deve ser um array." })
  @ArrayMaxSize(50)
  @IsString({ each: true })
  telas!: string[];
}
