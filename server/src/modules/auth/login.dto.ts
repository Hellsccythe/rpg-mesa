import { IsString, Matches, MinLength } from "class-validator";

export class LoginDto {
  /** username (jogador) ou email real (mestre) */
  @IsString()
  @MinLength(1)
  identificador!: string;

  @IsString()
  @MinLength(1)
  senha!: string;
}

export class TrocarSenhaDto {
  @IsString()
  @MinLength(8, { message: "Senha deve ter no mínimo 8 caracteres." })
  @Matches(/[A-Z]/, { message: "Senha deve conter ao menos uma letra maiúscula." })
  @Matches(/[0-9]/, { message: "Senha deve conter ao menos um número." })
  @Matches(/[^a-zA-Z0-9]/, { message: "Senha deve conter ao menos um caractere especial." })
  novaSenha!: string;
}
