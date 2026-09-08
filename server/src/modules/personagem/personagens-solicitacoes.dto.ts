import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

/**
 * Pedido do jogador para mudar dados que o mestre precisa aprovar. Todo campo
 * é opcional, mas o service exige pelo menos um.
 */
export class SolicitarAlteracaoDto {
  @IsOptional() @IsString() @MaxLength(200)
  name?: string;

  @IsOptional() @IsString() @MaxLength(500)
  avatarUrl?: string;

  @IsOptional() @IsString()
  history?: string;

  @IsOptional() @IsString() @MaxLength(500)
  historyDocumentPath?: string;

  @IsOptional() @IsString() @MaxLength(300)
  historyDocumentName?: string;

  @IsOptional() @IsString() @MaxLength(200)
  historyDocumentMimeType?: string | null;

  @IsOptional() @IsInt() @Min(1)
  indoleId?: number;

  @IsOptional() @IsInt() @Min(1)
  deusId?: number | null;
}

export class RevisarSolicitacaoDto {
  @IsBoolean({ message: "Informe approve como true ou false." })
  approve!: boolean;
}
