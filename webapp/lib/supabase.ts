/**
 * Cliente Supabase (somente leitura, chave anon).
 * Se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não estiverem definidas,
 * o cliente será null e o app usa fixtures de demonstração.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        // Sem override de fetch: no build estático (output: 'export'), um fetch com
        // cache: 'no-store' faz o Next marcar a rota como dinâmica (`dynamic = "error"`)
        // e o build falha silenciosamente, caindo nas fixtures de demonstração.
        // Como o site é reconstruído diariamente pelo workflow, cada build já é a
        // "atualização" — não precisamos forçar no-store dentro dele.
      })
    : null;

export const isSupabaseConfigured = (): boolean => !!supabase;
