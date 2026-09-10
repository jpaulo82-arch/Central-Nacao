-- ============================================================================
-- Central da Nação — Seed inicial das allowlists (Supabase)
-- Arquivo: supabase/02_seed_allowlists.sql
-- Fase: Integração e Finalização | Data: 2026-09-09
--
-- Carga inicial de `sources` e `accounts` com os valores canônicos de
-- `gemini.md` (Allowlist inicial de fontes/contas), espelhando as constantes
-- de `tools/sources.py` (SOURCES / SOCIAL_ALLOWLIST).
--
-- Importante: allowlist é mantida por HUMANO. Este seed roda uma única vez em
-- banco novo (ON CONFLICT DO NOTHING): não sobrescreve edições humanas nem
-- reativa o que foi desabilitado.
-- Cidades piloto e venues: começam vazias (5 cidades com 0 itens — DoD MVP).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Fontes de notícia (allowlist de domínios do scraper)
-- ----------------------------------------------------------------------------
insert into public.sources (source_id, source_name, site_url, feed_url, kind, enabled, notes)
values
  ('flamengo_oficial', 'Flamengo (site oficial)', 'https://www.flamengo.com.br/noticias', 'https://www.flamengo.com.br/rss/noticias.xml', 'news', true,
   'Domínio oficial — única fonte que pode gerar selo "oficial".'),
  ('ge_flamengo',      'ge Flamengo',             'https://ge.globo.com/futebol/times/flamengo', 'https://ge.globo.com/rss/ge/futebol/times/flamengo/', 'news', true,
   'Imprensa/cobertura — agregar card e linkar origem, não copiar texto integral.'),
  ('lance_flamengo',   'Lance! Flamengo',         'https://www.lance.com.br/flamengo', 'https://www.lance.com.br/rss/flamengo.xml', 'news', true,
   'Imprensa/cobertura.'),
  ('colunadofla',      'Coluna do Fla',           'https://colunadofla.com', 'https://colunadofla.com/feed/', 'news', true,
   'Imprensa/cobertura.'),
  ('fla10',            'Fla10',                   'https://fla10.news', 'https://fla10.news/feed/', 'news', true,
   'Imprensa/cobertura.'),
  ('serflamengo',      'Ser Flamengo',            'https://serflamengo.com.br', 'https://serflamengo.com.br/feed/', 'news', true,
   'Imprensa/cobertura.'),
  ('uol_flamengo',     'UOL Esporte',             'https://www.uol.com.br/esporte', 'https://rss.uol.com.br/feed/esporte.xml', 'news', true,
   'Imprensa/cobertura — filtro Flamengo na ingestão.'),
  ('cnn_flamengo',     'CNN Brasil Esportes',     'https://www.cnnbrasil.com.br/esportes', 'https://www.cnnbrasil.com.br/esportes/feed/', 'news', true,
   'Imprensa/cobertura — filtro Flamengo na ingestão.')
on conflict (source_id) do nothing;

-- ----------------------------------------------------------------------------
-- 2. Contas da Nação (timeline curada — MVP manual/embed, sem API do X)
-- ----------------------------------------------------------------------------
insert into public.accounts (account_id, handle, platform, kind, enabled, notes)
values
  ('x_flamengo_oficial', '@Flamengo',     'x', 'oficial',   true, 'Conta oficial do Clube de Regatas do Flamengo.'),
  ('x_flamengo_en',      '@flamengo_en',  'x', 'oficial',   true, 'Conta oficial em inglês.'),
  ('x_colunadofla',      '@ColunadoFla',  'x', 'cobertura', true, 'Cobertura verificada (allowlist inicial).')
on conflict (account_id) do nothing;

-- ============================================================================
-- Fim do 02_seed_allowlists.sql
-- Verificação rápida (opcional):
--   select source_id, source_name, enabled from public.sources order by source_id;
--   select handle, kind, enabled from public.accounts order by handle;
-- ============================================================================
