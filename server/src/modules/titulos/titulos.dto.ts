import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

/**
 * Mistura de camelCase (skillIds) e snake_case (is_hidden) porque é o que o
 * frontend já envia. Uniformizar exigiria mexer na tela junto.
 */
export class BonusDeAtributoDto {
  @IsOptional() @IsInt() aura?: number;
  @IsOptional() @IsInt() forca?: number;
  @IsOptional() @IsInt() destreza?: number;
  @IsOptional() @IsInt() resistencia?: number;
  @IsOptional() @IsInt() inteligencia?: number;
}

export class SalvarTituloDto {
  @IsString()
  @MinLength(1, { message: "Campo 'name' é obrigatório." })
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(1, { message: "Campo 'tier' é obrigatório." })
  @MaxLength(30)
  tier!: string;

  @IsString()
  @MinLength(1, { message: "Campo 'description' é obrigatório." })
  description!: string;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @ArrayUnique()
  @IsInt({ each: true }) @Min(1, { each: true })
  skillIds?: number[];

  @IsOptional() @IsObject() @ValidateNested() @Type(() => BonusDeAtributoDto)
  bonuses?: BonusDeAtributoDto | null;

  @IsOptional() @IsBoolean()
  is_hidden?: boolean;

  @IsOptional() @IsBoolean()
  linked_hidden_class?: boolean;

  @IsOptional() @IsInt() @Min(1)
  classe_secreta_id?: number | null;
}

export class EditarTituloDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  name?: string;

  @IsOptional() @IsString() @MinLength(1) @MaxLength(30)
  tier?: string;

  @IsOptional() @IsString() @MinLength(1)
  description?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(50) @ArrayUnique()
  @IsInt({ each: true }) @Min(1, { each: true })
  skillIds?: number[];

  @IsOptional() @IsObject() @ValidateNested() @Type(() => BonusDeAtributoDto)
  bonuses?: BonusDeAtributoDto | null;

  @IsOptional() @IsBoolean()
  is_hidden?: boolean;

  @IsOptional() @IsBoolean()
  linked_hidden_class?: boolean;

  @IsOptional() @IsInt() @Min(1)
  classe_secreta_id?: number | null;
}

export class AdicionarTituloPersonagemDto {
  @IsString()
  @MinLength(1, { message: "Nome do título é obrigatório." })
  @MaxLength(100)
  titleName!: string;
}
