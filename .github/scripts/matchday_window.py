#!/usr/bin/env python3
"""Calcula se a janela de matchday está ativa (kickoff−90min … FT+30).

Lê o estado anterior do jogo (JSON, saída de state_bridge pull-match-state),
compara com o agora UTC e imprime pares chave=valor no formato $GITHUB_OUTPUT
(active=..., window_status=...).

Regras (SOP 31 — match_ticks.md):
  - scheduled: janela ativa de kickoff−90min até kickoff+180min (guard do poll);
  - live:      sempre ativo (o emit_match_tick decide o tick por transição);
  - finished:  ativo até 30min após updated_at (FT+30).

Uso: python3 matchday_window.py [ARQUIVO_DO_ESTADO_ANTERIOR]
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timedelta, timezone

path = sys.argv[1] if len(sys.argv) > 1 else "/tmp/prev_match.json"


def _as_utc(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)


def main() -> int:
    with open(path, encoding="utf-8") as fh:
        match = json.load(fh)

    now = datetime.now(timezone.utc)
    status = match.get("status")
    updated = match.get("updated_at")
    kick = _as_utc(match["kickoff_iso"])

    if status == "scheduled":
        active = kick - timedelta(minutes=90) <= now <= kick + timedelta(minutes=180)
    elif status == "live":
        active = True
    elif status == "finished" and updated:
        active = now <= _as_utc(updated) + timedelta(minutes=30)
    else:
        active = False

    print(f"active={str(active).lower()}")
    print(f"window_status={status}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
