import { IsString } from "class-validator";

export class SalvarTituloDto {
  @IsString()
  name: string;

  @IsString()
  tier: string;

  @IsString()
  description: string;
}

export class AdicionarTituloPersonagemDto {
  @IsString()
  titleName: string;
}
