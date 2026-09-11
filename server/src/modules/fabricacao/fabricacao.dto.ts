import { IsBoolean, IsInt, IsOptional, Min } from "class-validator";

export class FabricarDto {
  @IsInt() @Min(1)
  receita_id!: number;

  /**
   * Confirma que a ferramenta FIXA da receita (bigorna, tear) está no lugar.
   * A ação não tem como saber onde o personagem está; quem responde é o
   * mestre, ou o jogador sob o olhar dele.
   */
  @IsOptional() @IsBoolean()
  oficina_disponivel?: boolean;
}
