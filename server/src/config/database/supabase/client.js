// server/src/config/database/supabase/client.ts
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
// Carrega variaveis do servidor e, se necessario, reutiliza o .env do client.
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../client/.env") });
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variaveis do Supabase nao encontradas. Configure SUPABASE_URL e SUPABASE_ANON_KEY no .env");
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});
/** Client com service role key — bypassa RLS. Usado apenas para leituras públicas no servidor. */
export function getAdminClient() {
    if (!supabaseServiceKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada. Necessária para operações públicas (sem auth).");
    }
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
export function getSupabaseClient(accessToken) {
    if (!accessToken)
        return supabase;
    return createClient(supabaseUrl, supabaseAnonKey, {
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
//# sourceMappingURL=client.js.map