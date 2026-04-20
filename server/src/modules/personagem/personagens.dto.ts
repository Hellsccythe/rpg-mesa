// server/src/modules/personagem/personagens.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsObject,
  IsUrl,
  IsBoolean,
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

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
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

export class SolicitarAlteracaoPersonagemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  history?: string;

  @IsOptional()
  @IsUrl()
  historyDocumentPath?: string;

  @IsOptional()
  @IsString()
  historyDocumentName?: string;

  @IsOptional()
  @IsString()
  historyDocumentMimeType?: string;
}

export class RevisarSolicitacaoDto {
  @IsBoolean()
  approve: boolean;
}

export class SalvarDeusDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class SalvarCidadeMapaDto {
  @IsString()
  name: string;

  @IsString()
  mapReference: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class SalvarClasseMestreDto {
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

export class SalvarTituloMestreDto {
  @IsString()
  name: string;

  @IsString()
  tier: string;

  @IsString()
  description: string;
}

export class AdicionarSkillPersonagemDto {
  @IsString()
  skillName: string;
}

export class AdicionarTituloPersonagemDto {
  @IsString()
  titleName: string;
}

export class AdicionarNotaAventuraDto {
  @IsString()
  note: string;
}

export class EscolherClasseDto {
  @IsString()
  classId: string;

  @IsString()
  className: string;

  @IsString()
  classTier: string;
}

export class EscolherSkillInicialDto {
  @IsString()
  classId: string;

  @IsString()
  skillName: string;
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
