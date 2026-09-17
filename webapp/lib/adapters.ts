/**
 * Adaptadores: convertem as linhas REAIS do Supabase (schema em inglês do
 * pipeline editorial) para os tipos usados pela interface.
 *
 * Tabelas / colunas reais (confirmadas em 16/09/2026):
 *  - news_cards: card_id, title, lede, stamp, category, team_unit, source_name,
 *                source_url, needs_review, duplicate_of, created_at, updated_at
 *  - matches:    match_id, competition, kickoff_iso, home, away, venue, status
 *                (scheduled|live|finished), score_home, score_away, broadcast[]
 *  - venues:     venue_id, name, type, city, state, address, geo, has_screen,
 *                status, matchday_note
 *  - daily_payload: date, payload(json: agora, nacao{items,classificacao}, cortes,
 *                perto_de_voce, generated_at, status), payload_status, payload_mode
 */
import type { NewsCard, Match, Venue, Corte, Classificacao, SeloTipo } from './types';

const SELOS: SeloTipo[] = ['oficial', 'confirmado', 'rumor', 'opiniao', 'meme', 'ugc'];

function toSelo(v: unknown): SeloTipo {
  const s = String(v ?? '').toLowerCase();
  return (SELOS as string[]).includes(s) ? (s as SeloTipo) : 'confirmado';
}

