import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import * as bcrypt from "bcryptjs";
import { obterUsuarioAutenticadoDoContexto } from "../../common/cls/contexto-requisicao.js";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { UsuarioModel } from "../usuarios/models/usuario.model.js";
import { UsuariosService } from "../usuarios/usuarios.service.js";
import { SolicitacaoCriacaoModel } from "./models/solicitacao-criacao.model.js";
import type { SubmeterSolicitacaoDto } from "./character-creation.dto.js";

const CUSTO_HASH_BCRYPT = 10;

/** Texto que dispensa os mínimos de tamanho, para poder testar o fluxo. */
const FRASE_DE_BYPASS = "mas a bicicleta e azul";

const MINIMO_LETRAS_APARENCIA = 100;
const MINIMO_LETRAS_HISTORIA = 1000;

/** Formato antigo da senha: "<iv em hex>:<cifra em hex>", do AES-256-CBC. */
const FORMATO_SENHA_LEGADO = /^[0-9a-f]{32}:[0-9a-f]+$/i;

/**
 * O que vai em password_hash numa solicitação de conta existente: a coluna
 * é NOT NULL e nada é transferido na aprovação (a conta já tem senha).
 */
const MARCADOR_CONTA_EXISTENTE = "$conta-existente$";

export type SolicitacaoApi = Record<string, unknown>;

function contarLetras(texto: string): number {
  return texto.replace(/<[^>]*>/g, "").replace(/\s/g, "").length;
}

/**
 * As solicitações já com índole e gênero resolvidos. Antes eram três consultas
 * e dois Maps em memória.
 *
 * password_hash fica de fora de propósito: não há motivo para a tela do mestre
 * receber o hash da senha de ninguém.
 */
const SQL_LISTAR_SOLICITACOES = `
  SELECT
    pedido.id,
    pedido.email,
    pedido.username,
    pedido.nome,
    pedido.avatar_url,
    pedido.indole_id,
    pedido.genero_id,
    pedido.aparencia_fisica,
    pedido.historia_texto,
    pedido.historia_doc_url,
    pedido.status,
    pedido.rejeitado_motivo,
    pedido.revisado_em,
    pedido.revisado_por,
    pedido.campaign_id,
    pedido.usuario_id,
    (pedido.usuario_id IS NOT NULL) AS conta_existente,
    campaigns.numero AS mundo_numero,
    campaigns.name AS mundo_nome,
    pedido.created_at,
    pedido.updated_at,
    CASE WHEN indole.id IS NULL THEN NULL ELSE
      json_build_object('id', indole.id, 'codigo', indole.codigo, 'descricao', indole.descricao)
    END AS indole,
    CASE WHEN genero.id IS NULL THEN NULL ELSE
      json_build_object('id', genero.id, 'codigo', genero.codigo, 'descricao', genero.descricao, 'pronome', genero.pronome)
    END AS genero
  FROM character_creation_requests AS pedido
  LEFT JOIN indole ON indole.id = pedido.indole_id
  LEFT JOIN genero ON genero.id = pedido.genero_id
  LEFT JOIN campaigns ON campaigns.id = pedido.campaign_id
  WHERE pedido.deleted_at IS NULL
  ORDER BY pedido.created_at DESC
`;

@Injectable()
export class CharacterCreationService {
  constructor(
    @InjectModel(SolicitacaoCriacaoModel)
    private readonly modeloSolicitacao: typeof SolicitacaoCriacaoModel,
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    @InjectModel(UsuarioModel)
    private readonly modeloUsuario: typeof UsuarioModel,
    private readonly servicoUsuarios: UsuariosService,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
    private readonly sequelize: Sequelize,
  ) {}

  // ── Submissão (pública) ───────────────────────────────────────────────────

