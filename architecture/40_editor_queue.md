# SOP 40 — Editor Queue (fila de aprovação)

> Camada A.N.I.: Instruments-Tools (send_editor_queue.py) · Versão: 1.0 (Protocol 0, 2026-09-09)
> Golden Rule: mudou a lógica → atualiza o SOP → só então o código.

## Objetivo

Postar o rascunho do dia no webhook do editor (Slack/Discord) como bloco “Hoje na Nação” e administrar a janela humana de aprovação **MVP** (07:15 → 07:45): reações/botões ✅ Publicar · ✏️ Pedir edição · 🗑️ Segurar. Sem aprovação, nada vai para a home pública (regra `AUTO_PUBLISH=false`).

## Quando roda

- Cron daily build 07:15, logo após `build_daily_payload` (SOP 30).
- Refreshes 12:00/18:00: cards novos → postagem de **cards novos na fila** (nunca republicar o bloco inteiro sem necessidade).

## Input

- `DeliveryPayload.Daily` (draft) de `.tmp/payload/<YYYY-MM-DD>.json`.
- Webhook: `EDITOR_WEBHOOK_URL` (Slack ou Discord — decisão humana) em `.env`.
- Reações do editor no canal (MVP conceitual: mesmo que o callback seja manual no início).

## Output

- Mensagem/bloco no canal do editor (formato visual definido na Phase S — Stylize; estrutura de dados abaixo independe do visual).
- Estado da decisão → `.tmp/queue/<YYYY-MM-DD>.json`: `{ "decision": "approved|edit|hold|none", "decided_at": "...", "editor_notes": [] }`.
- Payload atualizado em `status`: `approved` | `draft` (hold/sem resposta) quando o SOP 50 rodar.

## Passos determinísticos

1. Ler o payload draft do dia.
2. Montar o bloco “Hoje na Nação” com: data, modo (`normal|DIA DE JOGO`), 📌 AGORA (headline + cards: título + selo + fonte), 📣 NAÇÃO (até 5 posts), 🎬 CORTES (nº de lances e memes), 📍 PERTO DE VOCÊ (cidade + até 5 venues) — e as ações [✅ Publicar] [✏️ Pedir edição] [🗑️ Segurar].
3. Postar via webhook (1 tentativa + 2 retries com backoff 5s/30s).
4. Abrir a janela de decisão: **30 minutos** (07:15 → 07:45).
5. Coletar a decisão:
   - ✅ → marcar `approved` (+ `editor_notes` se houver).
   - ✏️ → marcar `edit`: anexar as notas do editor ao payload (`editor_notes`) e devolver para re-trabalho manual/humano da(s) seção(ões) apontada(s); após edição, novo bloco é postado.
   - 🗑️ → marcar `hold`: payload permanece `draft`, não vai para a home.
6. Sem resposta até 07:45 E `AUTO_PUBLISH=false` → `decision: "none"`; payload fica `status=draft` (SOP 50 não publica).
7. Gravar `.tmp/queue/<YYYY-MM-DD>.json` e reportar a decisão.

## Edge cases

- Webhook fora do ar na janela → retries; se seguir fora, registrar em `progress.md` e **não publicar nada** sem confirmação (falha segura).
- Editor responde depois das 07:45 → registrar a reação, mas o payload do dia já foi decidido (draft); reação tardia vale para o refresh das 12:00/18:00.
- ✏️ sem notas → pedir as notas antes de re-postar (evitar loop de edição vazia).
- Vários editores respondem → vale a **primeira** decisão recebida; logar as demais.
- Bloco muito longo → truncar seções por limite do canal (Slack ~4k chars, Discord maior) mantendo o resumo + link do payload completo.

## Rate limits / limites conhecidos

- Slack: mensagens por minuto por webhook (conservador: 1 msg/bloco por ciclo; retries espaçados). Discord: sem limite prático baixo, mas manter 1 bloco por ciclo.
- Callbacks: no MVP os botões são conceituais (blueprint) — a reação pode ser manual no canal.

## Testes

- Phase L: `tools/ping_webhook.py` — postar “pong” e confirmar entrega (registrar em `progress.md`).
- Simular as 3 reações num payload de teste (fixture) e conferir os estados `approved`/`edit`/`hold` + o caso “sem resposta → draft”.
