import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class AlterarStatusDto {
  @IsIn(["vivo", "morto"], { message: "Status inválido. Use 'vivo' ou 'morto'." })
  status!: "vivo" | "morto";
}

/** Texto vazio remove a anotação daquele deus. */
export class InfoAdicionalDeDeusDto {
  @IsOptional() @IsString() @MaxLength(2000)
  text?: string;
}

/** Posição vazia volta ao enquadramento padrão. */
export class PosicaoDeImagemDto {
  @IsOptional() @IsString() @MaxLength(60)
  position?: string;
}

export class FocalPointDto {
  @IsString() @MaxLength(60)
  focalPoint!: string;
}

/** Edição de uma nota já escrita: o texto, e se o jogador a vê. */
export class EditarNotaAventuraDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(5000)
  note?: string;

  /** Oculta some da resposta do jogador, mas o mestre continua vendo. */
  @IsOptional() @IsBoolean()
  oculta?: boolean;
}

export class AdicionarNotaAventuraDto {
  @IsString()
  @MinLength(1, { message: "Nota de aventura é obrigatória." })
  @MaxLength(5000)
  note!: string;
}
