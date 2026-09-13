import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes, Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import * as bcrypt from "bcryptjs";
import { montarUrlPublica } from "../../common/storage/armazenamento-arquivos.service.js";
import { UsuarioModel } from "./models/usuario.model.js";
import type { AlterarAtivoDto, EditarUsuarioDto, PreRegistrarDto } from "./usuarios.dto.js";

/**
 * Senha aplicada pelo botão "Reset Padrão" do painel do mestre. É fraca de
 * propósito: serve só para o jogador entrar uma vez e ser obrigado a trocar
 * (requires_password_change), nunca para uso continuado.
 */
export const SENHA_PADRAO = "12345";
const CUSTO_HASH_BCRYPT = 10;

/** Um personagem da conta, com o mundo em que está. */
export type PersonagemDaContaApi = {
  id: number;
  name: string;
  username: string | null;
  raca_id: number | null;
  level: number;
  avatar_url: string | null;
  campaign_id: number | null;
  mundo_numero: number | null;
  mundo_nome: string | null;
};

export type UsuarioApi = {
  id: number;
  real_email: string;
  username: string | null;
  tipo: "gm" | "player";
  ativo: boolean;
  /** Falso enquanto for só um email liberado pelo mestre, sem conta criada. */
  conta_criada: boolean;
  /** Quantos personagens vivos a conta pode ter no mesmo mundo. */
  limite_personagens_por_mundo: number;
  created_at: string;
  updated_at: string;
  /** O primeiro da lista — para as telas que só conhecem um. */
  personagem: PersonagemDaContaApi | null;
  /** Todos os personagens vivos da conta, um por mundo (ou mais, conforme o limite). */
  personagens: PersonagemDaContaApi[];
};

type LinhaUsuario = {
  id: number;
  real_email: string;
  username: string | null;
  tipo: "gm" | "player";
  ativo: boolean;
  conta_criada: boolean;
  limite_personagens_por_mundo: number;
  created_at: string;
  updated_at: string;
  personagens: Array<{
    id: number;
    name: string | null;
    username: string | null;
    raca_id: number | null;
    level: number | null;
    avatar_url: string | null;
    campaign_id: number | null;
    mundo_numero: number | null;
    mundo_nome: string | null;
  }> | null;
};

/**
 * Depois da migration 061, characters.user_id referencia usuarios.id
 * diretamente. Como uma conta pode ter um personagem por mundo (101), a
 * lista vem agregada em JSON num LATERAL — uma linha por conta, sempre.
 */
