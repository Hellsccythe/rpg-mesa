import { IsArray, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

// ── Equipamento ───────────────────────────────────────────────────────────────

export class CriarArmaDto {
  @IsString()
  @MaxLength(255)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  dano?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  classe_equipamento_item?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tipo_equipamento_item?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categoria_equipamento_item?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  propriedade_equipamento_item?: number[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao_equipamento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  pre_requisitos?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999.99)
  peso?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999999.99)
  valor?: number;
}

export class EditarArmaDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  dano?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  classe_equipamento_item?: number | null;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tipo_equipamento_item?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categoria_equipamento_item?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  propriedade_equipamento_item?: number[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao_equipamento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  pre_requisitos?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999.99)
  peso?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999999.99)
  valor?: number;
}

// ── Classe ────────────────────────────────────────────────────────────────────

export class CriarClasseDto {
  @IsString()
  @MaxLength(100)
  descricao: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  icone?: string;
}

export class EditarClasseDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  icone?: string | null;
}

// ── Tipo ──────────────────────────────────────────────────────────────────────

export class CriarTipoDto {
  @IsString()
  @MaxLength(100)
  descricao: string;

  @IsInt()
  @Min(1)
  classe_item: number;
}

export class EditarTipoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  classe_item?: number;
}

// ── Propriedade ───────────────────────────────────────────────────────────────

export class CriarPropriedadeDto {
  @IsString()
  @MaxLength(100)
  descricao: string;

  @IsInt()
  @Min(1)
  classe_item: number;
}

export class EditarPropriedadeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  classe_item?: number;
}

// ── Categoria ─────────────────────────────────────────────────────────────────

export class CriarCategoriaDto {
  @IsString()
  @MaxLength(100)
  descricao: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  classe_item?: number;
}

export class EditarCategoriaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  classe_item?: number | null;
}
