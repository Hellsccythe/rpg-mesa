import { IsString } from "class-validator";

export class AdicionarSkillPersonagemDto {
  @IsString()
  skillName: string;
}
