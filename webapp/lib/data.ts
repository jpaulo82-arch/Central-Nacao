/* ===== Data-fetching: Supabase (leitura) com fallback para fixtures ===== */
import { supabase, isSupabaseConfigured } from './supabase';
import {
  FIXTURE_NEWS,
  FIXTURE_MATCHES,
  FIXTURE_SOCIAL,
  FIXTURE_CORTES,
  FIXTURE_VENUES,
} from './fixtures';
import {
  adaptNewsRow,
  adaptMatchRow,
  adaptVenueRow,
  adaptCorteItem,
  adaptClassificacao,
} from './adapters';
import type { NewsCard, Match, SocialPost, Corte, Venue, Classificacao } from './types';

export interface DataResult<T> {
  data: T[];
  isDemo: boolean;
  /** Mensagem de erro (só preenchida quando a leitura do Supabase falhou) */
  error?: string;
  /** Momento em que os dados foram gerados/atualizados na fonte */
  updatedAt?: string;
}

export interface HubData {
  news: DataResult<NewsCard>;
  matches: DataResult<Match>;
  social: DataResult<SocialPost>;
  cortes: DataResult<Corte>;
  venues: DataResult<Venue>;
  classificacao: Classificacao | null;
  /** Data de geração do payload diário (ISO) */
  payloadGeneratedAt: string | null;
  supabaseConfigured: boolean;
  /** Momento (ISO) em que os dados foram lidos no servidor */
  renderedAt: string;
}

function demo<T>(fallback: T[], error?: string): DataResult<T> {
  return { data: fallback, isDemo: true, error };
}

function logErro(ctx: string, err: unknown) {
  const msg = err instanceof Error ? err.message : JSON.stringify(err);
  console.error(`[central-da-nacao] Falha ao ler ${ctx} no Supabase: ${msg}`);
}

async function readTable<T>(
  table: string,
  orderBy: string,
  adapt: (row: Record<string, any>, idx: number) => T | null,
  fallback: T[],
  opts: { ascending?: boolean; limit?: number } = {},
): Promise<DataResult<T>> {
  if (!isSupabaseConfigured() || !supabase) return demo(fallback);
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending: opts.ascending ?? false })
      .limit(opts.limit ?? 50);
    if (error) {
      logErro(table, error);
      return demo(fallback, error.message);
    }
    const rows = ((data ?? []) as Record<string, any>[])
      .map((r, i) => adapt(r, i))
      .filter((x): x is T => x !== null);
    if (rows.length === 0) return demo(fallback, `Tabela ${table} vazia`);
    return { data: rows, isDemo: false };
  } catch (err) {
    logErro(table, err);
    return demo(fallback, err instanceof Error ? err.message : 'erro desconhecido');
  }
}

export const getNews = () =>
  readTable<NewsCard>('news_cards', 'created_at', adaptNewsRow, FIXTURE_NEWS());

export const getMatches = () =>
  readTable<Match>('matches', 'kickoff_iso', adaptMatchRow, FIXTURE_MATCHES(), { ascending: true, limit: 20 });

export const getVenues = () =>
  readTable<Venue>('venues', 'city', adaptVenueRow, FIXTURE_VENUES(), { ascending: true, limit: 200 });

interface PayloadResult {
  cortes: DataResult<Corte>;
  social: DataResult<SocialPost>;
  classificacao: Classificacao | null;
  generatedAt: string | null;
}

/**
 * daily_payload: uma linha por dia com o JSON curado.
 * - payload.cortes.items → seção Cortes
 * - payload.nacao.classificacao → tabela do Brasileirão
 * - payload.social?.items (opcional, ainda não gerado pelo pipeline) → timeline Nação
 */
async function getDailyPayload(): Promise<PayloadResult> {
  const vazio: PayloadResult = {
    cortes: demo(FIXTURE_CORTES()),
    social: demo(FIXTURE_SOCIAL()),
    classificacao: null,
    generatedAt: null,
  };
  if (!isSupabaseConfigured() || !supabase) return vazio;
  try {
    const { data, error } = await supabase
      .from('daily_payload')
      .select('date,payload,payload_status,updated_at')
      .order('date', { ascending: false })
      .limit(1);
    if (error) {
      logErro('daily_payload', error);
      return { ...vazio, cortes: demo(FIXTURE_CORTES(), error.message), social: demo(FIXTURE_SOCIAL(), error.message) };
    }
    const row = (data ?? [])[0] as Record<string, any> | undefined;
    const payload = row?.payload;
    if (!payload || typeof payload !== 'object') return vazio;

    const generatedAt: string | null = payload.generated_at ?? row?.updated_at ?? null;

    const cortesItems: Record<string, any>[] = Array.isArray(payload?.cortes?.items) ? payload.cortes.items : [];
    const cortes = cortesItems
      .map((it, i) => adaptCorteItem(it, generatedAt ?? new Date(0).toISOString(), i))
      .filter((x): x is Corte => x !== null);

    const socialItems: Record<string, any>[] = Array.isArray(payload?.social?.items) ? payload.social.items : [];
    const social: SocialPost[] = socialItems
      .filter((it) => it && (it.text || it.texto))
      .map((it, i) => ({
        id: String(it.id ?? it.post_id ?? `social-${i}`),
        plataforma: (['twitter', 'instagram', 'tiktok', 'youtube'].includes(String(it.platform ?? it.plataforma))
          ? (it.platform ?? it.plataforma)
          : it.platform === 'x'
            ? 'twitter'
            : 'twitter') as SocialPost['plataforma'],
        autor: it.author ?? it.autor ?? it.handle ?? '',
        handle: it.handle ?? '',
        texto: it.text ?? it.texto ?? '',
        curtidas: Number(it.likes ?? it.curtidas ?? 0) || 0,
        url_post: it.url ?? it.link ?? it.url_post ?? '',
        timestamp: it.published_at ?? it.timestamp ?? generatedAt ?? new Date(0).toISOString(),
      }));

    return {
      cortes: cortes.length ? { data: cortes, isDemo: false, updatedAt: generatedAt ?? undefined } : demo(FIXTURE_CORTES(), 'payload sem cortes'),
      social: social.length ? { data: social, isDemo: false, updatedAt: generatedAt ?? undefined } : demo(FIXTURE_SOCIAL(), 'payload sem timeline social'),
      classificacao: adaptClassificacao(payload?.nacao?.classificacao ?? payload?.classificacao),
      generatedAt,
    };
  } catch (err) {
    logErro('daily_payload', err);
    return vazio;
  }
}

export async function getHubData(): Promise<HubData> {
  const [news, matches, venues, payload] = await Promise.all([
    getNews(),
    getMatches(),
    getVenues(),
    getDailyPayload(),
  ]);
  return {
    news,
    matches,
    venues,
    social: payload.social,
    cortes: payload.cortes,
    classificacao: payload.classificacao,
    payloadGeneratedAt: payload.generatedAt,
    supabaseConfigured: isSupabaseConfigured(),
    renderedAt: new Date().toISOString(),
  };
}

// Compatibilidade com chamadas antigas
export const getSocial = async () => (await getDailyPayload()).social;
export const getCortes = async () => (await getDailyPayload()).cortes;
