# Progress — Central da Nação

> Log do que foi feito, erros e testes. Manter atualizado a cada execução (obrigatório no Protocol 0 e na Phase L).
> Timezone do log: America/Sao_Paulo. Formato: `- YYYY-MM-DD HH:MM -03 | fase | feito/erro/teste | detalhe`.

---

## 2026-09-09 — Protocol 0 (Initialization)

- `2026-09-09 ~17:30 -03 | Protocol 0 | feito | Blueprint lido integralmente` — `BLAST_Central_da_Nacao_SYSTEM_PROMPT.md` v1.0 (2026-09-09), 531 linhas. Estrutura B.L.A.S.T. + A.N.I. mapeada.
- `2026-09-09 ~17:30 -03 | Protocol 0 | feito | Memória do projeto criada` — `gemini.md` (CONSTITUTION integral: invariantes, enums, schemas JSON, allowlists, cidades piloto) e `task_plan.md` (BLUEPRINT integral + checklists das fases + Definition of Done).
- `2026-09-09 ~17:40 -03 | Protocol 0 | feito | Pesquisa GitHub concluída` — eixos RSS Flamengo / wrappers API-Futebol·API-Football / n8n sports news. Metadados verificados via API pública do GitHub (2026-09-09). Top 5 registrados em `findings.md`; repositório “flamengo-rss” dedicado descartado (sem licença/README/inativo).
- `2026-09-09 ~17:45 -03 | Protocol 0 | feito | Arquivos-base criados` — `findings.md` (pesquisa + constraints + lacunas), `progress.md` (este), `.env.example` (todas as variáveis, sem valores reais).
- `2026-09-09 ~18:00 -03 | Protocol 0 | feito | SOPs criados` — 12 arquivos em `architecture/` (00_overview → 90_self_annealing), cada um com objetivo, input/output schema, passos determinísticos, edge cases e rate limits.
- `2026-09-09 ~18:10 -03 | Protocol 0 | feito | Fixtures criados` — `fixtures/match_scheduled.json`, `fixtures/match_live_goal.json`, `fixtures/news_bundle.json` (8 itens: 2 duplicados entre si, 1 oficial, 1 rumor; todos de domínios da allowlist).
- `2026-09-09 ~18:10 -03 | Protocol 0 | teste | Validação dos fixtures` — parse JSON ok nos 3 arquivos; `news_bundle` com 8 itens; similaridade do par duplicado > 0.82 (regra de dedupe); exatamente 1 URL de domínio oficial; item de rumor com gatilhos (“sonda/negociação”) sem confirmação cruzada. **Nenhum teste de integração executado** — Halt Execution até o humano autorizar a Phase L.

## Erros conhecidos

- Nenhum erro até o momento (2026-09-09). Fase é de fundação; ainda não há chamadas externas.

## Pendências / próximos passos

1. **Aguardando humano:** confirmação “pode ir para o Link” (Phase L).
2. **Decisões humanas necessárias** (não inventar): provedor de futebol (api-futebol.com.br ou api-sports.io); provedor LLM; Google Sheets (default) ou Supabase; Slack ou Discord para o editor.
3. **Credenciais para a Phase L:** `API_FUTEBOL_KEY`, `LLM_API_KEY`, `GOOGLE_SERVICE_ACCOUNT` (+ id da planilha) ou `SUPABASE_URL`/`SUPABASE_KEY`, `EDITOR_WEBHOOK_URL` — ver `findings.md` §5 e `.env.example`.
4. Fase L: criar `tools/ping_sheets.py`, `tools/ping_webhook.py`, `tools/ping_football_api.py`, `tools/ping_rss.py`, `tools/ping_llm.py` (nesta ordem de obrigatoriedade: 1, 2 e 4 travam o pipeline).


## 2026-09-09 — Revisão final do Protocol 0

- `2026-09-09 ~18:20 -03 | Protocol 0 | teste | Revisão de consistência dos artefatos` — parse JSON OK nos 3 fixtures; `news_bundle.json`: 8 itens, chaves idênticas ao contrato `RawInput.NewsItem`, exatamente 1 URL de domínio oficial (flamengo.com.br), 1 item com gatilho de rumor sem confirmação cruzada, todos os domínios dentro da allowlist, `fetched_at > published_at` em todos.
- `2026-09-09 ~18:20 -03 | Protocol 0 | teste | Ajuste do par duplicado` — título do item 4 (Lance!) encurtado para variante realista; similaridade de título do par 3×4 (ge × Lance!) agora em **0.925** (regra: > 0.82); nenhum outro par ≥ 0.82. Regra de dedupe mantém o item 3 (ge, publicado 07:08 — o mais antigo; sem oficial no par).
- `2026-09-09 ~18:20 -03 | Protocol 0 | feito | 12 SOPs conferidos` — arquivos `00_overview.md` a `90_self_annealing.md` presentes em `architecture/`, cada um com objetivo, input/output, passos determinísticos, edge cases e rate limits (golden rule registrada em todos).
- `2026-09-09 ~18:20 -03 | Protocol 0 | status | HALT mantido` — nenhum ping/script de `tools/` foi criado nem executado. Próximo passo depende da confirmação humana: **“pode ir para o Link”** (Phase L).


## 2026-09-09 — Phase L (Link) / implementação do pipeline Python em /home/ubuntu/tools

- `2026-09-09 18:27 -03 | Phase L | feito | Estrutura de projeto criada em /home/ubuntu/tools` — diretórios `schemas/`, `tests/`, `.tmp/` e módulos de apoio (`common.py`, `config.py`, `schema_loader.py`, `supabase_client.py`, `football_adapter.py`, `llm_adapter.py`, `news_logic.py`, `rss_client.py`, `sources.py`).
- `2026-09-09 18:27 -03 | Phase L | feito | Schemas JSON formais criados` — contratos `RawInput.NewsItem`, `RawInput.Match`, `RawInput.Venue`, `ProcessedOutput.NewsCard`, saída LLM e payloads `DeliveryPayload.Daily`/`DeliveryPayload.MatchTick` em `tools/schemas/`.
- `2026-09-09 18:27 -03 | Phase L | feito | Tools CLI implementadas` — `ping_supabase.py`, `ping_webhook.py`, `ping_football_api.py`, `ping_rss.py`, `ping_llm.py`, `ingest_news.py`, `ingest_match.py`, `ingest_venues.py`, `classify_and_dedupe.py`, `write_cards.py`, `build_daily_payload.py`, `emit_match_tick.py`, `send_editor_queue.py`, `publish_payload.py`.
- `2026-09-09 18:27 -03 | Phase L | feito | Artefatos de apoio adicionados` — `.env.example` com placeholders, `requirements.txt`, `README.md` em pt-BR e fixture de venues para testes offline.
- `2026-09-09 18:27 -03 | Phase L | teste | Suíte offline executada com sucesso` — comando `pytest -q` em `/home/ubuntu/tools`: **3 passed** (cobre pings offline, pipeline completo com fixtures e emissão de tick de gol).
- `2026-09-09 18:27 -03 | Phase L | teste | Verificação de CLI` — `python3 <tool>.py --help` executado para todas as 14 tools com retorno OK.
- `2026-09-09 18:30 -03 | Phase L | feito | Arquivos finais salvos em swarm_shared_files` — cópia do pipeline em `tools/` (14 scripts + schemas + testes + README) e `.env.example` restaurado na raiz (placeholders, sem valores reais).
