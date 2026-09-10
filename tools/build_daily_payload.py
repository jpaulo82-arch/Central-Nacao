#!/usr/bin/env python3
"""Montagem determinística do Daily Payload."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

from common import PILOT_CITIES, TMP_DIR, TZ, ensure_tmp_dirs, iso_sp, now_sp, print_report, today_str, write_json
from config import get_settings
from schema_loader import SchemaError, validate_with_schema


def _parse_iso(value: str) -> datetime:
    return datetime.fromisoformat(value).astimezone(TZ)


def _load_json_if_exists(path: Path, fallback):
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return fallback


def _is_matchday(match: dict | None, ref_now: datetime) -> bool:
    if not match:
        return False
    kickoff = _parse_iso(match["kickoff_iso"])
    diff_h = (kickoff - ref_now).total_seconds() / 3600
    return 0 <= diff_h <= 18


def _build_headline(cards: list[dict]) -> str:
    official = [c for c in cards if c.get("stamp") == "oficial"]
    if official:
        return official[-1]["title"]
    clean = [c for c in cards if not c.get("needs_review") and not c.get("duplicate_of")]
    if clean:
        return clean[-1]["title"]
    return ""


def main() -> int:
    parser = argparse.ArgumentParser(description="Monta DeliveryPayload.Daily com as 4 seções obrigatórias.")
    parser.add_argument("--date", help="Data YYYY-MM-DD para paths padrão.")
    parser.add_argument("--cards-file", help="Arquivo cards_final do dia.")
    parser.add_argument("--match-file", help="Arquivo de match (RawInput.Match).")
    parser.add_argument("--social-file", help="Arquivo social curado (opcional).")
    parser.add_argument("--venues-file", help="Arquivo de venues (opcional).")
    parser.add_argument("--now-iso", help="Timestamp ISO para testes determinísticos de matchday.")
    args = parser.parse_args()

    ensure_tmp_dirs()
    settings = get_settings()
    ref_now = _parse_iso(args.now_iso) if args.now_iso else now_sp()
    date = args.date or today_str(ref_now)

    cards_file = Path(args.cards_file) if args.cards_file else TMP_DIR / "cards_final" / f"{date}.json"
    match_file = Path(args.match_file) if args.match_file else next(iter((TMP_DIR / "matches").glob("*.json")), None)
    social_file = Path(args.social_file) if args.social_file else TMP_DIR / "social" / f"{date}.json"
    venues_file = Path(args.venues_file) if args.venues_file else TMP_DIR / "venues" / "venues_latest.json"

    cards = _load_json_if_exists(cards_file, [])
    match = _load_json_if_exists(match_file, None) if match_file else None
    social_items = _load_json_if_exists(social_file, [])
    venues_all = _load_json_if_exists(venues_file, [])

    mode = "matchday" if _is_matchday(match, ref_now) else "normal"

    cards_sorted = sorted(
        [c for c in cards if not c.get("needs_review") and not c.get("duplicate_of")],
        key=lambda c: (0 if c.get("stamp") in {"oficial", "confirmado"} else 1),
    )

    nacao_items = social_items[:5]
    nacao_status = "ok" if nacao_items else "empty"

    lances = []
    memes = []

    venues = [
        v
        for v in venues_all
        if v.get("status") == "verified" and v.get("city") == settings.default_city and v.get("city") in PILOT_CITIES
    ][:5]
    perto_status = "ok" if venues else "empty"

    notes = []
    review_count = sum(1 for c in cards if c.get("needs_review"))
    if review_count:
        notes.append(f"{review_count} card(s) com needs_review aguardando olhar humano.")

    payload = {
        "date": date,
        "generated_at": iso_sp(ref_now),
        "status": "draft",
        "mode": mode,
        "agora": {"match": match if mode == "matchday" else None, "headline": _build_headline(cards), "cards": cards_sorted},
        "nacao": {"status": nacao_status, "items": nacao_items},
        "cortes": {"lances": lances, "memes": memes},
        "perto_de_voce": {"default_city": settings.default_city, "status": perto_status, "items": venues},
        "editor_notes": notes,
    }

    try:
        validate_with_schema(payload, "daily_payload.schema.json")
    except SchemaError as exc:
        print_report({"tool": "build_daily_payload", "ok": False, "motivo": f"Schema inválido: {exc}"})
        return 2

    out = TMP_DIR / "payload" / f"{date}.json"
    write_json(out, payload)
    print_report(
        {
            "tool": "build_daily_payload",
            "ok": True,
            "mode": mode,
            "cards": len(cards_sorted),
            "sections_empty": [
                n for n, cond in [("nacao", nacao_status == "empty"), ("perto_de_voce", perto_status == "empty")]
                if cond
            ],
            "output": str(out),
        }
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