  async submeter(dados: SubmeterSolicitacaoDto): Promise<{ success: boolean; id: number }> {
    const aparencia = dados.aparencia_fisica.trim();
    const historiaTexto = dados.historia_texto?.trim() ?? "";
    const historiaDoc = dados.historia_doc_url?.trim() ?? "";
    this.validarAparenciaEHistoria(aparencia, historiaTexto, historiaDoc);

    if (dados.conta_existente) {
      return this.submeterComContaExistente(dados, aparencia, historiaTexto, historiaDoc);
    }

    const email = (dados.email ?? "").trim().toLowerCase();
    if (!email) {
      throw new BadRequestException("Informe o e-mail liberado pelo mestre.");
    }
    await this.garantirEmailPreAutorizado(email);

    const username = dados.username.trim().toLowerCase();
    if (!/^[a-z0-9_-]{3,20}$/.test(username)) {
      throw new BadRequestException(
        "Usuário deve ter entre 3 e 20 caracteres (letras, números, _ ou -).",
      );
    }
    await this.garantirUsernameLivre(username);

    this.validarSenha(dados.password);

    // bcrypt aqui, e nada de senha recuperável: o hash é transferido para
    // usuarios.password_hash quando o mestre aprovar.
    const senhaComHash = await bcrypt.hash(dados.password, CUSTO_HASH_BCRYPT);

    const criada = await this.modeloSolicitacao.create({
      email,
      username,
      passwordHash: senhaComHash,
      nome: dados.nome.trim(),
      avatarUrl: this.armazenamentoArquivos.normalizarParaArmazenamento(dados.avatar_url ?? null),
      indoleId: dados.indole_id ?? null,
      generoId: dados.genero_id ?? null,
      aparenciaFisica: aparencia,
      historiaTexto: historiaTexto || null,
      historiaDocUrl:
        this.armazenamentoArquivos.normalizarParaArmazenamento(historiaDoc || null),
      status: "pendente",
      campaignId: dados.campaign_id ?? null,
    });

    return { success: true, id: criada.id };
  }

  /**
   * A mesma conta pedindo um personagem em outro mundo (docs/MUNDOS.md). O
   * jogador se identifica com o login e a senha que já tem — sem
   * pré-registro, sem conta nova. O mundo é obrigatório: é nele que se
   * conta a vaga (usuarios.limite_personagens_por_mundo).
   */
  private async submeterComContaExistente(
    dados: SubmeterSolicitacaoDto,
    aparencia: string,
    historiaTexto: string,
    historiaDoc: string,
  ): Promise<{ success: boolean; id: number }> {
    const usuario = await this.autenticarContaExistente(dados.username, dados.password);
    const campanhaId = await this.resolverCampanha(dados.campaign_id);
    await this.garantirVagaNoMundo(usuario, campanhaId);

    const pendente = await this.modeloSolicitacao.findOne({
      where: { usuarioId: usuario.id, campaignId: campanhaId, status: "pendente" },
    });
    if (pendente) {
      throw new ConflictException("Você já tem uma solicitação aguardando o mestre neste mundo.");
    }

    const criada = await this.modeloSolicitacao.create({
      email: usuario.realEmail,
      username: usuario.username,
      passwordHash: MARCADOR_CONTA_EXISTENTE,
      usuarioId: usuario.id,
      nome: dados.nome.trim(),
      avatarUrl: this.armazenamentoArquivos.normalizarParaArmazenamento(dados.avatar_url ?? null),
      indoleId: dados.indole_id ?? null,
      generoId: dados.genero_id ?? null,
      aparenciaFisica: aparencia,
      historiaTexto: historiaTexto || null,
      historiaDocUrl:
        this.armazenamentoArquivos.normalizarParaArmazenamento(historiaDoc || null),
      status: "pendente",
      campaignId: campanhaId,
    });

    return { success: true, id: criada.id };
  }

  // ── Revisão (mestre) ──────────────────────────────────────────────────────

  async listar(): Promise<SolicitacaoApi[]> {
    const linhas = await this.sequelize.query<Record<string, any>>(SQL_LISTAR_SOLICITACOES, {
      type: QueryTypes.SELECT,
    });

    return linhas.map((linha) => ({
      ...linha,
      avatar_url: this.armazenamentoArquivos.montarUrlPublica(linha.avatar_url) || null,
      historia_doc_url: this.armazenamentoArquivos.montarUrlPublica(linha.historia_doc_url) || null,
    }));
  }

  async contarPendentes(): Promise<number> {
    return this.modeloSolicitacao.count({ where: { status: "pendente" } });
  }

