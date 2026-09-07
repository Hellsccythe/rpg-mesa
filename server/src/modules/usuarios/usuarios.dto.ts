import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, Matches, MinLength } from "class-validator";

const REGRA_USERNAME = /^[a-z0-9_-]{3,20}$/;

export class EditarUsuarioDto {
  @IsOptional()
  @IsString()
  @Matches(REGRA_USERNAME, {
    message: "Username deve ter entre 3 e 20 caracteres (letras, números, _ ou -).",
  })
  username?: string;

  @IsOptional()
  @IsIn(["gm", "player"])
  tipo?: "gm" | "player";

  @IsOptional()
  @IsString()
  @MinLength(2, { message: "Nome do personagem deve ter no mínimo 2 caracteres." })
  nome_personagem?: string;
}

export class DefinirSenhaDto {
  @IsString()
  @MinLength(8, { message: "Senha deve ter no mínimo 8 caracteres." })
  @Matches(/[A-Z]/, { message: "Senha deve conter ao menos uma letra maiúscula." })
  @Matches(/[0-9]/, { message: "Senha deve conter ao menos um número." })
  @Matches(/[^a-zA-Z0-9]/, { message: "Senha deve conter ao menos um caractere especial." })
  senha!: string;
}

export class AlterarAtivoDto {
  @IsBoolean()
  ativo!: boolean;
}

export class PreRegistrarDto {
  @IsEmail({}, { message: "Email inválido." })
  email!: string;

  @IsOptional()
  @IsIn(["gm", "player"])
  tipo?: "gm" | "player";
}
