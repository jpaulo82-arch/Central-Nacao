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
        global: {
          // Sempre buscar dados frescos — nunca servir resposta em cache
          fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
        },
      })
    : null;

export const isSupabaseConfigured = (): boolean => !!supabase;
