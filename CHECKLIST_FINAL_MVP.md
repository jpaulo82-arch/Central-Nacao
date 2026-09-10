# Checklist Final do MVP — Central da Nação (Definition of Done)

> Documento de Integração e Finalização · pt-BR · 2026-09-10 (atualizado com webapp)
> Consolida o Definition of Done do blueprint (`BLAST_Central_da_Nacao_SYSTEM_PROMPT.md`),
> os checklists de `task_plan.md` e o que esta fase de Integração entrega.
> Legenda: ✅ concluído e verificado · 🟡 entregue, aguarda ambiente real · ⬜ pendente de humano/ambiente

---

## 1. Fundação (Protocol 0) — ✅ conforme `progress.md`

- [x] ✅ Constitution em `gemini.md` (schemas, enums, invariantes, allowlists)
- [x] ✅ Blueprint em `task_plan.md`; `findings.md` e `progress.md` mantidos
- [x] ✅ 12 SOPs em `architecture/` (00 → 90), escritos antes do código
- [x] ✅ Fixtures de teste (`match_scheduled`, `match_live_goal`, `news_bundle` com 8 itens, 2 duplicados, 1 oficial, 1 rumor)
- [x] ✅ `.env.example` sem valores reais

## 2. Link / Pipeline Python (Phase L) — ✅ offline, 🟡 integrações reais

- [x] ✅ Tools atômicas implementadas em `tools/` (14 scripts + schemas + testes)
- [x] ✅ Suíte offline verde (`pytest -q`: 3 passed) e `--help` OK nas tools
- [x] ✅ `news_cards`, `daily_payload`, `venues` e `agent_pings` compatíveis com o código (ver `supabase/`)
- [ ] 🟡 Ping Supabase real (após aplicar `supabase/01_schema.sql` + `02_seed_allowlists.sql`): `python3 ping_supabase.py`
- [ ] 🟡 Ping webhook real: `python3 ping_webhook.py`
- [ ] 🟡 Ping RSS real (fontes da allowlist expõem feed? ge/RSSHub etc. — validar domínio a domínio)
- [ ] 🟡 Ping LLM real (`LLM_API_KEY` de OpenAI/Anthropic/Gemini)
- [ ] 🟡 Ping API de futebol real (decidir **api-futebol.com.br** ou **api-sports.io**; sem key o pipeline roda mock, sem publicar mock na nuvem)

## 3. Dados na nuvem — Supabase (esta fase) — 🟡 aguarda aplicação

- [x] ✅ Scripts SQL criados: `supabase/01_schema.sql` (7 tabelas + RLS) e `supabase/02_seed_allowlists.sql`
- [x] ✅ Sintaxe validada com parser PostgreSQL 17 (67 + 2 statements)
- [ ] 🟡 Executar os scripts no SQL Editor do projeto Supabase (ordem 01 → 02)
- [ ] 🟡 Conferir no Table Editor: `news_cards`, `matches`, `venues`, `daily_payload`, `sources`, `accounts`, `agent_pings`
- [ ] 🟡 Seeds conferidos: 8 fontes em `sources`, 3 contas em `accounts`
- [ ] 🟡 RLS conferido: `anon` só lê publicado/aprovado; escrita só via service role
- [ ] 🟡 5 cidades piloto no mapa (podem ter 0 venues — DoD do blueprint)
- [ ] ⬜ Venues preenchidos por humano (Table Editor/formulário documentado no SOP 60) — `status=verified` para entrar no payload

## 4. Automação GitHub Actions (esta fase) — 🟡 aguarda repositório/segredos

- [x] ✅ Workflow diário `central-da-nacao-diario.yml` com os crons do blueprint em BRT (convertidos p/ UTC):
  - ingest 06:30 BRT → `30 9 * * *`; build 07:15 → `15 10 * * *`; publish 07:45 → `45 10 * * *`
  - refresh 12:00 e 18:00 → `0 15,21 * * *`; venues semanal segunda 10:00 → `0 13 * * 1`
- [x] ✅ Worker matchday `central-da-nacao-matchday.yml` (poll a cada 5 min — limite da plataforma; guard de janela kickoff−90min…FT+30)
- [x] ✅ Ponte de estado entre runners efêmeros: artefatos `cdn-ingest-<data>` → `cdn-built-<data>` + fallback Supabase (`state_bridge.py`)
- [x] ✅ Scripts auxiliares do runner em `.github/scripts/`: `state_bridge.py` (upsert Supabase), `matchday_window.py` (cálculo de janela), `notify_tick.py` (webhook tick) — compilados e verificados
- [x] ✅ Deploy da Web App no GitHub Pages `central-da-nacao-deploy-webapp.yml` (reutilizável; dispara quando o publish publica)
  - Define `NEXT_OUTPUT_MODE=export` no build para ativar a saída estática do next.config.js
  - Remove automaticamente (via `sed` no runner efêmero) a diretiva `force-dynamic` incompatível com export — os arquivos no repositório ficam intactos
