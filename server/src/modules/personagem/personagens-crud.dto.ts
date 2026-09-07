import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

/**
 * Edição do personagem pelo dono (ou pelo mestre). `data` é o JSONB inteiro —
 * o dashboard manda o objeto completo a cada mudança de inventário ou nota, e
 * o backend grava como veio.
 */
export class EditarPersonagemDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(200)
  name?: string;

  @IsOptional() @IsInt() @Min(1)
  level?: number;

  @IsOptional() @IsInt() @Min(1)
  campaignId?: number | null;

  @IsOptional() @IsString() @MaxLength(500)
  avatarUrl?: string | null;

  @IsOptional() @IsObject()
  data?: Record<string, unknown>;

  @IsOptional() @IsInt() @Min(1)
  indoleId?: number | null;

  @IsOptional() @IsInt() @Min(1)
  generoId?: number | null;

  @IsOptional() @IsString()
  aparenciaFisica?: string | null;

  @IsOptional() @IsString()
  historiaTexto?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  historiaDocUrl?: string | null;
}
