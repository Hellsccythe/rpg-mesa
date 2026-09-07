import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CriarIndoleDto {
  @IsString() @MinLength(1) @MaxLength(20)
  codigo!: string;

  @IsString() @MinLength(1) @MaxLength(100)
  descricao!: string;
}

export class EditarIndoleDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(20)
  codigo?: string;

  @IsOptional() @IsString() @MinLength(1) @MaxLength(100)
  descricao?: string;
}
