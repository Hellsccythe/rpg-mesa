// server/src/modules/personagem/personagens.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsObject,
  IsUrl,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export enum IndoleEnum {
  BOM = "bom",
  NEUTRO_BOM = "neutro-bom",
  NEUTRO = "neutro",
  NEUTRO_RUIM = "neutro-ruim",
  RUIM = "ruim",
}

// DTO interno para o campo "data" do personagem
class PersonagemDataDto {
  @IsOptional()
  @IsString()
  appearance?: string;

  @IsOptional()
  @IsString()
  history?: string;

  @IsOptional()
  @IsEnum(IndoleEnum)
  indole?: IndoleEnum;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  // Permite campos dinâmicos (stats, classes, skills, etc.)
  [key: string]: any;
}

// ==================== DTO PARA CRIAR PERSONAGEM ====================
export class SalvarPersonagemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  level?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PersonagemDataDto)
  data?: PersonagemDataDto;
}

// ==================== DTO PARA EDITAR PERSONAGEM ====================
export class EditarPersonagemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  level?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PersonagemDataDto)
  data?: PersonagemDataDto;
}

// ==================== DTO PARA LISTAR / FILTRAR ====================
export class ListarPersonagemDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxLevel?: number;

  @IsOptional()
  campaignId?: string | null;
}
