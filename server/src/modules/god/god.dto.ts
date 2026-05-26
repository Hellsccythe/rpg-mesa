import { IsNumber, IsOptional, IsString } from "class-validator";

export class SalvarGodDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  indole_id?: number | null;

  @IsOptional()
  @IsString()
  indole?: string;

  @IsOptional()
  @IsString()
  dogma?: string;

  @IsOptional()
  @IsString()
  anatema?: string;

  @IsOptional()
  @IsString()
  weapons?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class EditarGodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  indole_id?: number | null;

  @IsOptional()
  @IsString()
  indole?: string;

  @IsOptional()
  @IsString()
  dogma?: string;

  @IsOptional()
  @IsString()
  anatema?: string;

  @IsOptional()
  @IsString()
  weapons?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
