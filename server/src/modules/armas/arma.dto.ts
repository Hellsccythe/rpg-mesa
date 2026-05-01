import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CriarArmaDto {
  @IsString()
  @MaxLength(255)
  nome: string;

  @IsString()
  @MaxLength(100)
  tipo: string;

  /** Notação de dados: "1d8", "2d20+3", "1d6+2", etc. Opcional para equipamentos sem dano. */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  dano?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoria_equipamento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao_equipamento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  pre_requisitos?: string;

  /** Peso em kg com até 2 casas decimais */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999.99)
  peso?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  propriedades?: string;

  /** Valor em moedas com até 2 casas decimais */
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
  @MaxLength(100)
  tipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  dano?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoria_equipamento?: string;

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
  @IsString()
  @MaxLength(500)
  propriedades?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999999.99)
  valor?: number;
}
