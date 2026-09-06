import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes, Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import * as bcrypt from "bcryptjs";
import { UsuarioModel } from "./models/usuario.model.js";
import type { AlterarAtivoDto, EditarUsuarioDto, PreRegistrarDto } from "./usuarios.dto.js";

/**
 * Senha aplicada pelo botão "Reset Padrão" do painel do mestre. É fraca de
 * propósito: serve só para o jogador entrar uma vez e ser obrigado a trocar
 * (requires_password_change), nunca para uso continuado.
 */
export const SENHA_PADRAO = "12345";
const CUSTO_HASH_BCRYPT = 10;

export type UsuarioApi = {
  id: number;
  real_email: string;
  username: string | null;
  tipo: "gm" | "player";
  ativo: boolean;
  /** Falso enquanto for só um email liberado pelo mestre, sem conta criada. */
  conta_criada: boolean;
  created_at: string;
  updated_at: string;
  personagem: {
    id: number;
    name: string;
    username: string | null;
    raca_id: number | null;
    level: number;
    avatar_url: string | null;
  } | null;
};

type LinhaUsuario = {
  id: number;
  real_email: string;
  username: string | null;
  tipo: "gm" | "player";
  ativo: boolean;
  conta_criada: boolean;
  created_at: string;
  updated_at: string;
  personagem_id: number | null;
  personagem_name: string | null;
  personagem_username: string | null;
  personagem_raca_id: number | null;
  personagem_level: number | null;
  personagem_avatar_url: string | null;
};

/**
 * Um LEFT JOIN substitui o que a versão anterior fazia em duas etapas:
 * listar os usuários, coletar os ids, buscar os personagens num segundo
 * SELECT e casar os dois com um Map em memória. Depois da migration 061,
 * characters.user_id referencia usuarios.id diretamente, o que torna a
 * junção trivial.
 */
const SQL_LISTAR_USUARIOS = `
  SELECT
    usuarios.id,
    usuarios.real_email,
    usuarios.username,
    usuarios.tipo,
    usuarios.ativo,
    (usuarios.password_hash IS NOT NULL) AS conta_criada,
    usuarios.created_at,
    usuarios.updated_at,
    characters.id AS personagem_id,
    characters.name AS personagem_name,
    characters.username AS personagem_username,
    characters.raca_id AS personagem_raca_id,
    characters.level AS personagem_level,
    characters.avatar_url AS personagem_avatar_url
  FROM usuarios
  LEFT JOIN characters
    ON characters.user_id = usuarios.id
   AND characters.deleted_at IS NULL
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

    return linhas.map((linha) => ({
      id: linha.id,
      real_email: linha.real_email,
      username: linha.username,
      tipo: linha.tipo,
      ativo: linha.ativo,
      conta_criada: linha.conta_criada,
      created_at: linha.created_at,
      updated_at: linha.updated_at,
      personagem:
        linha.personagem_id === null
          ? null
          : {
              id: linha.personagem_id,
              name: linha.personagem_name ?? "",
              username: linha.personagem_username,
              raca_id: linha.personagem_raca_id,
              level: linha.personagem_level ?? 1,
              avatar_url: linha.personagem_avatar_url,
            },
    }));
  }

  // ── Escrita ───────────────────────────────────────────────────────────────

  async editar(id: number, dados: EditarUsuarioDto): Promise<UsuarioApi> {
    const usuario = await this.buscarOuFalhar(id);

    if (dados.tipo !== undefined) usuario.tipo = dados.tipo;

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
    senha: string;
    tipo?: "gm" | "player";
  }): Promise<number> {
    const email = dados.email.trim().toLowerCase();
    const username = dados.username.trim().toLowerCase();

    await this.garantirUsernameLivre(username, 0);

    const senhaComHash = await bcrypt.hash(dados.senha, CUSTO_HASH_BCRYPT);
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