  /**
   * Cria a conta e o personagem a partir da solicitação. O hash da senha é
   * transferido como está — a versão anterior decifrava a senha em texto para
   * mandar ao Supabase Auth.
   */
  async aprovar(id: number, campanhaEscolhida?: number): Promise<{ success: boolean }> {
    const solicitacao = await this.buscarPendenteOuFalhar(id);
    const campanhaId = await this.resolverCampanha(campanhaEscolhida ?? solicitacao.campaignId);

    // Só contra personagens: conferir contra as solicitações encontraria esta
    // mesma, que está pendente por definição. Por mundo, desde a 101.
    const jaOcupado = await this.modeloPersonagem.findOne({
      where: { username: solicitacao.username, campaignId: campanhaId },
    });
    if (jaOcupado) {
      throw new ConflictException("Nome de usuário já ocupado por outro personagem neste mundo.");
    }

    let usuarioId: number;
    const contaNova = solicitacao.usuarioId === null;
    if (contaNova) {
      if (FORMATO_SENHA_LEGADO.test(solicitacao.passwordHash)) {
        throw new BadRequestException(
          "Esta solicitação guarda a senha no formato antigo, que não é mais aceito. " +
            "Peça ao jogador para enviar a solicitação novamente.",
        );
      }
      usuarioId = await this.servicoUsuarios.criarConta({
        email: solicitacao.email,
        username: solicitacao.username,
        senhaComHash: solicitacao.passwordHash,
        tipo: "player",
      });
    } else {
      // Conta existente: nada a criar, mas a vaga no mundo pode ter sido ocupada
      // desde a submissão (ou o mestre pode ter escolhido outro mundo).
      const usuario = await this.modeloUsuario.findByPk(solicitacao.usuarioId!);
      if (!usuario || !usuario.ativo) {
        throw new BadRequestException("A conta desta solicitação não existe mais ou está desativada.");
      }
      await this.garantirVagaNoMundo(usuario, campanhaId);
      usuarioId = usuario.id;
    }

    try {
      await this.modeloPersonagem.create({
        userId: usuarioId,
        username: solicitacao.username,
        name: solicitacao.nome.trim(),
        level: 1,
        avatarUrl: solicitacao.avatarUrl,
        indoleId: solicitacao.indoleId,
        generoId: solicitacao.generoId,
        aparenciaFisica: solicitacao.aparenciaFisica,
        historiaTexto: solicitacao.historiaTexto,
        historiaDocUrl: solicitacao.historiaDocUrl,
        status: "vivo",
        campaignId: campanhaId,
        data: {},
      });
    } catch (erro) {
      // Desfaz a conta recém-criada para não deixá-la órfã. Conta existente fica.
      if (contaNova) await this.servicoUsuarios.deletar(usuarioId).catch(() => null);
      throw erro;
    }

    solicitacao.status = "aprovado";
    solicitacao.revisadoEm = new Date();
    solicitacao.revisadoPor = obterUsuarioAutenticadoDoContexto()?.email ?? "master";
    await solicitacao.save();

    return { success: true };
  }

  /**
   * Personagem sem campanha não aparece em /mundo/:slug nenhum — só no
   * /login direto. A escolha do mestre vale mais que a da solicitação, e
   * nenhuma das duas pode ficar em branco.
   */
  private async resolverCampanha(campanhaId: number | null | undefined): Promise<number> {
    if (!campanhaId) {
      throw new BadRequestException("Escolha a campanha em que o personagem entra.");
    }
    const linhas = await this.sequelize.query<{ id: number }>(
      `SELECT id FROM campaigns WHERE id = :id AND deleted_at IS NULL`,
      { replacements: { id: campanhaId }, type: QueryTypes.SELECT },
    );
    if (linhas.length === 0) {
      throw new BadRequestException("Campanha não encontrada.");
    }
    return campanhaId;
  }

