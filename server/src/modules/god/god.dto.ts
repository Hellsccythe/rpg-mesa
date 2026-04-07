import { IsOptional, IsString } from "class-validator";

export class SalvarGodDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
