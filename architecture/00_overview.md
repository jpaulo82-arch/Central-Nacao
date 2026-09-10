# SOP 00 — Overview: fluxo do dia

> Camada A.N.I.: Architecture · Aplica-se a: todas as tools · Versão: 1.0 (Protocol 0, 2026-09-09)
> Golden Rule: mudou a lógica → atualiza o SOP → só então o código.

## Objetivo

Descrever o fluxo diário completo da Central da Nação (modo normal e modo matchday), a ordem de chamada das tools e as regras transversais que todo SOP e toda tool devem respeitar.

## Quando roda

| Trigger | Hora / evento (America/Sao_Paulo) | Tools | Aprovação? |
|---|---|---|---|
| Cron daily ingest | 06:30 | ingest_* | não |
| Cron daily build | 07:15 | classify, write_cards, build, send_queue | sim (fila) |
| Cron publish | 07:45 | publish se approved | — |
| Cron refresh | 12:00 e 18:00 | ingest + rebuild cards novos | cards novos na fila |
| Matchday poll | kickoff-90min até FT+30 | poll_match a cada 30s | ticks da API sem aprovação |
| Venue weekly | segunda 10:00 | ingest_venues | venues novos pending |

Modo matchday se existir jogo `profissional_m` nas próximas 18 horas.

## Input / Output

- **Input:** allowlists e regras de `gemini.md`; credenciais de `.env`; horário atual em America/Sao_Paulo.
- **Output:** Daily Payload (`DeliveryPayload.Daily`) em `status=draft|approved|published|failed` + registro canônico na cloud (aba `daily_payload`) + HTML da home (fase S); MatchTick (`DeliveryPayload.MatchTick`) quando houver evento de jogo.

## Fluxo (Navigation)

```
ingest_news → ingest_match → ingest_social
        ↓
classify_and_dedupe → write_cards
        ↓
build_daily_payload → send_editor_queue
        ↓
(aguardar aprovação humana no MVP)
        ↓
publish_payload
```

Matchday (worker paralelo): `poll_match → if event: emit_match_tick → publish_tick`

## Passos determinísticos (dia normal)

1. 06:30 — rodar `ingest_news` (SOP 10), `ingest_match` (SOP 11), `ingest_social` (SOP 12 — no MVP: apenas curadoria/embed, sem API do X). Tudo vai para `.tmp/` (bancada).
2. 07:15 — rodar `classify_and_dedupe` (SOP 20) sobre o lote novo; `write_cards` (SOP 21) grava os cards válidos; `build_daily_payload` (SOP 30) monta o payload com as 4 seções; `send_editor_queue` (SOP 40) posta o bloco “Hoje na Nação” no webhook do editor.
3. 07:15–07:45 — janela humana: ✅ Publicar / ✏️ Pedir edição / 🗑️ Segurar (SOP 40).
4. 07:45 — cron publish: se `approved` → `publish_payload` (SOP 50). Se não houve resposta E `AUTO_PUBLISH=false` → payload fica `status=draft` e **não** vai para a home.
5. 12:00 e 18:00 — refresh: ingest de novos itens + rebuild dos cards novos → cards novos entram na fila (nunca publicam direto na home).
6. Em dia de jogo (`profissional_m` nas próximas 18h): worker de matchday (SOP 31) roda de kickoff−90min até FT+30, e o match center fica no topo da seção `agora`.

## Regras transversais (invariantes)

1. LLM não decide negócio: preenche campos do schema; JSON Schema inválido → descarte + `needs_review: true`.
2. Tools atômicas: uma tool, uma responsabilidade, um JSON de saída.
3. `.tmp/` é bancada; **verdade = cloud**. Complete (regra BLAST) só quando o payload estiver no destino cloud.
4. Secrets só em `.env`; timezone America/Sao_Paulo; `AUTO_PUBLISH=false` até o editor mandar o contrário.
5. Seção vazia do payload nunca é omitida: `items: []` + `status: "empty"`.
6. Toda tool de lógica passa nos fixtures de `fixtures/` antes de tocar API real.
7. Erro em qualquer etapa → SOP 90 (self-annealing): ler stack → patch → testar → registrar aprendizado no SOP; falhas também vão para `progress.md` e `findings.md`.

## Edge cases (visão geral)

- Ping obrigatório da Phase L falhou → tool de lógica daquela integração não avança (as demais seguem).
- Sem jogo próximo → `agora.match = null`, modo `normal`.
- Fonte fora da allowlist → ignorada e logada (SOP 10).
- Webhook fora do ar na janela de aprovação → retry com backoff; sem resposta até 07:45 → `status=draft` (SOP 40/50).

## Rate limits / limites conhecidos

- Respeitar os limites específicos de cada SOP (10: politeness por domínio; 11: plano da API de futebol; 40: quotas de webhook).
- Nenhum limite global adicional no MVP; registrar qualquer limite observado no Maintenance Log (`gemini.md`, fase T).

## Testes

- Fixtures: `fixtures/match_scheduled.json`, `fixtures/match_live_goal.json`, `fixtures/news_bundle.json`.
- Definição de Complete: payload publicado na cloud (sheet `daily_payload` + HTML no ar) — ver Definition of Done em `task_plan.md`.