  async rejeitar(id: number, motivo?: string): Promise<{ success: boolean }> {
    const solicitacao = await this.buscarPendenteOuFalhar(id);

    solicitacao.status = "rejeitado";
    solicitacao.rejeitadoMotivo = motivo?.trim() || null;
    solicitacao.revisadoEm = new Date();
    solicitacao.revisadoPor = obterUsuarioAutenticadoDoContexto()?.email ?? "master";
    await solicitacao.save();

    return { success: true };
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  private async buscarPendenteOuFalhar(id: number): Promise<SolicitacaoCriacaoModel> {
    const solicitacao = await this.modeloSolicitacao.findByPk(id);
    if (!solicitacao) {
      throw new NotFoundException("Solicitação não encontrada.");
    }
    if (solicitacao.status !== "pendente") {
      throw new ConflictException("Solicitação já foi processada.");
    }
    return solicitacao;
  }

  /**
   * O email precisa ter sido liberado pelo mestre. Pré-registro hoje é um
   * usuário com password_hash nulo (migration 065).
   *
   * A versão anterior procurava por auth_user_id IS NULL — coluna que a
   * migration 061 removeu junto com o Supabase Auth. A consulta quebrava, e
   * com ela toda submissão de solicitação.
   */
  private async garantirEmailPreAutorizado(email: string): Promise<void> {
    const preRegistro = await this.modeloUsuario.findOne({
      where: { realEmail: email, passwordHash: null },
    });

    if (!preRegistro) {
      throw new BadRequestException(
        "Email não autorizado pelo mestre para criação de personagem.",
      );
    }
  }

  /** Login e senha da conta que já existe. Erro genérico de propósito: não revela se o username existe. */
  private async autenticarContaExistente(username: string, senha: string): Promise<UsuarioModel> {
    const usuario = await this.modeloUsuario.findOne({
      where: { username: username.trim().toLowerCase(), tipo: "player" },
    });
    const confere = usuario?.passwordHash ? await bcrypt.compare(senha, usuario.passwordHash) : false;
    if (!usuario || !confere) {
      throw new BadRequestException("Usuário ou senha inválidos.");
    }
    if (!usuario.ativo) {
      throw new BadRequestException("Esta conta está desativada.");
    }
    return usuario;
  }

  /**
   * A conta ainda cabe mais um personagem vivo neste mundo? O limite é o
   * que o mestre definiu no pré-registro (padrão 1).
   */
  private async garantirVagaNoMundo(usuario: UsuarioModel, campanhaId: number): Promise<void> {
    const vivos = await this.modeloPersonagem.count({
      where: { userId: usuario.id, campaignId: campanhaId, status: "vivo" },
    });
    if (vivos >= usuario.limitePersonagensPorMundo) {
      throw new ConflictException(
        vivos === 1
          ? "Esta conta já tem um personagem vivo neste mundo."
          : `Esta conta já tem ${vivos} personagens vivos neste mundo — é o limite.`,
      );
    }
  }

  private async garantirUsernameLivre(username: string): Promise<void> {
    const emSolicitacao = await this.modeloSolicitacao.findOne({
      where: { username, status: { [Op.in]: ["pendente", "aprovado"] } },
    });
    if (emSolicitacao) {
      throw new ConflictException("Este nome de usuário já está em uso.");
    }

    // O username é o login: único entre as contas, não só entre os personagens.
    const emConta = await this.modeloUsuario.findOne({ where: { username } });
    if (emConta) {
      throw new ConflictException("Este nome de usuário já está em uso.");
    }

    const emPersonagem = await this.modeloPersonagem.findOne({ where: { username } });
    if (emPersonagem) {
      throw new ConflictException("Este nome de usuário já está em uso.");
    }
  }

  private validarSenha(senha: string): void {
    if (senha.length < 8) {
      throw new BadRequestException("Senha deve ter no mínimo 8 caracteres.");
    }
    if (!/[A-Z]/.test(senha)) {
      throw new BadRequestException("Senha deve conter ao menos uma letra maiúscula.");
    }
    if (!/[0-9]/.test(senha)) {
      throw new BadRequestException("Senha deve conter ao menos um número.");
    }
    if (!/[^a-zA-Z0-9]/.test(senha)) {
      throw new BadRequestException("Senha deve conter ao menos um caractere especial.");
    }
  }

  private validarAparenciaEHistoria(
    aparencia: string,
    historiaTexto: string,
    historiaDoc: string,
  ): void {
    const dispensaMinimos =
      aparencia.includes(FRASE_DE_BYPASS) || historiaTexto.includes(FRASE_DE_BYPASS);

    if (!dispensaMinimos && contarLetras(aparencia) < MINIMO_LETRAS_APARENCIA) {
      throw new BadRequestException(
        `Aparência física deve ter no mínimo ${MINIMO_LETRAS_APARENCIA} letras (sem espaços).`,
      );
    }

    if (!historiaTexto && !historiaDoc) {
      throw new BadRequestException("Informe a história do personagem (texto ou arquivo).");
    }

    if (!dispensaMinimos && historiaTexto && contarLetras(historiaTexto) < MINIMO_LETRAS_HISTORIA) {
      throw new BadRequestException(
        `História deve ter no mínimo ${MINIMO_LETRAS_HISTORIA} letras (sem contar espaços e marcação HTML).`,
      );
    }
  }
}
