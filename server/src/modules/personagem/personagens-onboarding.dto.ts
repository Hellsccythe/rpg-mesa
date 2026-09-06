import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

/**
 * Os campos são snake_case porque é o que o frontend já envia (herdado das
 * colunas do Supabase). Mesma decisão tomada em passados.dto.ts: renomear
 * exigiria mexer nas telas junto, então fica para uma limpeza futura.
 *
 * A validação de formato mora aqui; as regras de jogo (o total de pontos,
 * a etapa já concluída, a capacidade de carga) moram no service, porque
 * dependem do estado do personagem no banco.
 */

export class EscolherRacaDto {
  @IsInt({ message: "raca_id é obrigatório e deve ser um número." })
  @Min(1)
  raca_id!: number;
}

export class EscolherClasseInicialDto {
  @IsInt({ message: "classe_id é obrigatório e deve ser um número." })
  @Min(1)
  classe_id!: number;
}

export class EscolherPassadoDto {
  @IsInt({ message: "passado_id é obrigatório e deve ser um número." })
  @Min(1)
  passado_id!: number;
}

export class EscolherSkillInicialDto {
  @IsString()
  @MinLength(1, { message: "classId é obrigatório." })
  classId!: string;

  @IsString()
  @MinLength(1, { message: "Nome da skill é obrigatório." })
  skillName!: string;
}

export class DefinirAtributosDto {
  @IsInt({ message: "aura deve ser um número inteiro." }) @Min(0) aura!: number;
  @IsInt({ message: "forca deve ser um número inteiro." }) @Min(0) forca!: number;
  @IsInt({ message: "destreza deve ser um número inteiro." }) @Min(0) destreza!: number;
  @IsInt({ message: "resistencia deve ser um número inteiro." }) @Min(0) resistencia!: number;
  @IsInt({ message: "inteligencia deve ser um número inteiro." }) @Min(0) inteligencia!: number;
}

/** deus_id nulo é a forma de pular a etapa — só permitido se a classe deixar. */
export class EscolherDeusDto {
  @IsOptional()
  @IsInt({ message: "deus_id deve ser um número ou nulo." })
  @Min(1)
  deus_id?: number | null;
}

export class EquipamentoInicialDto {
  @IsInt() @Min(1) id!: number;

  @IsString() @MinLength(1)
  nome!: string;

  @IsNumber() @Min(0)
  peso!: number;
}

export class ConcluirOnboardingDto {
  @IsArray({ message: "equipamentos deve ser um array." })
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => EquipamentoInicialDto)
  equipamentos!: EquipamentoInicialDto[];
}