- [x] ✅ Gate editorial preservado: sem `approved` e com `AUTO_PUBLISH=false` o payload permanece `draft` e a home NÃO atualiza
- [ ] 🟡 Copiar `.github/`, `supabase/`, `tools/`, `webapp/` para o repositório (raiz do monorepo)
- [ ] 🟡 Configurar segredos e variáveis do repositório (ver `GUIA_DE_CONFIGURACAO_ENV.md`)
- [ ] 🟡 GitHub Pages: Settings → Pages → Source **GitHub Actions**; confirmar 1º deploy
- [ ] 🟡 Primeira execução observada (ingest → build → publish com payload em `status=draft` é o comportamento esperado sem aprovação)
- [ ] ⬜ (Recomendado) Reação do editor ✅ integrada ao publish: hoje o MVP aprova por execução manual do job `publish` com `decision=approved` ou `AUTO_PUBLISH=true`

## 5. Home pública (Phase S) — Web App Next.js — ✅ código presente e verificado

- [x] ✅ Código da Web App em `webapp/` — Next.js 16 com `NEXT_OUTPUT_MODE` controlado por variável de ambiente
- [x] ✅ `lib/supabase.ts` — cliente Supabase anon com **fallback automático para fixtures** quando sem credenciais (sem tela branca no 1º deploy)
- [x] ✅ `lib/data.ts` — busca isomórfica: Supabase (produção) → fixtures (demo); tabelas `news_cards`, `matches`, `venues`, `daily_payload` mapeadas
- [x] ✅ `lib/types.ts` — tipos `NewsCard` (SeloTipo alinhado com enum `stamp` do gemini.md), `Match`, `SocialPost`, `Corte`, `Venue`
- [x] ✅ `components/central/` — hub completo: `hub-client.tsx`, `news-card.tsx`, `match-card.tsx`, `venue-card.tsx`, seções Agora / Nação / Cortes / Perto de você, `hero-banner.tsx`, `demo-indicator.tsx`, header, footer
- [ ] 🟡 Conferir rodapé "Veículo independente. Não somos o Flamengo." ao vivo (exigido pelo blueprint)
- [ ] 🟡 Conferir visual ao vivo: preto/vermelho/branco; mobile first; cards com selo colorido + fonte + "ler na origem"; **sem escudo oficial do CRF**
- [ ] 🟡 Primeiro deploy bem-sucedido no GitHub Pages (URL confirmada no job summary do workflow)
- [ ] ⬜ Nenhum vídeo oficial do clube no módulo Cortes (regra de conteúdo, não de código)

## 6. Regras de negócio que NÃO podem regredir (aceite final)

- [ ] ✅ Selo `oficial` só com URL de domínio oficial allowlist; `rumor` com gatilhos sem confirmação cruzada; ambíguo → `needs_review: true`
- [ ] ✅ Dedupe > 0.82 mantém a mais antiga (+ oficial se houver), preenchendo `duplicate_of`
- [ ] ✅ Seção vazia do payload nunca é omitida (`items: []` + `status: "empty"`)
- [ ] ✅ Ticks de jogo publicam sem aprovação (vêm da API); **mock nunca é sincronizado na nuvem**
- [ ] ✅ Timezone America/Sao_Paulo em tudo (crons convertidos; ISO com −03:00)
- [ ] ✅ Secrets só em `.env`/GitHub Secrets; `.env` e `.env.example` sem valores reais em git

## 7. Encerramento (Phase 5 — Trigger)

- [ ] ⬜ Maintenance Log preenchido em `gemini.md` (última execução ok, rate limits, fontes que falharam nas últimas 24h, editor(a) de plantão)
- [ ] ⬜ Registro no `progress.md` da primeira publicação real (data, status, evidência)
- [ ] ⬜ **Complete (regra BLAST):** Daily Payload do dia publicado na nuvem (`daily_payload` com `status=published`) + home no GitHub Pages no ar

---

## Resumo executivo

| Área | Status |
|---|---|
| Fundação e pipeline offline | ✅ pronto |
| SQL Supabase (schemas + seeds + RLS) | ✅ entregue e validado; 🟡 aplicar no projeto Supabase |
| GitHub Actions (crons + matchday + Pages) | ✅ entregue e corrigido (YAML válido, scripts compilam) |
| Scripts auxiliares (`.github/scripts/`) | ✅ `state_bridge.py`, `matchday_window.py`, `notify_tick.py` |
| Web App Next.js (`webapp/`) | ✅ código presente; `lib/`, `components/central/`, `app/` verificados |
| Deploy estático (GitHub Pages) | ✅ workflow corrigido: `NEXT_OUTPUT_MODE=export` + patch `force-dynamic` |
| Checklist final | este documento — revisar itens 🟡/⬜ com o Product Owner |

**Próximos passos críticos (em ordem):**
1. Aplicar `supabase/01_schema.sql` → `02_seed_allowlists.sql` no SQL Editor do Supabase
2. Configurar Secrets e Variáveis no repositório GitHub (ver `GUIA_DE_CONFIGURACAO_ENV.md`)
3. Settings → Pages → Source **GitHub Actions**
4. Executar manualmente o job `ingest` e depois `publish` com `decision=approved` (teste ponta a ponta)
5. Conferir a URL do GitHub Pages no job summary
