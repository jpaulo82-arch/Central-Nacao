# Project Constitution — Central da Nação

> **Origem:** cópia **integral** da seção `CONSTITUTION` do blueprint `BLAST_Central_da_Nacao_SYSTEM_PROMPT.md` v1.0 (2026-09-09), conforme Protocol 0.
> **Papel deste arquivo:** fonte canônica de schemas, enums, invariantes e allowlists. É o que o System Pilot consulta quando um campo, fonte, tom ou regra não está óbvio.
> **Regra-mãe:** se um campo, fonte, tom ou regra não estiver neste arquivo (ou no blueprint), o agente **PARA e pergunta** — nunca adivinha business logic.

---

## Architectural invariants

1. LLM não decide negócio. LLM preenche campos de um schema. Validação JSON Schema rejeita output inválido.
2. Tools são atômicas: uma tool, uma responsabilidade, um JSON de saída.
3. SOP em `architecture/` muda ANTES do código.
4. Secrets só em `.env`. Nunca commitar.
5. Intermediários em `.tmp/`. Payload final na cloud.
6. Self-annealing: erro → ler stack → patch → testar → registrar o aprendizado no SOP.
7. Timezone America/Sao_Paulo.
8. Flamengo profissional masculino é o default. Outras modalidades têm campo `team_unit`.

## Enums

```txt
team_unit: profissional_m | profissional_f | sub20 | base | basquete | volei | olimpicos | clube
category: jogo | mercado | lesao | bastidor | conselho | institucional | historia | meme | local | outro
stamp: oficial | confirmado | rumor | opiniao | meme | ugc
venue_type: bar | loja | embaixada | caravana | telão
venue_status: pending | verified | rejected | closed
payload_status: draft | approved | published | failed
```

## JSON Data Schema (contratos)

### RawInput.NewsItem
```json
{
  "source_id": "ge_flamengo",
  "source_name": "ge Flamengo",
  "url": "https://...",
  "title_raw": "",
  "summary_raw": "",
  "published_at": "2026-09-09T10:00:00-03:00",
  "fetched_at": "2026-09-09T11:00:00-03:00"
}
```

### RawInput.Match
```json
{
  "match_id": "brasileirao-2026-r24-fla-flu",
  "competition": "Brasileirão",
  "kickoff_iso": "2026-09-13T16:00:00-03:00",
  "home": "Flamengo",
  "away": "Fluminense",
  "venue": "Maracanã",
  "status": "scheduled",
  "score_home": null,
  "score_away": null,
  "lineup_confirmed": false,
  "broadcast": ["Globo", "Premiere"]
}
```

### RawInput.SocialPost
```json
{
  "platform": "x",
  "account": "@ColunadoFla",
  "post_id": "",
  "url": "",
  "text": "",
  "media_type": "none|image|video",
  "published_at": "",
  "metrics": { "likes": 0, "reposts": 0 }
}
```

### RawInput.Venue
```json
{
  "venue_id": "rio-bar-chicos",
  "name": "Bar dos Chicos",
  "type": "bar",
  "city": "Rio de Janeiro",
  "state": "RJ",
  "address": "",
  "geo": { "lat": null, "lng": null },
  "has_screen": true,
  "status": "verified",
  "matchday_note": "telão na calçada"
}
```

### ProcessedOutput.NewsCard
```json
{
  "card_id": "20260909-mercado-01",
  "title": "",
  "lede": "",
  "stamp": "rumor",
  "category": "mercado",
  "team_unit": "profissional_m",
  "source_name": "",
  "source_url": "",
  "needs_review": false,
  "duplicate_of": null
}
```

### DeliveryPayload.Daily (O PAYLOAD)
```json
{
  "date": "2026-09-09",
  "generated_at": "2026-09-09T07:15:00-03:00",
  "status": "draft",
  "mode": "normal|matchday",
  "agora": {
    "match": null,
    "headline": "",
    "cards": []
  },
  "nacao": {
    "status": "ok|empty",
    "items": []
  },
  "cortes": {
    "lances": [],
    "memes": []
  },
  "perto_de_voce": {
    "default_city": "Rio de Janeiro",
    "items": []
  },
  "editor_notes": []
}
```

### DeliveryPayload.MatchTick (evento ao vivo)
```json
{
  "match_id": "",
  "minute": 23,
  "type": "goal|card|lineup|kickoff|ht|ft",
  "text": "Gol do Flamengo. Pedro, 23'.",
  "score": "1-0",
  "publish_without_approval": true
}
```

Qualquer output de LLM que não valide contra o schema é descartado e a tool retorna `needs_review: true`.

## Allowlist inicial de fontes (news)

Oficial:
- https://www.flamengo.com.br/noticias

Imprensa / cobertura (agregar card, linkar origem, NÃO copiar integral):
- ge.globo.com/futebol/times/flamengo
- lance.com.br/flamengo
- colunadofla.com
- fla10.news
- serflamengo.com.br
- uol.com.br/esporte (filtro Flamengo)
- cnnbrasil.com.br/esportes (filtro Flamengo)

Regra: nova fonte só entra se o humano adicionar em `sources`. Scraper ignora domínio fora da lista.

## Allowlist inicial de contas (nacao) — MVP manual/embed

Oficiais: @Flamengo @flamengo_en
Cobertura: @ColunadoFla (e equivalentes verificados na Phase L research)
Não incluir conta random. Máximo 20 no MVP.

## Cidades piloto do mapa

1. Rio de Janeiro
2. Belo Horizonte
3. Recife
4. Salvador
5. São Paulo

Venue fora dessa lista pode existir no sheet, mas não entra no Daily Payload do MVP.

---

## Maintenance Log (preenchido na Phase T — Trigger)

| Campo | Valor |
|---|---|
| Última execução ok | — (aguardando Phase L/T) |
| Rate limits observados | — |
| Fontes que falharam nas últimas 24h | — |
| Editor(a) de plantão | — |
| Próxima manutenção | — |
