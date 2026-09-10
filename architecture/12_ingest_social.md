# SOP 12 — Ingest Social (Nação)

> Camada A.N.I.: Instruments-Tools · Versão: 1.0 (Protocol 0, 2026-09-09)
> ⚠️ Escopo MVP: **NÃO implementar `ingest_social_x.py` no MVP.** Este SOP documenta a regra e o desenho futuro.

## Objetivo

Alimentar a seção `nacao` do Daily Payload com posts curados das contas da allowlist (ver `gemini.md`, “Allowlist inicial de contas”). No MVP, isso é **manual/embed** (o blueprint proíbe chamar API do X no MVP); a automação via API é fase 2.

## Quando roda

- MVP: sem cron. Curadoria manual/embed; se não houver itens curados no dia, a seção `nacao` nasce `status: "empty"` com `items: []` (chave nunca omitida).
- Fase 2 (futuro): `ingest_social_x.py` em cron, contando com decisão humana sobre custo da API do X (blueprint: “cara; usar allowlist + embed”).

## Input

- Allowlist de contas de `gemini.md` (oficiais: @Flamengo, @flamengo_en; cobertura: @ColunadoFla e equivalentes verificados; **máximo 20 contas**; nada de conta random).
- MVP: posts escolhidos pelo editor/curadoria (embed), com URL e autor da allowlist.
- Fase 2: contrato `RawInput.SocialPost`.

## Output

- MVP: lista curada de itens para a seção `nacao` (até 5 posts no payload — ver SOP 30), gravada em `.tmp/social/<YYYY-MM-DD>.json` e/ou direto na montagem manual.
- Fase 2: `RawInput.SocialPost[]` (contrato já definido na CONSTITUTION: `platform`, `account`, `post_id`, `url`, `text`, `media_type`, `published_at`, `metrics`).

## Passos determinísticos (MVP)

1. Verificar se há itens curados/embeds marcados para hoje (entrada do editor ou lote manual).
2. Validar cada item: conta **deve** estar na allowlist (fora dela → não entra; logar).
3. Validar contrato mínimo: `account`, `url`, `text`, `published_at`; sem URL/texto → descartar com log.
4. Limitar a **5 posts** para o payload do dia (corte determinístico: mais recentes primeiro).
5. Gravar `.tmp/social/<YYYY-MM-DD>.json` com os itens validados.
6. Se não houver itens → não gravar lote; a seção ficará `empty` no SOP 30.

## Edge cases

- Conta fora da allowlist → recusada (regra “não incluir conta random”).
- Post sem link/URL → descartado (card precisa linkar a origem).
- Conteúdo impróprio (deepfake, sexual com menor) → descartar e alertar editor (vale também para memes — ver DO NOT da Behavioral Rules).
- Mais de 5 posts → manter os 5 mais recentes; o resto fica fora do payload (sem estourar o bloco).
- Fase 2: rate limit/erro da API do X → registrar em `progress.md`; nunca cair para scraping não autorizado.

## Rate limits / limites conhecidos

- MVP: nenhum (sem API).
- Fase 2: limites da API do X conforme o plano contratado — registrar no Maintenance Log quando ativa.

## Testes

- MVP: montar manualmente um lote de exemplo e validar contra o contrato `RawInput.SocialPost` (a validação de schema deve aceitar/rejeitar corretamente).
- Fase 2: fixture próprio de `SocialPost[]` antes de qualquer chamada real.
