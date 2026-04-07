import { getSupabaseClient } from "../../config/database/supabase/client.js";

export async function ensureMasterAccess(accessToken?: string) {
  const supabase = getSupabaseClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error("Usuário não autenticado");

  const masterEmail = (process.env.MASTER_EMAIL ?? "").trim().toLowerCase();
  if (masterEmail && user.email?.toLowerCase() !== masterEmail) {
    throw new Error("Acesso restrito ao mestre");
  }

  return user;
}
