import { IsArray, IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class HabilidadeDto {
  @IsString()
  @MaxLength(100)
  nome: string;

  @IsString()
  @MaxLength(1000)
  descricao: string;
}

export class AtributoBonus {
  @IsString()
  @MaxLength(60)
  atributo: string;

  @IsString()
  @MaxLength(30)
  valor: string;
}

export class CriarRacaDto {
  @IsString()
  @MaxLength(100)
  nome: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  foto_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descricao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  lore?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HabilidadeDto)
  habilidades?: HabilidadeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AtributoBonus)
  atributos_bonus?: AtributoBonus[];
}

export class EditarRacaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nome?: string;

  @IsOptional()
  @IsString()
  foto_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descricao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  lore?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HabilidadeDto)
  habilidades?: HabilidadeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AtributoBonus)
  atributos_bonus?: AtributoBonus[];
}
