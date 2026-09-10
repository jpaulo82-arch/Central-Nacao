# Central da Nação — Schema Supabase (MVP)

> Pacote de Integração e Finalização · pt-BR · 2026-09-09
> Contratos: `gemini.md` (Project Constitution) + `tools/` (código Python da Phase L).

Este diretório contém os scripts SQL que criam as tabelas do MVP no Supabase,
seguindo os contratos de `gemini.md` e compatíveis com o que as tools de
`tools/` já escrevem/lêem via PostgREST (`supabase_client.py`).

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `01_schema.sql` | Cria as 6 tabelas do contrato (`news_cards`, `matches`, `venues`, `daily_payload`, `sources`, `accounts`) + `agent_pings` (handshake da Phase L), constraints dos enums, índices, trigger de `updated_at`, RLS e grants. |
| `02_seed_allowlists.sql` | Carga inicial de `sources` (8 fontes) e `accounts` (3 contas), conforme allowlists de `gemini.md`/`tools/sources.py`. Idempotente (`ON CONFLICT DO NOTHING`). |
| `README.md` | Este guia. |

## Como executar

1. Entre no [Supabase Dashboard](https://supabase.com/dashboard) do projeto (o mesmo de `SUPABASE_URL`).
2. Abra **SQL Editor** → **New query**.
3. Cole e execute **`01_schema.sql`**; depois **`02_seed_allowlists.sql`**, nesta ordem.
4. Confira o resultado em **Table Editor**: devem existir 7 tabelas (as 6 do contrato + `agent_pings`).

> Os dois scripts são idempotentes: podem ser reexecutados sem erro.
> RLS fica ativo desde o início; o acesso com a **service key** (`SUPABASE_KEY` usada pelas tools) ignora RLS por padrão.

## Mapa de colunas × contrato (o que cada tabela guarda)

| Tabela | Contrato (`gemini.md`) | Quem escreve | Quem lê |
|---|---|---|---|
| `news_cards` | `ProcessedOutput.NewsCard` | `write_cards.py` (upsert por `card_id`) | Web App (cards sem `needs_review`), editor |
| `matches` | `RawInput.Match` | worker matchday / ponte de ingestão (estado real; **mock nunca vai para produção**) | Web App (match center), `emit_match_tick` |
| `venues` | `RawInput.Venue` | humano/editor (Table Editor ou formulário futuro) | `ingest_venues.py`, Web App (mapa) |
| `daily_payload` | `DeliveryPayload.Daily` | `publish_payload.py` (upsert por `date`; rascunho pode ser gravado pela ponte do GitHub Actions) | Web App (home renderiza o último `published`) |
| `sources` | allowlist de fontes | humano | Web App / futura ingestão dinâmica |
| `accounts` | allowlist de contas (máx. 20) | humano | Web App / curadoria |
| `agent_pings` | — (handshake) | `ping_supabase.py` | testes |

## Decisões de modelagem (leia antes de alterar)

- **Enums como TEXT + CHECK** (e não `CREATE TYPE`): garante compatibilidade total
  com o upsert em lote do PostgREST usado pelas tools e evita `ALTER TYPE` para
  evoluir allowlists. Os `CHECK` espelham **exatamente** os enums da Constitution.
  Se um dia quiser enum nativo, crie o tipo e faça `ALTER TABLE ... ALTER COLUMN ...
  USING (col::tipo)`.
- **`daily_payload.payload` é JSONB** (o contrato é um JSON inteiro; a ferramenta
  faz upsert do objeto). `payload_status` e `payload_mode` são **colunas geradas**
  a partir do JSON para consultas baratas: `where payload_status = 'published'`.
- **`matches.broadcast` e `venues.geo` são JSONB** para preservar a forma exata
  do contrato (`["Globo","Premiere"]` e `{"lat": ..., "lng": ...}`).
- Colunas `created_at`/`updated_at` são de infraestrutura (não estão nos
  contratos); `updated_at` é mantido por trigger.
- **RLS**: o público (`anon`) só lê conteúdo publicado/aprovado — `daily_payload`
  com `payload_status = 'published'`, `news_cards` sem `needs_review`, `venues`
  `verified`, allowlists habilitadas. **Nenhuma escrita pública.**

## Integração com o pipeline

- As tools leem `.env` (`SUPABASE_URL`, `SUPABASE_KEY` — key de **service role**,
  nunca a anon em código server-side).
- Teste do handshake depois do schema no ar:
  ```bash
  cd tools && cp .env.example .env   # preencha SUPABASE_URL e SUPABASE_KEY
  python3 ping_supabase.py
  ```
  Esperado: grava e relê em `agent_pings` (write/read OK).
- Caminho offline continua valendo: sem credenciais, o pipeline roda com
  fixtures e `.tmp/` — só não há escrita em nuvem (o report marca `cloud: pending`).

## Evolução / manutenção

- Mudança de coluna: prefira `ALTER TABLE ... ADD COLUMN` (aditivo), atualize o
  SOP correspondente em `architecture/` **antes** do código (Golden Rule) e
  registre em `progress.md`.
- Nova fonte/conta: insert/update direto na tabela (humano) + `gemini.md`, se a
  allowlist de lá também mudar.
- Rollback de schema em ambiente real: use o versionamento do Supabase
  (migrations) ou recrie o banco em ambiente de teste antes de aplicar em produção.
