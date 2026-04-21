// server/src/config/database/supabase/client.ts
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variaveis do Supabase nao encontradas. Configure SUPABASE_URL e SUPABASE_ANON_KEY no .env",
  );
}

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

let _adminClient: ReturnType<typeof createClient<any>> | null = null;

/** Client com service role key — bypassa RLS. Usado apenas para leituras públicas no servidor. */
export function getAdminClient() {
  if (!_adminClient) {
    if (!supabaseServiceKey) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY não configurada. Necessária para operações públicas (sem auth).",
      );
    }
    _adminClient = createClient<any>(supabaseUrl!, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _adminClient;
}

export function getSupabaseClient(accessToken?: string) {
  if (!accessToken) return supabase;

  return createClient<any>(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
