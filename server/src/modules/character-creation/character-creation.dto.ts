import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";

/**
 * Campos em snake_case: é o que o frontend já envia.
 *
 * As regras de tamanho de aparência e história ficam no service, não aqui:
 * dependem do "bypass de teste" e da presença ou não do documento anexo.
 */
export class SubmeterSolicitacaoDto {
  /**
   * Verdadeiro quando o jogador já tem conta e quer um personagem em outro
   * mundo: username e password são o login dele, e o email não é lido —
   * a conta já tem o seu. Falso (ou ausente) é a criação de conta nova.
   */
  @IsOptional() @IsBoolean()
  conta_existente?: boolean;

  /** Obrigatório na conta nova (precisa estar pré-registrado); ignorado na existente. */
  @IsOptional()
  @IsEmail({}, { message: "Email inválido." })
  @MaxLength(200)
  email?: string;

  @IsString()
  @MinLength(3, { message: "Usuário deve ter entre 3 e 20 caracteres." })
  @MaxLength(20, { message: "Usuário deve ter entre 3 e 20 caracteres." })
  username!: string;

  @IsString()
  @MinLength(1, { message: "Senha é obrigatória." })
  @MaxLength(200)
  password!: string;

  @IsString()
  @MinLength(1, { message: "Nome do personagem é obrigatório." })
  @MaxLength(200)
  nome!: string;

  @IsOptional() @IsString() @MaxLength(500)
  avatar_url?: string | null;

  @IsOptional() @IsInt() @Min(1)
  indole_id?: number | null;

  @IsOptional() @IsInt() @Min(1)
  genero_id?: number | null;

  @IsString()
  @MinLength(1, { message: "Aparência física é obrigatória." })
  aparencia_fisica!: string;

  @IsOptional() @IsString()
  historia_texto?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  historia_doc_url?: string | null;

  @IsOptional() @IsInt() @Min(1)
  campaign_id?: number | null;
}

/**
 * A campanha em que o personagem nasce. Vem da solicitação quando o jogador
 * se cadastrou por /mundo/:slug; quem entrou pelo /login direto mandou nulo,
 * e a aprovação copiava o nulo para o personagem — que então não aparecia
 * em mundo nenhum. Agora o mestre escolhe ao aprovar.
 */
export class AprovarSolicitacaoDto {
  @IsOptional() @IsInt() @Min(1)
  campaign_id?: number;
}

export class RejeitarSolicitacaoDto {
  @IsOptional() @IsString() @MaxLength(1000)
  motivo?: string;
}