function toIso(v: unknown, fallback = new Date(0).toISOString()): string {
  if (!v) return fallback;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? fallback : d.toISOString();
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

/* ---------- news_cards ---------- */
export function adaptNewsRow(row: Record<string, any>, idx = 0): NewsCard | null {
  if (!row) return null;
  if (row.duplicate_of) return null; // esconde duplicatas
  const titulo = row.title ?? row.titulo ?? '';
  if (!titulo) return null;
  const tipo = toSelo(row.stamp ?? row.tipo);
  return {
    id: String(row.card_id ?? row.id ?? `news-${idx}`),
    tipo,
    titulo,
    resumo: row.lede ?? row.resumo ?? row.summary ?? '',
    fonte: row.source_name ?? row.fonte ?? 'Fonte',
    url_origem: row.source_url ?? row.url_origem ?? row.url ?? '',
    imagem_url: row.image_url ?? row.imagem_url ?? null,
    timestamp: toIso(row.published_at ?? row.created_at ?? row.timestamp),
    destaque: Boolean(row.destaque ?? row.featured ?? (tipo === 'oficial' || row.category === 'jogo')),
    categoria: row.category ?? row.categoria,
  };
}

/* ---------- matches ---------- */
const STATUS_MAP: Record<string, Match['status']> = {
  scheduled: 'agendado',
  agendado: 'agendado',
  live: 'ao_vivo',
  in_progress: 'ao_vivo',
  ao_vivo: 'ao_vivo',
  halftime: 'intervalo',
  intervalo: 'intervalo',
  finished: 'encerrado',
  encerrado: 'encerrado',
  ft: 'encerrado',
};

export function adaptMatchRow(row: Record<string, any>, idx = 0): Match | null {
  if (!row) return null;
  const mandante = row.home ?? row.mandante ?? '';
  const visitante = row.away ?? row.visitante ?? '';
  if (!mandante || !visitante) return null;
  let transmissao: string[] | undefined;
  const b = row.broadcast;
  if (Array.isArray(b)) transmissao = b.map(String);
  else if (typeof b === 'string' && b) transmissao = [b];
  return {
    id: String(row.match_id ?? row.id ?? `match-${idx}`),
    competicao: row.competition ?? row.competicao ?? '',
    mandante,
    visitante,
    data_hora: toIso(row.kickoff_iso ?? row.data_hora ?? row.kickoff),
    local: row.venue ?? row.local ?? '',
    status: STATUS_MAP[String(row.status ?? '').toLowerCase()] ?? 'agendado',
    placar_mandante: toNum(row.score_home ?? row.placar_mandante),
    placar_visitante: toNum(row.score_away ?? row.placar_visitante),
    transmissao,
  };
}

/* ---------- venues ---------- */
const TIPO_MAP: Record<string, Venue['tipo']> = {
  bar: 'bar',
  pub: 'bar',
  restaurante: 'bar',
  loja: 'loja',
  store: 'loja',
  shop: 'loja',
  embaixada: 'embaixada',
  embassy: 'embaixada',
  consulado: 'embaixada',
};

function extractBairro(address: string): string {
  // Padrão comum no seed: "Rua X, 123 — Bairro, Cidade — UF"
  const parts = address.split('—').map((p) => p.trim());
  if (parts.length >= 2) {
    const meio = parts[1].split(',')[0]?.trim();
    if (meio) return meio;
  }
  return '';
}

export function adaptVenueRow(row: Record<string, any>, idx = 0): Venue | null {
  if (!row) return null;
  const nome = row.name ?? row.nome ?? '';
  if (!nome) return null;
  const endereco = row.address ?? row.endereco ?? '';
  return {
    id: String(row.venue_id ?? row.id ?? `venue-${idx}`),
    nome,
    tipo: TIPO_MAP[String(row.type ?? row.tipo ?? 'bar').toLowerCase()] ?? 'bar',
    cidade: row.city ?? row.cidade ?? '',
    endereco,
    bairro: row.bairro ?? row.neighborhood ?? extractBairro(endereco),
    descricao: row.matchday_note ?? row.descricao ?? row.description ?? '',
    tem_telao: Boolean(row.has_screen),
  };
}

/* ---------- daily_payload → cortes ---------- */

/** Hosts de imagem que o pipeline usa como placeholder ou que não são thumbnails reais. */
const THUMB_BLOQUEADOS = /placehold\.co|placeholder\.com|via\.placeholder|gravatar\.com|dummyimage|picsum\.photos/i;
const THUMB_CONFIAVEIS = /(^|\.)(ytimg\.com|youtube\.com|cdninstagram\.com|twimg\.com|tiktokcdn\.com|cdn\.abacus\.ai)$/i;

/** Extrai o ID de vídeo de links do YouTube (watch, shorts, live, youtu.be). */
function youtubeId(link: string): string | null {
  const m = link.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|live\/|embed\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/**
 * Escolhe uma thumbnail confiável: YouTube derivado do link > thumbnail de host conhecido >
 * capa gráfica gerada no card (evita placeholders e imagens sem relação).
 */
export function escolherThumb(link: string, thumb: string, _idx: number): string {
  const yt = youtubeId(link ?? '');
  if (yt) return ['https:/', 'i.ytimg.com', 'vi', yt, 'hqdefault.jpg'].join('/');
  if (thumb && !THUMB_BLOQUEADOS.test(thumb)) {
    try {
      if (THUMB_CONFIAVEIS.test(new URL(thumb).hostname)) return thumb;
    } catch { /* URL inválida → fallback */ }
  }
  // Sem thumbnail confiável: o card renderiza uma capa gráfica própria (sem repetir fotos da galeria)
  return '';
}

export function adaptCorteItem(item: Record<string, any>, generatedAt: string, idx = 0): Corte | null {
  if (!item) return null;
  const titulo = item.title ?? item.titulo ?? '';
  if (!titulo) return null;
  const link = item.link ?? item.url ?? item.url_origem ?? '';
  const isMeme = String(item.kind ?? item.tipo ?? '').toLowerCase() === 'meme';
  return {
    id: String(item.id ?? item.video_id ?? `${item.account_id ?? 'corte'}-${idx}`),
    tipo: isMeme ? 'meme' : 'ugc',
    titulo,
    descricao: item.description ?? item.descricao ?? `Vídeo do canal ${item.channel_name ?? ''}`.trim(),
    midia_url: escolherThumb(link, item.thumbnail_url ?? item.midia_url ?? '', idx),
    midia_tipo: /youtube|youtu\.be|tiktok|\.mp4/i.test(link) || item.thumbnail_url ? 'video' : 'imagem',
    autor: item.channel_name ?? item.autor ?? item.account_id ?? '',
    curtidas: toNum(item.likes ?? item.curtidas) ?? 0,
    timestamp: toIso(item.published_at ?? item.timestamp ?? generatedAt),
    url_origem: link,
    visualizacoes: item.views ? String(item.views) : undefined,
  };
}

/* ---------- daily_payload → classificação ---------- */
export function adaptClassificacao(c: Record<string, any> | null | undefined): Classificacao | null {
  if (!c) return null;
  const pontos = toNum(c.pontos ?? c.points);
  const posicao = toNum(c.posicao ?? c.position);
  if (pontos === null || posicao === null) return null;
  return {
    posicao,
    pontos,
    jogos: toNum(c.jogos ?? c.played) ?? 0,
    vitorias: toNum(c.vitorias ?? c.wins) ?? 0,
    empates: toNum(c.empates ?? c.draws) ?? 0,
    derrotas: toNum(c.derrotas ?? c.losses) ?? 0,
    saldo_gols: toNum(c.saldo_gols ?? c.goal_diff) ?? 0,
    data_ref: String(c.data_ref ?? c.date ?? ''),
  };
}