const SQL_LISTAR_USUARIOS = `
  SELECT
    usuarios.id,
    usuarios.real_email,
    usuarios.username,
    usuarios.tipo,
    usuarios.ativo,
    (usuarios.password_hash IS NOT NULL) AS conta_criada,
    usuarios.limite_personagens_por_mundo,
    usuarios.created_at,
    usuarios.updated_at,
    personagens.lista AS personagens
  FROM usuarios
  -- Uma conta pode ter um personagem por mundo: a lista vem agregada, com o mundo de cada um.
  LEFT JOIN LATERAL (
    SELECT COALESCE(json_agg(json_build_object(
      'id', characters.id,
      'name', characters.name,
      'username', characters.username,
      'raca_id', characters.raca_id,
      'level', characters.level,
      'avatar_url', characters.avatar_url,
      'campaign_id', characters.campaign_id,
      'mundo_numero', campaigns.numero,
      'mundo_nome', campaigns.name
    ) ORDER BY campaigns.numero, characters.created_at), '[]'::json) AS lista
    FROM characters
    LEFT JOIN campaigns ON campaigns.id = characters.campaign_id
    WHERE characters.user_id = usuarios.id
      AND characters.deleted_at IS NULL
  ) AS personagens ON TRUE
  WHERE usuarios.deleted_at IS NULL
  ORDER BY usuarios.created_at DESC
`;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(UsuarioModel)
    private readonly modeloUsuario: typeof UsuarioModel,
    private readonly sequelize: Sequelize,
  ) {}

  // ── Leitura (SQL cru com JOIN) ────────────────────────────────────────────

  async listar(): Promise<UsuarioApi[]> {
    const linhas = await this.sequelize.query<LinhaUsuario>(SQL_LISTAR_USUARIOS, {
      type: QueryTypes.SELECT,
    });

    return linhas.map((linha) => {
      const personagens = (linha.personagens ?? []).map((personagem) => ({
        id: personagem.id,
        name: personagem.name ?? "",
        username: personagem.username,
        raca_id: personagem.raca_id,
        level: personagem.level ?? 1,
        avatar_url: montarUrlPublica(personagem.avatar_url) || null,
        campaign_id: personagem.campaign_id,
        mundo_numero: personagem.mundo_numero,
        mundo_nome: personagem.mundo_nome,
      }));
      return {
        id: linha.id,
        real_email: linha.real_email,
        username: linha.username,
        tipo: linha.tipo,
        ativo: linha.ativo,
        conta_criada: linha.conta_criada,
        limite_personagens_por_mundo: linha.limite_personagens_por_mundo,
        created_at: linha.created_at,
        updated_at: linha.updated_at,
        // O primeiro continua em `personagem` para as telas que só conhecem um.
        personagem: personagens[0] ?? null,
        personagens,
      };
    });
  }

  // ── Escrita ───────────────────────────────────────────────────────────────

  async editar(id: number, dados: EditarUsuarioDto): Promise<UsuarioApi> {
    const usuario = await this.buscarOuFalhar(id);

    if (dados.tipo !== undefined) usuario.tipo = dados.tipo;
    if (dados.limite_personagens_por_mundo !== undefined) {
      usuario.limitePersonagensPorMundo = dados.limite_personagens_por_mundo;
    }

    const novoUsername = dados.username?.trim().toLowerCase();
    if (novoUsername !== undefined && novoUsername !== usuario.username) {
      await this.garantirUsernameLivre(novoUsername, id);
      usuario.username = novoUsername;

      // O personagem carrega uma cópia do username para exibição.
      await this.sequelize.query(
        `UPDATE characters SET username = :username WHERE user_id = :id AND deleted_at IS NULL`,
        { replacements: { username: novoUsername, id }, type: QueryTypes.UPDATE },
      );
    }

    await usuario.save();

    if (dados.nome_personagem !== undefined) {
      await this.sequelize.query(
        `UPDATE characters SET name = :nome WHERE user_id = :id AND deleted_at IS NULL`,
        { replacements: { nome: dados.nome_personagem.trim(), id }, type: QueryTypes.UPDATE },
      );
    }

    return this.buscarNaListagemOuFalhar(id);
  }

  /** Define uma senha escolhida pelo mestre, sem exigir troca no login. */
  async definirSenha(id: number, senha: string): Promise<void> {
    const usuario = await this.buscarComContaOuFalhar(id);
    usuario.passwordHash = await bcrypt.hash(senha, CUSTO_HASH_BCRYPT);
    usuario.requiresPasswordChange = false;
    await usuario.save();
  }

  /** Volta à senha padrão e obriga a troca no próximo login. */
  async resetarSenhaPadrao(id: number): Promise<void> {
    const usuario = await this.buscarComContaOuFalhar(id);
    usuario.passwordHash = await bcrypt.hash(SENHA_PADRAO, CUSTO_HASH_BCRYPT);
    usuario.requiresPasswordChange = true;
    await usuario.save();
  }

  /**
   * Ativar/desativar substitui o "ban" que era aplicado no Supabase Auth: o
   * login já recusa quem está inativo, então a coluna sozinha basta.
   */
  async alterarAtivo(id: number, dados: AlterarAtivoDto): Promise<void> {
    const usuario = await this.buscarOuFalhar(id);
    if (usuario.tipo === "gm") {
      throw new BadRequestException("Não é permitido desativar contas GM pelo painel.");
    }
    usuario.ativo = dados.ativo;
    await usuario.save();
  }

  async deletar(id: number): Promise<void> {
    const usuario = await this.buscarOuFalhar(id);
    if (usuario.tipo === "gm") {
      throw new BadRequestException("Não é permitido deletar contas GM pelo painel.");
    }

    // O personagem acompanha o usuário. Soft delete nos dois: a exclusão é
    // reversível, e o avatar em disco é preservado pelo mesmo motivo.
    await this.sequelize.query(
      `UPDATE characters
          SET deleted_at = NOW(), deleted_by = :autor
        WHERE user_id = :id AND deleted_at IS NULL`,
      { replacements: { id, autor: usuario.realEmail }, type: QueryTypes.UPDATE },
    );

    await usuario.destroy();
  }

  /**
   * Cria a conta de verdade (com senha) para um email. Se o mestre já tinha
   * pré-registrado esse email, preenche aquele registro em vez de criar outro
   * — é o que dá sentido ao pré-registro. Devolve o id que characters.user_id
   * deve referenciar.
   *
   * Substitui o antigo supabase.auth.admin.createUser: a conta agora nasce
   * aqui, com hash bcrypt, sem depender de serviço externo.
   */
  async criarConta(dados: {
    email: string;
    username: string;
    /** A senha em texto. Informe isto OU senhaComHash, nunca os dois. */
    senha?: string;
    /**
     * Hash bcrypt já pronto. Serve para a aprovação de solicitação de
     * personagem, onde a senha foi escolhida (e hasheada) no momento da
     * submissão e nunca precisa ser recuperada em texto.
     */
    senhaComHash?: string;
    tipo?: "gm" | "player";
  }): Promise<number> {
    const email = dados.email.trim().toLowerCase();
    const username = dados.username.trim().toLowerCase();

    if (!dados.senha && !dados.senhaComHash) {
      throw new BadRequestException("Informe a senha ou o hash da senha.");
    }

    await this.garantirUsernameLivre(username, 0);

    const senhaComHash =
      dados.senhaComHash ?? (await bcrypt.hash(dados.senha!, CUSTO_HASH_BCRYPT));
    const preRegistro = await this.modeloUsuario.findOne({
      where: { realEmail: email, passwordHash: null },
    });

    if (preRegistro) {
      preRegistro.username = username;
      preRegistro.passwordHash = senhaComHash;
      preRegistro.requiresPasswordChange = false;
      if (dados.tipo !== undefined) preRegistro.tipo = dados.tipo;
      await preRegistro.save();
      return preRegistro.id;
    }

    const criado = await this.modeloUsuario.create({
      realEmail: email,
      username,
      passwordHash: senhaComHash,
      tipo: dados.tipo ?? "player",
      ativo: true,
      requiresPasswordChange: false,
    });
    return criado.id;
  }

  /** Libera um email para que o jogador possa criar personagem depois. */
  async preRegistrar(dados: PreRegistrarDto): Promise<void> {
    const email = dados.email.trim().toLowerCase();

    const jaExiste = await this.modeloUsuario.findOne({ where: { realEmail: email } });
    if (jaExiste) {
      throw new BadRequestException("Já existe um registro para este email.");
    }

    await this.modeloUsuario.create({
      realEmail: email,
      tipo: dados.tipo ?? "player",
      ativo: true,
      limitePersonagensPorMundo: dados.limite_personagens_por_mundo ?? 1,
      // Sem senha: é só um email liberado, a conta nasce com o personagem.
      passwordHash: null,
    });
  }

  async removerPreRegistro(id: number): Promise<void> {
    const usuario = await this.buscarOuFalhar(id);
    if (usuario.passwordHash !== null) {
      throw new BadRequestException(
        "Não é possível remover um usuário com conta ativa por esta rota.",
      );
    }
    await usuario.destroy();
  }

  // ── Apoio ─────────────────────────────────────────────────────────────────

  private async buscarOuFalhar(id: number): Promise<UsuarioModel> {
    const usuario = await this.modeloUsuario.findByPk(id);
    if (!usuario) throw new NotFoundException("Usuário não encontrado.");
    return usuario;
  }

  private async buscarComContaOuFalhar(id: number): Promise<UsuarioModel> {
    const usuario = await this.buscarOuFalhar(id);
    if (usuario.passwordHash === null) {
      throw new BadRequestException(
        "Usuário sem conta ativa. Aguardando criação de personagem.",
      );
    }
    return usuario;
  }

  private async garantirUsernameLivre(username: string, idAtual: number): Promise<void> {
    const conflito = await this.modeloUsuario.findOne({
      where: { username, id: { [Op.ne]: idAtual } },
    });
    if (conflito) {
      throw new BadRequestException("Este username já está em uso.");
    }
  }

  private async buscarNaListagemOuFalhar(id: number): Promise<UsuarioApi> {
    const encontrado = (await this.listar()).find((usuario) => usuario.id === id);
    if (!encontrado) throw new NotFoundException("Usuário não encontrado.");
    return encontrado;
  }
}
