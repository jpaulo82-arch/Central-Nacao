#!/usr/bin/env python3
"""Persistência de cards processados (staging + cloud opcional)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from common import TMP_DIR, ensure_tmp_dirs, print_report, today_str, write_json
from config import get_settings
from schema_loader import SchemaError, validate_with_schema
from supabase_client import SupabaseClient


def main() -> int:
    parser = argparse.ArgumentParser(description="Valida cards e grava em .tmp/cards_final, com upsert opcional na cloud.")
    parser.add_argument("--input", help="Arquivo de entrada com cards processados.")
    parser.add_argument("--date", help="Data YYYY-MM-DD para caminho padrão.")
    args = parser.parse_args()

    ensure_tmp_dirs()
    date = args.date or today_str()
    input_path = Path(args.input) if args.input else TMP_DIR / "cards" / f"{date}.json"
    output_path = TMP_DIR / "cards_final" / f"{date}.json"

    if not input_path.exists():
        print_report({"tool": "write_cards", "ok": False, "motivo": f"Entrada não encontrada: {input_path}"})
        return 2

    cards = json.loads(input_path.read_text(encoding="utf-8"))
    valid_cards = []
    rejected = []
    ids = set()

    for card in cards:
        try:
            validate_with_schema(card, "news_card.schema.json")
            if card["card_id"] in ids:
                rejected.append({"card_id": card["card_id"], "motivo": "card_id duplicado no lote"})
                continue
            ids.add(card["card_id"])
            valid_cards.append(card)
        except SchemaError as exc:
            card["needs_review"] = True
            rejected.append({"card_id": card.get("card_id", ""), "motivo": str(exc)})

    write_json(output_path, valid_cards)

    settings = get_settings()
    cloud = "pending"
    cloud_error = ""
    if settings.supabase_url and settings.supabase_key:
        try:
            client = SupabaseClient(settings.supabase_url, settings.supabase_key)
            client.upsert("news_cards", valid_cards, on_conflict="card_id")
            cloud = "ok"
        except Exception as exc:  # pragma: no cover
            cloud = "pending"
            cloud_error = str(exc)

    report = {
        "tool": "write_cards",
        "ok": True,
        "cards_written": len(valid_cards),
        "rejected": rejected,
        "cloud": cloud,
        "cloud_error": cloud_error,
        "output": str(output_path),
    }
    print_report(report)
    return 0


if __name__ == "__main__":
    sys.exit(main())
