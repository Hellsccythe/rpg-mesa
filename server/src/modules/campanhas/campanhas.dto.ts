import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";

export class CriarCampanhaDto {
  @IsString()
  @MinLength(1, { message: "Campo 'slug' é obrigatório." })
  @MaxLength(120)
  slug!: string;

  @IsString()
  @MinLength(1, { message: "Campo 'name' é obrigatório." })
  @MaxLength(200)
  name!: string;

  /** Sem ele, o próximo número livre. */
  @IsOptional() @IsInt() @Min(1)
  numero?: number;

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

  @IsOptional() @IsInt() @Min(1)
  numero?: number;

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
