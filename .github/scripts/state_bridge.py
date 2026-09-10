#!/usr/bin/env python3
"""Ponte de estado Supabase para GitHub Actions (Central da Nação).

Os runners do GitHub Actions são efêmeros: cada execução de cron começa do
zero, então o estado que as tools guardam em tools/.tmp/ não sobrevive entre
triggers. As tools continuam 100% locais (contrato Phase L); esta ponte cobre
apenas o que cruza execuções, usando o Supabase como verdade em nuvem:

  pull-match-state --out FILE      próximo jogo scheduled/live (estado anterior p/ matchday)
  push-match       --file FILE     upsert do estado atual em `matches` (match_id)
  push-daily-payload --file FILE   grava o rascunho do dia em `daily_payload` (date)
  pull-daily-payload --date D --out FILE   baixa o payload do dia p/ tools/.tmp

Uso: SUPABASE_URL e SUPABASE_KEY (service role) devem estar no ambiente.
Dependência: requests (já instalada via tools/requirements.txt).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import requests


def _client() -> tuple[str, dict]:
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_KEY", "")
    if not url or not key:
        raise SystemExit("SUPABASE_URL/SUPABASE_KEY ausentes no ambiente.")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    return url, headers


def pull_match_state(out: str) -> None:
    """Próximo jogo não encerrado (estado anterior do worker matchday)."""
    url, headers = _client()
    resp = requests.get(
        f"{url}/rest/v1/matches",
        headers=headers,
        params={
            "select": "*",
            "status": "in.(scheduled,live)",
            "order": "kickoff_iso.asc",
            "limit": "1",
        },
        timeout=20,
    )
    resp.raise_for_status()
    rows = resp.json()
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    Path(out).write_text(json.dumps(rows[0], ensure_ascii=False) if rows else "", encoding="utf-8")
    print(json.dumps({"ok": True, "found": bool(rows), "match_id": rows[0].get("match_id") if rows else None}))


def push_match(path: str) -> None:
    """Upsert do estado atual da partida (on_conflict=match_id)."""
    url, headers = _client()
    row = json.loads(Path(path).read_text(encoding="utf-8"))
    resp = requests.post(
        f"{url}/rest/v1/matches",
        headers={**headers, "Prefer": "resolution=merge-duplicates,return=representation"},
        params={"on_conflict": "match_id"},
        json=[row],
        timeout=20,
    )
    resp.raise_for_status()
    print(json.dumps({"ok": True, "table": "matches", "match_id": row.get("match_id")}))


def push_daily_payload(path: str) -> None:
    """Grava rascunho do payload do dia (on_conflict=date)."""
    url, headers = _client()
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    row = {"date": payload["date"], "payload": payload}
    resp = requests.post(
        f"{url}/rest/v1/daily_payload",
        headers={**headers, "Prefer": "resolution=merge-duplicates,return=representation"},
        params={"on_conflict": "date"},
        json=[row],
        timeout=20,
    )
    resp.raise_for_status()
    print(json.dumps({"ok": True, "table": "daily_payload", "date": payload["date"]}))


def pull_daily_payload(date: str, out: str) -> None:
    """Baixa o payload do dia (fallback quando o artefato do build não existe)."""
    url, headers = _client()
    resp = requests.get(
        f"{url}/rest/v1/daily_payload",
        headers=headers,
        params={"select": "payload", "date": f"eq.{date}", "limit": "1"},
        timeout=20,
    )
    resp.raise_for_status()
    rows = resp.json()
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    if rows:
        Path(out).write_text(json.dumps(rows[0]["payload"], ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps({"ok": True, "date": date, "found": True}))
    else:
        print(json.dumps({"ok": True, "date": date, "found": False}))


def main() -> int:
    parser = argparse.ArgumentParser(description="Ponte de estado Supabase para GitHub Actions.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p1 = sub.add_parser("pull-match-state")
    p1.add_argument("--out", required=True)

    p2 = sub.add_parser("push-match")
    p2.add_argument("--file", required=True)

    p3 = sub.add_parser("push-daily-payload")
    p3.add_argument("--file", required=True)

    p4 = sub.add_parser("pull-daily-payload")
    p4.add_argument("--date", required=True)
    p4.add_argument("--out", required=True)

    args = parser.parse_args()
    if args.cmd == "pull-match-state":
        pull_match_state(args.out)
    elif args.cmd == "push-match":
        push_match(args.file)
    elif args.cmd == "push-daily-payload":
        push_daily_payload(args.file)
    elif args.cmd == "pull-daily-payload":
        pull_daily_payload(args.date, args.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
