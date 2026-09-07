import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CriarCampanhaDto {
  @IsString()
  @MinLength(1, { message: "Campo 'slug' é obrigatório." })
  @MaxLength(120)
  slug!: string;

  @IsString()
  @MinLength(1, { message: "Campo 'name' é obrigatório." })
  @MaxLength(200)
  name!: string;

  @IsOptional() @IsString() @MaxLength(2000)
  description?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  cover_image_url?: string | null;

  @IsOptional() @IsBoolean()
  is_active?: boolean;
}

export class EditarCampanhaDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120)
  slug?: string;

  @IsOptional() @IsString() @MinLength(1) @MaxLength(200)
  name?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  description?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  cover_image_url?: string | null;

  @IsOptional() @IsBoolean()
  is_active?: boolean;
}

export class AdicionarGmDto {
  @IsEmail({}, { message: "Informe um email válido." })
  @MaxLength(200)
  email!: string;
}
