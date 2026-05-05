import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireDbVars(): { url: string; anonKey: string } {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Variaveis do Supabase nao encontradas. Configure SUPABASE_URL e SUPABASE_ANON_KEY no ambiente.",
    );
  }
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

let _publicClient: ReturnType<typeof createClient<any>> | null = null;

export function getPublicClient() {
  if (!_publicClient) {
    const { url, anonKey } = requireDbVars();
    _publicClient = createClient<any>(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _publicClient;
}

/** @deprecated Use getPublicClient() */
export const supabase = new Proxy({} as ReturnType<typeof createClient<any>>, {
  get(_target, prop) {
    return (getPublicClient() as any)[prop];
  },
});

let _adminClient: ReturnType<typeof createClient<any>> | null = null;

/** Client com service role key — bypassa RLS. */
export function getAdminClient() {
  if (!_adminClient) {
    const { url } = requireDbVars();
    if (!supabaseServiceKey) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY nao configurada. Necessaria para operacoes sem autenticacao.",
      );
    }
    _adminClient = createClient<any>(url, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _adminClient;
}

export function getSupabaseClient(accessToken?: string) {
  if (!accessToken) return getPublicClient();
  const { url, anonKey } = requireDbVars();
  return createClient<any>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
