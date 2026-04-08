import { IsOptional, IsString } from "class-validator";

export class SalvarCityMapDto {
  @IsString()
  name: string;

  @IsString()
  mapReference: string;

  @IsOptional()
  @IsString()
  description?: string;
}
