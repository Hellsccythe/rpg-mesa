import { IsString, IsOptional, MaxLength, IsInt, Min } from "class-validator";

export class CriarTipoEquipamentoDto {
  @IsString()
  @MaxLength(100)
  descricao: string;
}

export class EditarTipoEquipamentoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;
}

export class CriarCategoriaArmaDto {
  @IsString()
  @MaxLength(100)
  descricao: string;
}

export class EditarCategoriaArmaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;
}

export class CriarCategoriaArmaduraDto {
  @IsString()
  @MaxLength(100)
  descricao: string;
}

export class EditarCategoriaArmaduraDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;
}

export class CriarCategoriaVariadosDto {
  @IsString()
  @MaxLength(100)
  descricao: string;
}

export class EditarCategoriaVariadosDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;
}

export class CriarFilhoArmaDto {
  @IsString()
  @MaxLength(100)
  descricao: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoria_arma_item?: number;
}

export class EditarFilhoArmaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoria_arma_item?: number;
}

export class CriarFilhoArmaduraDto {
  @IsString()
  @MaxLength(100)
  descricao: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoria_armadura_item?: number;
}

export class EditarFilhoArmaduraDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoria_armadura_item?: number;
}

export class CriarFilhoVariadosDto {
  @IsString()
  @MaxLength(100)
  descricao: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoria_variados_item?: number;
}

export class EditarFilhoVariadosDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoria_variados_item?: number;
}
