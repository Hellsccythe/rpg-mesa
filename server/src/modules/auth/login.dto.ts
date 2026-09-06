import { IsString, MinLength } from "class-validator";

export class LoginDto {
  /** username (jogador) ou email real (mestre) */
  @IsString()
  @MinLength(1)
  identificador!: string;

  @IsString()
  @MinLength(1)
  senha!: string;
}
