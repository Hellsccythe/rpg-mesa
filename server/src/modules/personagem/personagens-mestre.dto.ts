import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

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

export class AdicionarNotaAventuraDto {
  @IsString()
  @MinLength(1, { message: "Nota de aventura é obrigatória." })
  @MaxLength(5000)
  note!: string;
}
