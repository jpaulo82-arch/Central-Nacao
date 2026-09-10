-- ============================================================================
-- Central da Nação — Schema Supabase (MVP)
-- Arquivo: supabase/01_schema.sql
-- Fase: Integração e Finalização | Data: 2026-09-09
--
-- Contratos seguidos: `gemini.md` (Project Constitution) — enums, invariantes
-- e JSON Data Schemas (RawInput.* / ProcessedOutput.* / DeliveryPayload.*).
-- Compatibilidade: código Python em `tools/` (SupabaseClient via PostgREST):
--   • news_cards    → upsert em lote, conflito por `card_id`
--   • daily_payload → upsert por `date`, payload JSON inteiro
--   • venues        → leitura via select (limit 500)
--   • agent_pings   → handshake `ping_supabase.py`
--   • matches       → destino do estado de partida (worker matchday/Web App)
--   • sources/accounts → allowlists mantidas por humano (fonte de verdade)
--
-- Decisão de modelagem: colunas de enum como TEXT + CHECK (em vez de CREATE
-- TYPE). Motivo: máxima compatibilidade com o upsert do PostgREST em lote e
-- evolução simples da allowlist sem ALTER TYPE. As constraints reproduzem
-- exatamente os enums da Constitution. Para migrar depois para enum nativo,
-- basta criar o tipo e fazer ALTER TABLE ... ALTER COLUMN ... USING (col::tipo).
--
-- Ordem de execução no Supabase (SQL Editor): 1) 01_schema.sql  2) 02_seed_allowlists.sql
-- Idempotente: pode rodar mais de uma vez sem erro (IF NOT EXISTS / DROP IF EXISTS).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Função de apoio: updated_at automático
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 1. news_cards — ProcessedOutput.NewsCard (escrita: tools/write_cards.py)
-- ----------------------------------------------------------------------------
create table if not exists public.news_cards (
  card_id       text primary key,                        -- padrão 20260909-mercado-01
  title         text not null,
  lede          text not null,
  stamp         text not null check (stamp in ('oficial','confirmado','rumor','opiniao','meme','ugc')),
  category      text not null check (category in ('jogo','mercado','lesao','bastidor','conselho','institucional','historia','meme','local','outro')),
  team_unit     text not null default 'profissional_m' check (team_unit in ('profissional_m','profissional_f','sub20','base','basquete','volei','olimpicos','clube')),
  source_name   text not null,
  source_url    text not null,
  needs_review  boolean not null default false,
  duplicate_of  text,                                    -- card_id do card original (dedupe > 0.82)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.news_cards is 'Cards de notícia processados (ProcessedOutput.NewsCard). Escrita: tools/write_cards.py (upsert on_conflict=card_id).';
comment on column public.news_cards.stamp is 'Enum Constitution: oficial | confirmado | rumor | opiniao | meme | ugc.';
comment on column public.news_cards.category is 'Enum Constitution: jogo | mercado | lesao | bastidor | conselho | institucional | historia | meme | local | outro.';
comment on column public.news_cards.team_unit is 'Enum Constitution: profissional_m (default) | profissional_f | sub20 | base | basquete | volei | olimpicos | clube.';
comment on column public.news_cards.needs_review is 'True = output de LLM/schema inválido ou selo ambíguo; aguarda olhar humano.';
comment on column public.news_cards.duplicate_of is 'Preenchido quando o card foi deduplicado contra outro (similaridade > 0.82).';

create index if not exists ix_news_cards_created_at on public.news_cards (created_at desc);
create index if not exists ix_news_cards_duplicate_of on public.news_cards (duplicate_of) where duplicate_of is not null;
create index if not exists ix_news_cards_stamp_category on public.news_cards (stamp, category);

drop trigger if exists trg_news_cards_updated_at on public.news_cards;
create trigger trg_news_cards_updated_at
  before update on public.news_cards
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. matches — RawInput.Match (escrita: worker matchday / ingest_match)
-- ----------------------------------------------------------------------------
create table if not exists public.matches (
  match_id        text primary key,                      -- ex.: brasileirao-2026-r24-fla-flu
  competition     text not null,
  kickoff_iso     timestamptz not null,                  -- sempre com offset -03:00
  home            text not null,
  away            text not null,
  venue           text not null default '',
  status          text not null check (status in ('scheduled','live','finished')),
  score_home      integer check (score_home is null or score_home >= 0),
  score_away      integer check (score_away is null or score_away >= 0),
  lineup_confirmed boolean not null default false,
  broadcast       jsonb not null default '[]'::jsonb,    -- ex.: ["Globo", "Premiere"]
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.matches is 'Estado de partidas (RawInput.Match). Upsert on_conflict=match_id; fonte: API de futebol (adapter) ou fixture mock (nunca mock na produção).';
comment on column public.matches.status is 'Enum: scheduled | live | finished.';
comment on column public.matches.lineup_confirmed is 'Escalação oficial confirmada pelo provedor (base do tick type=lineup).';
comment on column public.matches.broadcast is 'Array JSON de canais de transmissão.';

create index if not exists ix_matches_kickoff_iso on public.matches (kickoff_iso);
create index if not exists ix_matches_status on public.matches (status) where status in ('scheduled','live');

drop trigger if exists trg_matches_updated_at on public.matches;
create trigger trg_matches_updated_at
  before update on public.matches
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. venues — RawInput.Venue (escrita: humano/editor; leitura: tools/ingest_venues.py)
-- ----------------------------------------------------------------------------
create table if not exists public.venues (
  venue_id       text primary key,                       -- ex.: rio-bar-chicos
  name           text not null,
  type           text not null check (type in ('bar','loja','embaixada','caravana','telão')),
  city           text not null,                          -- cidades piloto: Rio de Janeiro, Belo Horizonte, Recife, Salvador, São Paulo
  state          text not null,                          -- ex.: RJ
  address        text not null default '',
  geo            jsonb not null default '{"lat": null, "lng": null}'::jsonb
                 check (geo ?& array['lat','lng']),      -- {lat: number|null, lng: number|null}
  has_screen     boolean not null default false,
  status         text not null default 'pending' check (status in ('pending','verified','rejected','closed')),
  matchday_note  text not null default '',               -- ex.: "telão na calçada"
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.venues is 'Estabelecimentos por cidade (RawInput.Venue). Só entra no Daily Payload se status=verified e city na lista piloto.';
comment on column public.venues.type is 'Enum: bar | loja | embaixada | caravana | telão.';
comment on column public.venues.status is 'Enum: pending | verified | rejected | closed.';
comment on column public.venues.geo is 'Objeto JSON {lat, lng} com números ou null (contrato RawInput.Venue).';

create index if not exists ix_venues_city_status on public.venues (city, status);

drop trigger if exists trg_venues_updated_at on public.venues;
create trigger trg_venues_updated_at
  before update on public.venues
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. daily_payload — DeliveryPayload.Daily (escrita: tools/publish_payload.py + ponte)
-- ----------------------------------------------------------------------------
create table if not exists public.daily_payload (
  date           date primary key,                       -- YYYY-MM-DD (um payload por dia)
  payload        jsonb not null,
  payload_status text generated always as (payload ->> 'status') stored,  -- conveniência p/ queries (fonte: payload.status)
  payload_mode   text generated always as (payload ->> 'mode') stored,    -- conveniência p/ queries (fonte: payload.mode)
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint ck_daily_payload_quatro_secoes check (
    payload ? 'agora' and payload ? 'nacao' and payload ? 'cortes' and payload ? 'perto_de_voce'
  ),
  constraint ck_daily_payload_status check (
    (payload ->> 'status') in ('draft','approved','published','failed')
  ),
  constraint ck_daily_payload_mode check (
    (payload ->> 'mode') in ('normal','matchday')
  )
);

comment on table public.daily_payload is 'Registro canônico do dia (DeliveryPayload.Daily). Upsert on_conflict=date com o payload JSON inteiro; seção vazia nunca é omitida (items: [] + status: "empty").';
comment on column public.daily_payload.payload_status is 'Coluna gerada = payload->>''status'' (draft | approved | published | failed) para filtrar sem abrir o JSON.';
comment on column public.daily_payload.payload_mode is 'Coluna gerada = payload->>''mode'' (normal | matchday).';

create index if not exists ix_daily_payload_status on public.daily_payload (payload_status, date desc);

drop trigger if exists trg_daily_payload_updated_at on public.daily_payload;
create trigger trg_daily_payload_updated_at
  before update on public.daily_payload
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. sources — allowlist de fontes de notícia (mantida por humano)
-- ----------------------------------------------------------------------------
create table if not exists public.sources (
  source_id    text primary key,                         -- ex.: ge_flamengo
  source_name  text not null,                            -- ex.: ge Flamengo
  site_url     text not null,                            -- página principal da fonte
  feed_url     text,                                     -- RSS/feed usado pelo ingest (se houver)
  kind         text not null default 'news' check (kind in ('news','social','outros')),
  enabled      boolean not null default true,            -- false = scraper ignora (regra: nova fonte só entra por humano)
  notes        text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.sources is 'Allowlist de fontes (gemini.md). Regra: scraper ignora domínio fora desta lista; nova fonte só entra se o humano adicionar aqui.';

drop trigger if exists trg_sources_updated_at on public.sources;
create trigger trg_sources_updated_at
  before update on public.sources
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 6. accounts — allowlist de contas da Nação (mantida por humano; máx. 20 no MVP)
-- ----------------------------------------------------------------------------
create table if not exists public.accounts (
  account_id   text primary key,                         -- ex.: x_colunadofla
  handle       text not null unique,                     -- ex.: @ColunadoFla
  platform     text not null default 'x' check (platform in ('x','youtube','instagram','tiktok','facebook','web')),
  kind         text not null default 'cobertura' check (kind in ('oficial','cobertura')),
  notes        text not null default '',
  enabled      boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.accounts is 'Allowlist de contas curadas (gemini.md): oficiais (@Flamengo, @flamengo_en) + cobertura verificada. Não incluir conta aleatória; máximo 20 no MVP.';

drop trigger if exists trg_accounts_updated_at on public.accounts;
create trigger trg_accounts_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 7. agent_pings — handshake da Phase L (tools/ping_supabase.py)
-- ----------------------------------------------------------------------------
create table if not exists public.agent_pings (
  id         bigint generated always as identity primary key,
  probe      text not null,                              -- ex.: central-da-nacao
  message    text not null default '',
  created_at timestamptz not null default now()
);

comment on table public.agent_pings is 'Tabela de handshake usada por tools/ping_supabase.py (write/read de teste). Sem RLS de leitura pública.';

-- ============================================================================
-- Row Level Security (RLS)
-- Modelo: escrita apenas via service_role (tools/rodam com SUPABASE_KEY de
-- serviço e ignoram RLS por padrão). O público (anon) só LÊ o que já foi
-- aprovado/publicado. Sem política de escrita para anon — nada de insert/
-- update/delete público.
-- ============================================================================

alter table public.news_cards    enable row level security;
alter table public.matches       enable row level security;
alter table public.venues        enable row level security;
alter table public.daily_payload enable row level security;
alter table public.sources       enable row level security;
alter table public.accounts      enable row level security;
alter table public.agent_pings   enable row level security;

-- Leitura pública (home/Web App com anon key):
drop policy if exists news_cards_select_public on public.news_cards;
create policy news_cards_select_public on public.news_cards
  for select to anon, authenticated
  using (needs_review = false);

drop policy if exists matches_select_public on public.matches;
create policy matches_select_public on public.matches
  for select to anon, authenticated
  using (true);

drop policy if exists venues_select_public on public.venues;
create policy venues_select_public on public.venues
  for select to anon, authenticated
  using (status = 'verified');

drop policy if exists daily_payload_select_public on public.daily_payload;
create policy daily_payload_select_public on public.daily_payload
  for select to anon, authenticated
  using (payload_status = 'published');

drop policy if exists sources_select_public on public.sources;
create policy sources_select_public on public.sources
  for select to anon, authenticated
  using (enabled);

drop policy if exists accounts_select_public on public.accounts;
create policy accounts_select_public on public.accounts
  for select to anon, authenticated
  using (enabled);

-- agent_pings: sem política de leitura pública (apenas service_role).

-- Grants explícitos (reforço; o Supabase já concede por default privilege):
grant select on public.news_cards, public.matches, public.venues,
  public.daily_payload, public.sources, public.accounts
  to anon, authenticated;

-- ============================================================================
-- Fim do 01_schema.sql
-- Próximo: 02_seed_allowlists.sql (carga inicial de sources e accounts).
-- ============================================================================
