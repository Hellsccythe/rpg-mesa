import { getSupabaseClient } from "../../config/database/supabase/client.js";

export async function ensureAuthenticatedAccess(accessToken?: string) {
  const supabase = getSupabaseClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error("Usuário não autenticado");
  return user;
}

export async function ensureMasterAccess(accessToken?: string) {
  const user = await ensureAuthenticatedAccess(accessToken);

  const raw = process.env.MASTER_EMAILS ?? process.env.MASTER_EMAIL ?? "";
  const masterEmails = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (masterEmails.length === 0) {
    throw new Error("MASTER_EMAILS nao configurado no servidor");
  }
  if (!masterEmails.includes(user.email?.toLowerCase() ?? "")) {
    throw new Error("Acesso restrito ao mestre");
  }

  return user;
}

export function getMasterEmails(): string[] {
  const raw = process.env.MASTER_EMAILS ?? process.env.MASTER_EMAIL ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
