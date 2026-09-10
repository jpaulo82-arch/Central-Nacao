/* ===== Data-fetching com fallback para fixtures ===== */
import { supabase, isSupabaseConfigured } from './supabase';
import {
  FIXTURE_NEWS,
  FIXTURE_MATCHES,
  FIXTURE_SOCIAL,
  FIXTURE_CORTES,
  FIXTURE_VENUES,
} from './fixtures';
import type { NewsCard, Match, SocialPost, Corte, Venue } from './types';

export interface DataResult<T> {
  data: T[];
  isDemo: boolean;
}

async function fetchFromSupabase<T>(
  table: string,
  fallback: T[],
  orderBy?: string,
): Promise<DataResult<T>> {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: fallback, isDemo: true };
  }
  try {
    let query = supabase.from(table).select('*');
    if (orderBy) {
      query = query.order(orderBy, { ascending: false });
    }
    const { data, error } = await query.limit(50);
    if (error || !data || (data as any[])?.length === 0) {
      return { data: fallback, isDemo: true };
    }
    return { data: data as T[], isDemo: false };
  } catch {
    return { data: fallback, isDemo: true };
  }
}

export const getNews = () =>
  fetchFromSupabase<NewsCard>('news_cards', FIXTURE_NEWS, 'timestamp');

export const getMatches = () =>
  fetchFromSupabase<Match>('matches', FIXTURE_MATCHES, 'data_hora');

export const getSocial = () =>
  fetchFromSupabase<SocialPost>('daily_payload', FIXTURE_SOCIAL, 'timestamp');

export const getCortes = () =>
  fetchFromSupabase<Corte>('daily_payload', FIXTURE_CORTES, 'timestamp');

export const getVenues = () =>
  fetchFromSupabase<Venue>('venues', FIXTURE_VENUES, 'cidade');
