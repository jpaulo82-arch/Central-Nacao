# Central da Nação — Pipeline Phase L (Link)

Pipeline em Python para ingestão, processamento, payload diário e fila editorial.

## Pré-requisitos

- Python 3.11+
- Dependências: `pip install -r requirements.txt`
- Copiar `.env.example` para `.env` e preencher apenas quando houver credenciais reais.

## Ordem de execução (Navigation)

1. `ingest_news.py`
2. `ingest_match.py`
3. `ingest_venues.py`
4. `classify_and_dedupe.py`
5. `write_cards.py`
6. `build_daily_payload.py`
7. `send_editor_queue.py`
8. `publish_payload.py`

Worker de jogo: `emit_match_tick.py`.

## Handshakes (pings)

- `python3 ping_supabase.py`
- `python3 ping_webhook.py --dry-run`
- `python3 ping_football_api.py --fixture /home/ubuntu/swarm_shared_files/fixtures/match_scheduled.json`
- `python3 ping_rss.py --offline --fixture /home/ubuntu/swarm_shared_files/fixtures/news_bundle.json`
- `python3 ping_llm.py --fixture /home/ubuntu/swarm_shared_files/fixtures/news_bundle.json`

## Modo offline com fixtures

Exemplo completo:

```bash
python3 ingest_news.py --offline --fixture /home/ubuntu/swarm_shared_files/fixtures/news_bundle.json --date 2026-09-09
python3 ingest_match.py --fixture /home/ubuntu/swarm_shared_files/fixtures/match_scheduled.json
python3 ingest_venues.py --fixture /home/ubuntu/tools/tests/fixtures/venues_fixture.json
python3 classify_and_dedupe.py --date 2026-09-09
python3 write_cards.py --date 2026-09-09
python3 build_daily_payload.py --date 2026-09-09 --now-iso 2026-09-13T00:30:00-03:00
python3 send_editor_queue.py --payload /home/ubuntu/tools/.tmp/payload/2026-09-09.json --dry-run --decision approved
python3 publish_payload.py --payload /home/ubuntu/tools/.tmp/payload/2026-09-09.json --queue /home/ubuntu/tools/.tmp/queue/2026-09-09.json --dry-run-cloud
```

## Testes

Rodar suíte completa (offline):

```bash
pytest -q
```

## Saídas

- Staging local em `.tmp/`
- Schemas formais em `schemas/`
- Toda tool imprime **um único JSON** por execução.
