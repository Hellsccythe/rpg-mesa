import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess, getUserDisplayEmail } from "../../common/helpers/master-access.helper.js";

const USUARIOS_TABLE = "usuarios";
const PERSONAGEM_TABLE = "characters";

export type UsuarioApi = {
  id: number;
  auth_user_id: string | null;
  real_email: string;
  username: string | null;
  tipo: "gm" | "player";
  ativo: boolean;
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

export const usuariosService = {
  async listar(accessToken?: string): Promise<UsuarioApi[]> {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: usuarios, error } = await admin
      .from(USUARIOS_TABLE)
      .select("id, auth_user_id, real_email, username, tipo, ativo, created_at, updated_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const authUserIds = (usuarios ?? [])
      .map((u: any) => u.auth_user_id as string | null)
      .filter((id): id is string => id != null);

    const { data: personagens } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id, name, username, raca_id, level, avatar_url, user_id")
      .in("user_id", authUserIds.length > 0 ? authUserIds : ["_nenhum_"])
      .is("deleted_at", null);

    const personagemPorUserId = new Map<string, any>();
    for (const p of personagens ?? []) {
      personagemPorUserId.set(p.user_id as string, p);
    }

    return (usuarios ?? []).map((u: any) => {
      const p = personagemPorUserId.get(u.auth_user_id as string) ?? null;
      return {
        id: u.id as number,
        auth_user_id: (u.auth_user_id as string | null) ?? null,
        real_email: u.real_email as string,
        username: (u.username as string | null) ?? null,
        tipo: u.tipo as "gm" | "player",
        ativo: u.ativo as boolean,
        created_at: u.created_at as string,
        updated_at: u.updated_at as string,
        personagem: p
          ? {
              id: p.id as number,
              name: p.name as string,
              username: (p.username as string | null) ?? null,
              raca_id: (p.raca_id as number | null) ?? null,
              level: p.level as number,
              avatar_url: (p.avatar_url as string | null) ?? null,
            }
          : null,
      };
    });
  },

  async editar(
    id: number,
    dto: {
      username?: string;
      tipo?: "gm" | "player";
      nome_personagem?: string;
    },
    accessToken?: string,
  ): Promise<UsuarioApi> {
    const masterUser = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: usuario, error: fetchErr } = await admin
      .from(USUARIOS_TABLE)
      .select("id, auth_user_id, username, tipo")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchErr || !usuario) throw new Error("Usuário não encontrado.");

    const usuarioUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (dto.tipo !== undefined) usuarioUpdates.tipo = dto.tipo;

    const novoUsername = dto.username?.trim().toLowerCase();
    if (novoUsername !== undefined && novoUsername !== (usuario as any).username) {
      if (!/^[a-z0-9_-]{3,20}$/.test(novoUsername)) {
        throw new Error("Username deve ter entre 3 e 20 caracteres (letras, números, _ ou -).");
      }
      const { data: conflito } = await admin
        .from(USUARIOS_TABLE)
        .select("id")
        .eq("username", novoUsername)
        .is("deleted_at", null)
        .neq("id", id)
        .maybeSingle();
      if (conflito) throw new Error("Este username já está em uso.");

      usuarioUpdates.username = novoUsername;

      if ((usuario as any).auth_user_id) {
        await admin
          .from(PERSONAGEM_TABLE)
          .update({ username: novoUsername, updated_by: getUserDisplayEmail(masterUser) })
          .eq("user_id", (usuario as any).auth_user_id)
          .is("deleted_at", null);

        await admin.auth.admin.updateUserById((usuario as any).auth_user_id as string, {
          email: `${novoUsername}@rpg.internal`,
          user_metadata: { display_name: novoUsername },
        });
      }
    }

    await admin
      .from(USUARIOS_TABLE)
      .update(usuarioUpdates)
      .eq("id", id)
      .is("deleted_at", null);

    if (dto.nome_personagem !== undefined) {
      const nome = dto.nome_personagem.trim();
      if (nome.length < 2) throw new Error("Nome do personagem deve ter no mínimo 2 caracteres.");
      await admin
        .from(PERSONAGEM_TABLE)
        .update({ name: nome, updated_by: getUserDisplayEmail(masterUser) })
        .eq("user_id", (usuario as any).auth_user_id)
        .is("deleted_at", null);
    }

    const lista = await usuariosService.listar(accessToken);
    const atualizado = lista.find((u) => u.id === id);
    if (!atualizado) throw new Error("Erro ao recarregar usuário após edição.");
    return atualizado;
  },

  async resetarSenhaPadrao(id: number, accessToken?: string): Promise<{ success: boolean }> {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: usuario, error: fetchErr } = await admin
      .from(USUARIOS_TABLE)
      .select("auth_user_id, tipo")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchErr || !usuario) throw new Error("Usuário não encontrado.");
    if (!(usuario as any).auth_user_id) {
      throw new Error("Usuário sem conta ativa. Aguardando criação de personagem.");
    }

    const { error } = await admin.auth.admin.updateUserById(
      (usuario as any).auth_user_id as string,
      {
        password: "123456",
        user_metadata: { requires_password_change: true },
      },
    );
    if (error) {
      const msg = (error as any).message ?? "";
      if (msg.toLowerCase().includes("at least")) throw new Error("Senha padrão inválida. Verifique o requisito mínimo de caracteres no Supabase.");
      throw new Error(msg || "Erro ao resetar senha.");
    }

    return { success: true };
  },

  async resetarSenha(id: number, novaSenha: string, accessToken?: string): Promise<{ success: boolean }> {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    if (novaSenha.length < 8) throw new Error("Senha deve ter no mínimo 8 caracteres.");
    if (!/[A-Z]/.test(novaSenha)) throw new Error("Senha deve conter ao menos uma letra maiúscula.");
    if (!/[0-9]/.test(novaSenha)) throw new Error("Senha deve conter ao menos um número.");
    if (!/[^a-zA-Z0-9]/.test(novaSenha)) throw new Error("Senha deve conter ao menos um caractere especial.");

    const { data: usuario, error: fetchErr } = await admin
      .from(USUARIOS_TABLE)
      .select("auth_user_id")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchErr || !usuario) throw new Error("Usuário não encontrado.");
    if (!(usuario as any).auth_user_id) {
      throw new Error("Usuário sem conta ativa. Aguardando criação de personagem.");
    }

    const { error } = await admin.auth.admin.updateUserById(
      (usuario as any).auth_user_id as string,
      { password: novaSenha },
    );
    if (error) throw error;

    return { success: true };
  },

  async alterarAtivo(id: number, ativo: boolean, accessToken?: string): Promise<{ success: boolean }> {
    const masterUser = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: usuario, error: fetchErr } = await admin
      .from(USUARIOS_TABLE)
      .select("auth_user_id, tipo")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchErr || !usuario) throw new Error("Usuário não encontrado.");
    if ((usuario as any).tipo === "gm") throw new Error("Não é permitido desativar contas GM pelo painel.");
    if (!(usuario as any).auth_user_id) {
      throw new Error("Usuário sem conta ativa. Aguardando criação de personagem.");
    }

    await admin
      .from(USUARIOS_TABLE)
      .update({ ativo, updated_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    if (!ativo) {
      await admin.auth.admin.updateUserById((usuario as any).auth_user_id as string, {
        ban_duration: "876600h",
      });
    } else {
      await admin.auth.admin.updateUserById((usuario as any).auth_user_id as string, {
        ban_duration: "none",
      });
    }

    return { success: true };
  },

  async criar(
    dto: { auth_user_id: string; real_email: string; username: string; tipo?: "gm" | "player" },
  ): Promise<void> {
    const admin = getAdminClient();

    // Preencher slot de pré-registro existente para este email
    const { data: slot } = await admin
      .from(USUARIOS_TABLE)
      .select("id")
      .eq("real_email", dto.real_email)
      .is("auth_user_id", null)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    if (slot) {
      await admin
        .from(USUARIOS_TABLE)
        .update({
          auth_user_id: dto.auth_user_id,
          username: dto.username,
          updated_at: new Date().toISOString(),
        })
        .eq("id", (slot as any).id);
      return;
    }

    // Verificar se já existe pelo auth_user_id
    const { data: existente } = await admin
      .from(USUARIOS_TABLE)
      .select("id")
      .eq("auth_user_id", dto.auth_user_id)
      .is("deleted_at", null)
      .maybeSingle();

    if (existente) return;

    await admin.from(USUARIOS_TABLE).insert({
      auth_user_id: dto.auth_user_id,
      real_email: dto.real_email,
      username: dto.username,
      tipo: dto.tipo ?? "player",
      ativo: true,
    });
  },

  async deletar(id: number, accessToken?: string): Promise<{ success: boolean }> {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: usuario, error: fetchErr } = await admin
      .from(USUARIOS_TABLE)
      .select("auth_user_id, tipo")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchErr || !usuario) throw new Error("Usuário não encontrado.");
    if ((usuario as any).tipo === "gm") throw new Error("Não é permitido deletar contas GM pelo painel.");

    const authUserId = (usuario as any).auth_user_id as string | null;

    if (authUserId) {
      // Recupera avatar_url do personagem para deletar do storage
      const { data: personagem } = await admin
        .from(PERSONAGEM_TABLE)
        .select("id, avatar_url")
        .eq("user_id", authUserId)
        .is("deleted_at", null)
        .maybeSingle();

      // Soft-delete personagem
      if (personagem) {
        await admin
          .from(PERSONAGEM_TABLE)
          .update({ deleted_at: new Date().toISOString(), deleted_by: "master-delete" })
          .eq("user_id", authUserId)
          .is("deleted_at", null);

        // Delete avatar do storage
        const avatarUrl = (personagem as any).avatar_url as string | null;
        if (avatarUrl) {
          const storagePath = avatarUrl.split("/character-avatars/")[1]?.split("?")[0];
          if (storagePath) {
            await admin.storage.from("character-avatars").remove([storagePath]).catch(() => null);
          }
        }
      }

      // Deleta usuário do Supabase Auth
      await admin.auth.admin.deleteUser(authUserId);
    }

    // Soft-delete registro em usuarios
    await admin
      .from(USUARIOS_TABLE)
      .update({ deleted_at: new Date().toISOString(), deleted_by: "master-delete" })
      .eq("id", id);

    return { success: true };
  },

  async preRegistrar(
    email: string,
    tipo: "gm" | "player" = "player",
    accessToken?: string,
  ): Promise<void> {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const emailNorm = email.trim().toLowerCase();
    if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      throw new Error("Email inválido.");
    }

    await admin.from(USUARIOS_TABLE).insert({
      real_email: emailNorm,
      tipo,
      ativo: true,
    });
  },

  async removerPreRegistro(id: number, accessToken?: string): Promise<void> {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: usuario, error } = await admin
      .from(USUARIOS_TABLE)
      .select("id, auth_user_id")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !usuario) throw new Error("Registro não encontrado.");
    if ((usuario as any).auth_user_id != null) {
      throw new Error("Não é possível remover um usuário com conta ativa por esta rota.");
    }

    await admin
      .from(USUARIOS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
  },
};
