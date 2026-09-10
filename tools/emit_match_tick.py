#!/usr/bin/env python3
"""Emissão de tick de jogo por transição de estado."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from common import TMP_DIR, ensure_tmp_dirs, iso_sp, print_report, slugify, write_json
from schema_loader import SchemaError, validate_with_schema


def _score(match: dict) -> str:
    h = match.get("score_home")
    a = match.get("score_away")
    if h is None or a is None:
        return "0-0"
    return f"{h}-{a}"


def _infer_tick(prev: dict, curr: dict) -> dict | None:
    if prev.get("status") == "scheduled" and curr.get("status") == "live":
        if (prev.get("score_home") != curr.get("score_home")) or (prev.get("score_away") != curr.get("score_away")):
            return {
                "match_id": curr["match_id"],
                "minute": 23,
                "type": "goal",
                "text": f"Gol do Flamengo. Placar agora: {_score(curr)}.",
                "score": _score(curr),
                "publish_without_approval": True,
            }
        return {
            "match_id": curr["match_id"],
            "minute": 0,
            "type": "kickoff",
            "text": "Bola rolando para o Flamengo.",
            "score": _score(curr),
            "publish_without_approval": True,
        }

    if prev.get("lineup_confirmed") is False and curr.get("lineup_confirmed") is True:
        return {
            "match_id": curr["match_id"],
            "minute": 0,
            "type": "lineup",
            "text": "Escalação oficial confirmada pelo provedor.",
            "score": _score(curr),
            "publish_without_approval": True,
        }

    if prev.get("status") != "finished" and curr.get("status") == "finished":
        return {
            "match_id": curr["match_id"],
            "minute": 90,
            "type": "ft",
            "text": "Fim de jogo.",
            "score": _score(curr),
            "publish_without_approval": True,
        }

    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Compara estado anterior/atual e emite DeliveryPayload.MatchTick.")
    parser.add_argument("--previous", required=True, help="JSON do estado anterior da partida.")
    parser.add_argument("--current", required=True, help="JSON do estado atual da partida.")
    args = parser.parse_args()

    ensure_tmp_dirs()
    prev = json.loads(Path(args.previous).read_text(encoding="utf-8"))
    curr = json.loads(Path(args.current).read_text(encoding="utf-8"))

    tick = _infer_tick(prev, curr)
    if not tick:
        print_report({"tool": "emit_match_tick", "ok": True, "emitted": False, "motivo": "Sem transição relevante."})
        return 0

    try:
        validate_with_schema(tick, "match_tick.schema.json")
    except SchemaError as exc:
        print_report({"tool": "emit_match_tick", "ok": False, "motivo": f"Schema inválido: {exc}"})
        return 2

    key = f"{slugify(curr['match_id'])}-{iso_sp().replace(':','').replace('-','')}.json"
    out = TMP_DIR / "ticks" / key
    write_json(out, tick)
    print_report({"tool": "emit_match_tick", "ok": True, "emitted": True, "tick_type": tick["type"], "output": str(out)})
    return 0


if __name__ == "__main__":
    sys.exit(main())
