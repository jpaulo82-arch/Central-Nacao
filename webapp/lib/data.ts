import { supabase, isSupabaseConfigured } from './supabase';
import type { NewsCard, Match, Corte, Venue } from './types';

interface DailyPayloadRow {
  date: string;
  payload: Record<string, any>;
  payload_status?: string;
}

export interface HomeDataResult {
  news: NewsCard[];
  matches: Match[];
  nacaoMatches: Match[];
  nacaoClassificacao: string | null;
  cortes: Corte[];
  venues: Venue[];
  errors: string[];
}

const PILOT_CITIES = ['Rio de Janeiro', 'Brasília'] as const;

const EMPTY_RESULT: HomeDataResult = {
  news: [],
  matches: [],
  nacaoMatches: [],
  nacaoClassificacao: null,
  cortes: [],
  venues: [],
  errors: [],
};

function mapStampToSelo(stamp: unknown): NewsCard['tipo'] {
  const allowed = ['oficial', 'confirmado', 'rumor', 'opiniao', 'meme', 'ugc'];
  return allowed.includes(String(stamp)) ? (stamp as NewsCard['tipo']) : 'ugc';
}

function mapStatusToUiStatus(status: unknown): Match['status'] {
  if (status === 'live') return 'ao_vivo';
  if (status === 'finished') return 'encerrado';
  return 'agendado';
}

function mapNewsItem(item: Record<string, any>, index: number, generatedAt?: string): NewsCard {
  return {
    id: String(item.card_id ?? `news-${index + 1}`),
    tipo: mapStampToSelo(item.stamp),
    titulo: String(item.title ?? 'Atualização sem título'),
    resumo: String(item.lede ?? ''),
    fonte: String(item.source_name ?? 'Central da Nação'),
    url_origem: String(item.source_url ?? '#'),
    imagem_url: item.image_url ? String(item.image_url) : null,
    timestamp: String(item.created_at ?? generatedAt ?? new Date().toISOString()),
    destaque: index < 2,
  };
}

function mapMatchItem(item: Record<string, any>, index: number): Match {
  return {
    id: String(item.match_id ?? `match-${index + 1}`),
    competicao: String(item.competition ?? 'Partida'),
    mandante: String(item.home ?? ''),
    visitante: String(item.away ?? ''),
    data_hora: String(item.kickoff_iso ?? new Date().toISOString()),
    local: String(item.venue ?? ''),
    status: mapStatusToUiStatus(item.status),
    placar_mandante: typeof item.score_home === 'number' ? item.score_home : null,
    placar_visitante: typeof item.score_away === 'number' ? item.score_away : null,
  };
}

function mapCorteItem(item: Record<string, any>, index: number, generatedAt?: string): Corte {
  return {
    id: String(item.link ?? `corte-${index + 1}`),
    tipo: 'ugc',
    titulo: String(item.title ?? 'Corte da Nação'),
    descricao: String(item.channel_name ? `Canal: ${item.channel_name}` : 'Conteúdo em vídeo da torcida'),
    midia_url: String(item.thumbnail_url ?? 'https://cdn.abacus.ai/images/f7b96a07-5819-4495-b21b-fb9121c40453.png'),
    midia_tipo: 'video',
    autor: String(item.channel_name ?? 'Canal da Nação'),
    curtidas: typeof item.views === 'number' ? item.views : 0,
    timestamp: String(generatedAt ?? new Date().toISOString()),
  };
}

function mapVenueItem(item: Record<string, any>, index: number): Venue {
  const rawType = String(item.type ?? '').toLowerCase();
  const tipo: Venue['tipo'] = rawType === 'loja' || rawType === 'embaixada' ? rawType : 'bar';

  return {
    id: String(item.venue_id ?? `venue-${index + 1}`),
    nome: String(item.name ?? 'Local da Nação'),
    tipo,
    cidade: String(item.city ?? ''),
    endereco: String(item.address ?? ''),
    bairro: String(item.state ?? ''),
    descricao: String(item.matchday_note ?? ''),
  };
}

function buildClassificacaoLabel(classificacao: Record<string, any> | null | undefined): string | null {
  if (!classificacao || typeof classificacao !== 'object') return null;

  const posicao = classificacao.position ?? classificacao.posicao;
  const pontos = classificacao.points ?? classificacao.pontos;

  if (typeof posicao === 'number' && typeof pontos === 'number') {
    return `${posicao}º lugar · ${pontos} pts`;
  }

  return null;
}

async function fetchPublishedPayload(): Promise<DailyPayloadRow | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('daily_payload')
    .select('date,payload,payload_status')
    .eq('payload_status', 'published')
    .order('date', { ascending: false })
    .limit(1);

  if (error || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  return data[0] as DailyPayloadRow;
}

async function fetchPilotVenues(): Promise<Venue[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('venues')
    .select('venue_id,name,type,city,state,address,matchday_note')
    .eq('status', 'verified')
    .in('city', [...PILOT_CITIES])
    .order('city', { ascending: true })
    .limit(100);

  if (error || !Array.isArray(data)) return [];

  return data.map((row, index) => mapVenueItem(row as Record<string, any>, index));
}

export async function getHomeData(): Promise<HomeDataResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      ...EMPTY_RESULT,
      errors: ['Integração com banco indisponível no momento.'],
    };
  }

  const result: HomeDataResult = { ...EMPTY_RESULT, errors: [] };

  try {
    const payloadRow = await fetchPublishedPayload();

    if (!payloadRow?.payload || typeof payloadRow.payload !== 'object') {
      result.errors.push('Não foi possível encontrar conteúdo publicado para a home.');
    } else {
      const payload = payloadRow.payload as Record<string, any>;
      const generatedAt = String(payload.generated_at ?? new Date().toISOString());

      const agoraItems = Array.isArray(payload.agora?.items) ? payload.agora.items : [];
      const nacaoItems = Array.isArray(payload.nacao?.items) ? payload.nacao.items : [];
      const cortesItems = Array.isArray(payload.cortes?.items) ? payload.cortes.items : [];

      result.news = agoraItems.map((item: Record<string, any>, index: number) =>
        mapNewsItem(item, index, generatedAt)
      );

      result.nacaoMatches = nacaoItems.map((item: Record<string, any>, index: number) =>
        mapMatchItem(item, index)
      );

      result.matches = result.nacaoMatches;
      result.nacaoClassificacao = buildClassificacaoLabel(payload.nacao?.classificacao);

      result.cortes = cortesItems.map((item: Record<string, any>, index: number) =>
        mapCorteItem(item, index, generatedAt)
      );
    }

    result.venues = await fetchPilotVenues();
    if (result.venues.length === 0) {
      result.errors.push('Nenhum local verificado disponível nas cidades-piloto.');
    }

    return result;
  } catch {
    return {
      ...EMPTY_RESULT,
      errors: ['Falha ao carregar o conteúdo do banco. Tente novamente em instantes.'],
    };
  }
}
