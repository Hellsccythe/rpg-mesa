import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[rpg-mesa] SUPABASE_URL ou SUPABASE_ANON_KEY nao configurados — chamadas ao banco vao falhar",
  );
}

// Node.js < 22 nao tem WebSocket nativo; passa o pacote ws para o realtime do Supabase
const realtimeOpts = { transport: ws } as any;

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: realtimeOpts,
});

let _adminClient: ReturnType<typeof createClient<any>> | null = null;

export function getAdminClient() {
  if (!_adminClient) {
    if (!supabaseServiceKey) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY nao configurada. Necessaria para operacoes sem autenticacao.",
      );
    }
    _adminClient = createClient<any>(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: realtimeOpts,
    });
  }
  return _adminClient;
}

export function getSupabaseClient(accessToken?: string) {
  if (!accessToken) return supabase;
  return createClient<any>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: realtimeOpts,
  });
}

export function getPublicClient() {
  return supabase;
}
