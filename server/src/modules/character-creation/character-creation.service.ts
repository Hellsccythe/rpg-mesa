import crypto from "node:crypto";
import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess, getUserDisplayEmail } from "../../common/helpers/master-access.helper.js";
import { usuariosService } from "../usuarios/usuarios.service.js";

const REQUESTS_TABLE = "character_creation_requests";
const PERSONAGEM_TABLE = "characters";

function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY ?? "rpg-mesa-default-key-change-this!";
  return crypto.createHash("sha256").update(raw).digest();
}

function encryptPassword(password: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decryptPassword(stored: string): string {
  const [ivHex, encHex] = stored.split(":");
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const enc = Buffer.from(encHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function checkEmailPreAutorizado(email: string): Promise<boolean> {
  const { data } = await getAdminClient()
    .from("usuarios")
    .select("id")
    .eq("real_email", email)
    .is("auth_user_id", null)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();
  return data != null;
}

export type SolicitacaoCriacaoDto = {
  email: string;
  username: string;
  password: string;
  nome: string;
  avatar_url?: string | null;
  indole_id?: number | null;
  genero_id?: number | null;
  aparencia_fisica: string;
  historia_texto?: string | null;
  historia_doc_url?: string | null;
};

export const characterCreationService = {
  async submeter(dto: SolicitacaoCriacaoDto): Promise<{ success: boolean; id: number }> {
    const admin = getAdminClient();

    const email = normalizeEmail(dto.email);
    if (!isValidEmail(email)) throw new Error("Email inválido.");

    const preAutorizado = await checkEmailPreAutorizado(email);
    if (!preAutorizado) {
      throw new Error("Email não autorizado pelo mestre para criação de personagem.");
    }

    const username = (dto.username ?? "").trim().toLowerCase();
    if (!/^[a-z0-9_-]{3,20}$/.test(username)) {
      throw new Error("Usuário deve ter entre 3 e 20 caracteres (letras, números, _ ou -).");
    }

    // Verifica unicidade do username em requests pendentes/aprovados
    const { data: existingReq } = await admin
      .from(REQUESTS_TABLE)
      .select("id")
      .eq("username", username)
      .in("status", ["pendente", "aprovado"])
      .is("deleted_at", null)
      .maybeSingle();
    if (existingReq) throw new Error("Este nome de usuário já está em uso.");

    const { data: existingChar } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id")
      .eq("username", username)
      .is("deleted_at", null)
      .maybeSingle();
    if (existingChar) throw new Error("Este nome de usuário já está em uso.");

    const password = dto.password ?? "";
    if (password.length < 8) throw new Error("Senha deve ter no mínimo 8 caracteres.");
    if (!/[A-Z]/.test(password)) throw new Error("Senha deve conter ao menos uma letra maiúscula.");
    if (!/[0-9]/.test(password)) throw new Error("Senha deve conter ao menos um número.");
    if (!/[^a-zA-Z0-9]/.test(password))
      throw new Error("Senha deve conter ao menos um caractere especial.");

    const aparencia = typeof dto.aparencia_fisica === "string" ? dto.aparencia_fisica.trim() : "";
    if (aparencia.replace(/\s/g, "").length < 30)
      throw new Error("Aparência física deve ter no mínimo 30 letras (sem espaços).");

    const temTexto =
      typeof dto.historia_texto === "string" && dto.historia_texto.trim().length > 0;
    const temDoc =
      typeof dto.historia_doc_url === "string" && dto.historia_doc_url.trim().length > 0;
    if (!temTexto && !temDoc)
      throw new Error("Informe a história do personagem (texto ou arquivo).");
    if (temTexto) {
      const letras = dto.historia_texto!.replace(/<[^>]*>/g, "").replace(/\s/g, "").length;
      if (letras < 100)
        throw new Error(
          "História deve ter no mínimo 100 letras (sem contar espaços e marcação HTML).",
        );
    }

    const passwordEncrypted = encryptPassword(password);

    const { data, error } = await admin
      .from(REQUESTS_TABLE)
      .insert({
        email,
        username,
        password_hash: passwordEncrypted,
        nome: (dto.nome ?? "").trim(),
        avatar_url: dto.avatar_url ?? null,
        indole_id: dto.indole_id ?? null,
        genero_id: dto.genero_id ?? null,
        aparencia_fisica: aparencia,
        historia_texto: temTexto ? dto.historia_texto : null,
        historia_doc_url: temDoc ? (dto.historia_doc_url ?? "").trim() : null,
        status: "pendente",
      })
      .select("id")
      .single();

    if (error) throw error;
    return { success: true, id: (data as any).id as number };
  },

  async listar(accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from(REQUESTS_TABLE)
      .select(
        "id, email, username, nome, avatar_url, indole_id, genero_id, aparencia_fisica, historia_texto, historia_doc_url, status, rejeitado_motivo, revisado_em, created_at, updated_at",
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const [indoleRes, generoRes] = await Promise.all([
      admin.from("indole").select("id, codigo, descricao"),
      admin.from("genero").select("id, codigo, descricao, pronome"),
    ]);

    const indoleMap = new Map((indoleRes.data ?? []).map((r: any) => [r.id, r]));
    const generoMap = new Map((generoRes.data ?? []).map((r: any) => [r.id, r]));

    return (data ?? []).map((row: any) => ({
      ...row,
      indole: row.indole_id != null ? (indoleMap.get(row.indole_id) ?? null) : null,
      genero: row.genero_id != null ? (generoMap.get(row.genero_id) ?? null) : null,
    }));
  },

  async aprovar(id: number, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: req, error: fetchError } = await admin
      .from(REQUESTS_TABLE)
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !req) throw new Error("Solicitação não encontrada.");
    if ((req as any).status !== "pendente") throw new Error("Solicitação já foi processada.");

    const { data: existingChar } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id")
      .eq("username", (req as any).username)
      .is("deleted_at", null)
      .maybeSingle();
    if (existingChar) throw new Error("Nome de usuário já ocupado por outro personagem.");

    let rawPassword: string;
    try {
      rawPassword = decryptPassword((req as any).password_hash);
    } catch {
      throw new Error("Não foi possível recuperar as credenciais do jogador.");
    }

    const authEmail = `${(req as any).username}@rpg.internal`;
    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email: authEmail,
      password: rawPassword,
      email_confirm: true,
      user_metadata: {
        real_email: (req as any).email,
        username: (req as any).username,
        display_name: (req as any).username,
      },
    });

    if (createError) {
      const msg = createError.message?.toLowerCase() ?? "";
      if (msg.includes("already") || (createError as any).status === 422) {
        throw new Error("Este nome de usuário já está em uso. Escolha outro.");
      }
      throw createError;
    }

    const userId = createData.user.id;

    const { error: charError } = await admin.from(PERSONAGEM_TABLE).insert({
      user_id: userId,
      username: (req as any).username,
      name: (req as any).nome.trim(),
      level: 1,
      avatar_url: (req as any).avatar_url ?? null,
      indole_id: (req as any).indole_id ?? null,
      genero_id: (req as any).genero_id ?? null,
      aparencia_fisica: (req as any).aparencia_fisica ?? null,
      historia_texto: (req as any).historia_texto ?? null,
      historia_doc_url: (req as any).historia_doc_url ?? null,
      data: {},
    });

    if (charError) {
      await admin.auth.admin.deleteUser(userId).catch(() => null);
      throw charError;
    }

    await usuariosService.criar({
      auth_user_id: userId,
      real_email: (req as any).email,
      username: (req as any).username,
      tipo: "player",
    }).catch(() => null);

    await admin
      .from(REQUESTS_TABLE)
      .update({
        status: "aprovado",
        revisado_em: new Date().toISOString(),
        revisado_por: getUserDisplayEmail(masterUser),
      })
      .eq("id", id);

    return { success: true };
  },

  async rejeitar(id: number, motivo: string, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: req, error: fetchError } = await admin
      .from(REQUESTS_TABLE)
      .select("id, status")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !req) throw new Error("Solicitação não encontrada.");
    if ((req as any).status !== "pendente") throw new Error("Solicitação já foi processada.");

    const { error } = await admin
      .from(REQUESTS_TABLE)
      .update({
        status: "rejeitado",
        rejeitado_motivo: motivo?.trim() ?? null,
        revisado_em: new Date().toISOString(),
        revisado_por: getUserDisplayEmail(masterUser),
      })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  },

  async contarPendentes(): Promise<number> {
    const { count, error } = await getAdminClient()
      .from(REQUESTS_TABLE)
      .select("id", { count: "exact", head: true })
      .eq("status", "pendente")
      .is("deleted_at", null);
    if (error) return 0;
    return count ?? 0;
  },
};
