import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CriarGeneroDto {
  @IsString() @MinLength(1) @MaxLength(20)
  codigo!: string;

  @IsString() @MinLength(1) @MaxLength(50)
  descricao!: string;

  @IsOptional() @IsString() @MaxLength(10)
  pronome?: string;
}

export class EditarGeneroDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(20)
  codigo?: string;

  @IsOptional() @IsString() @MinLength(1) @MaxLength(50)
  descricao?: string;

  @IsOptional() @IsString() @MaxLength(10)
  pronome?: string;
}
