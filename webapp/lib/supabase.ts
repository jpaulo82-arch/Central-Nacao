/**
 * Cliente Supabase (somente leitura).
 * Se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não estiverem definidas,
 * o cliente será null e o app usa fixtures de demonstração.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = typeof window !== 'undefined'
  ? (window as any).__NEXT_DATA__?.runtimeConfig?.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  : process.env.NEXT_PUBLIC_SUPABASE_URL;

const key = typeof window !== 'undefined'
  ? (window as any).__NEXT_DATA__?.runtimeConfig?.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

export const isSupabaseConfigured = (): boolean => !!supabase;
