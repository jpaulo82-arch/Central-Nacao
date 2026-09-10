from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIX = Path('/home/ubuntu/swarm_shared_files/fixtures')
VENUES_FIX = ROOT / 'tests' / 'fixtures' / 'venues_fixture.json'


def run_tool(script: str, *args: str, expect_code: int | None = 0) -> tuple[int, dict]:
    cmd = ['python3', str(ROOT / script), *args]
    proc = subprocess.run(cmd, capture_output=True, text=True, cwd=str(ROOT))
    last_line = proc.stdout.strip().splitlines()[-1] if proc.stdout.strip() else '{}'
    data = json.loads(last_line)
    if expect_code is not None:
        assert proc.returncode == expect_code, f"{script} retornou {proc.returncode}: {proc.stdout} {proc.stderr}"
    return proc.returncode, data


def test_ping_tools_offline() -> None:
    code, data = run_tool('ping_supabase.py', expect_code=1)
    assert code == 1
    assert data['ok'] is False

    _, data = run_tool('ping_webhook.py', '--dry-run')
    assert data['ok'] is True

    _, data = run_tool('ping_football_api.py', '--fixture', str(FIX / 'match_scheduled.json'))
    assert data['ok'] is True
    assert data['mock'] is True

    _, data = run_tool('ping_rss.py', '--offline', '--fixture', str(FIX / 'news_bundle.json'))
    assert data['ok'] is True
    assert data['sources_checked'] == 7 or data['sources_checked'] == 8

    _, data = run_tool('ping_llm.py', '--fixture', str(FIX / 'news_bundle.json'))
    assert data['ok'] is True


def test_full_offline_pipeline() -> None:
    date = '2026-09-09'
    for folder in ['news', 'seen', 'matches', 'cards', 'cards_final', 'payload', 'queue', 'ticks']:
        target = ROOT / '.tmp' / folder
        if target.exists():
            shutil.rmtree(target)

    _, ingest_news = run_tool(
        'ingest_news.py',
        '--offline',
        '--fixture',
        str(FIX / 'news_bundle.json'),
        '--date',
        date,
    )
    assert ingest_news['new_items'] >= 1

    _, ingest_match = run_tool('ingest_match.py', '--fixture', str(FIX / 'match_scheduled.json'))
    assert ingest_match['ok'] is True

    _, ingest_venues = run_tool('ingest_venues.py', '--fixture', str(VENUES_FIX))
    assert ingest_venues['total'] == 4

    _, classify = run_tool('classify_and_dedupe.py', '--date', date)
    assert classify['ok'] is True
    assert classify['duplicates_removed'] >= 1

    cards_path = ROOT / '.tmp' / 'cards' / f'{date}.json'
    cards = json.loads(cards_path.read_text(encoding='utf-8'))
    ge_card = next(c for c in cards if 'ge.globo.com' in c['source_url'] and 'fabricio-bruno' in c['source_url'])
    lance_card = next(c for c in cards if 'lance.com.br' in c['source_url'] and 'fabricio-bruno' in c['source_url'])
    assert lance_card['duplicate_of'] == ge_card['card_id']

    _, write = run_tool('write_cards.py', '--date', date)
    assert write['cards_written'] >= 1

    _, payload = run_tool(
        'build_daily_payload.py',
        '--date',
        date,
        '--now-iso',
        '2026-09-13T00:30:00-03:00',
    )
    assert payload['ok'] is True
    assert payload['mode'] == 'matchday'

    payload_path = ROOT / '.tmp' / 'payload' / f'{date}.json'
    payload_json = json.loads(payload_path.read_text(encoding='utf-8'))
    assert 'agora' in payload_json
    assert 'nacao' in payload_json
    assert 'cortes' in payload_json
    assert 'perto_de_voce' in payload_json
    assert payload_json['nacao']['status'] == 'empty'
    assert payload_json['nacao']['items'] == []

    _, queue = run_tool('send_editor_queue.py', '--payload', str(payload_path), '--dry-run', '--decision', 'approved')
    assert queue['ok'] is True

    queue_path = ROOT / '.tmp' / 'queue' / f'{date}.json'
    _, publish = run_tool('publish_payload.py', '--payload', str(payload_path), '--queue', str(queue_path), '--dry-run-cloud')
    assert publish['ok'] is True
    assert publish['status'] == 'published'


def test_emit_match_tick_goal_and_dedup() -> None:
    _, tick = run_tool('emit_match_tick.py', '--previous', str(FIX / 'match_scheduled.json'), '--current', str(FIX / 'match_live_goal.json'))
    assert tick['ok'] is True
    assert tick['emitted'] is True
    assert tick['tick_type'] == 'goal'

    tick_payload = json.loads(Path(tick['output']).read_text(encoding='utf-8'))
    assert tick_payload['score'] == '1-0'
    assert tick_payload['publish_without_approval'] is True

    _, no_tick = run_tool('emit_match_tick.py', '--previous', str(FIX / 'match_live_goal.json'), '--current', str(FIX / 'match_live_goal.json'))
    assert no_tick['ok'] is True
    assert no_tick['emitted'] is False
