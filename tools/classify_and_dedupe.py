#!/usr/bin/env python3
"""Classificação e deduplicação de notícias em cards."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from config import get_settings
from llm_adapter import classify_mock, classify_with_llm
from common import TMP_DIR, ensure_tmp_dirs, print_report, today_str, write_json
from news_logic import apply_stamp_rules, assign_card_ids, count_needs_review, dedupe_cards
from schema_loader import SchemaError, validate_with_schema


def _classify_one(item: dict, llm_key: str) -> tuple[dict, bool]:
    needs_review = False
    if llm_key:
        try:
            fields = classify_with_llm(llm_key, item.get("title_raw", ""), item.get("summary_raw", ""))
            validate_with_schema(fields, "news_card_llm.schema.json")
        except Exception:
            fields = classify_mock(item.get("title_raw", ""), item.get("summary_raw", ""))
            needs_review = True
    else:
        fields = classify_mock(item.get("title_raw", ""), item.get("summary_raw", ""))

    card = {
        "card_id": "",
        "title": fields["title"],
        "lede": fields["lede"],
        "stamp": fields["stamp"],
        "category": fields["category"],
        "team_unit": fields["team_unit"],
        "source_name": item.get("source_name", ""),
        "source_url": item.get("url", ""),
        "needs_review": needs_review,
        "duplicate_of": None,
    }
    return card, needs_review


def main() -> int:
    parser = argparse.ArgumentParser(description="Classifica notícias em cards e aplica dedupe > 0.82.")
    parser.add_argument("--input", help="Arquivo de entrada RawInput.NewsItem[]")
    parser.add_argument("--date", help="Data YYYY-MM-DD para resolver caminho padrão")
    args = parser.parse_args()

    ensure_tmp_dirs()
    date = args.date or today_str()
    input_path = Path(args.input) if args.input else TMP_DIR / "news" / f"{date}.json"
    output_path = TMP_DIR / "cards" / f"{date}.json"

    if not input_path.exists():
        print_report({"tool": "classify_and_dedupe", "ok": False, "motivo": f"Entrada não encontrada: {input_path}"})
        return 2

    items = json.loads(input_path.read_text(encoding="utf-8"))
    settings = get_settings()

    cards = []
    for item in items:
        card, _ = _classify_one(item, settings.llm_api_key)
        cards.append(card)

    for idx, card in enumerate(cards):
        cards[idx] = apply_stamp_rules(card, items[idx], items)

    assign_card_ids(cards, date.replace("-", ""))
    cards, duplicates_removed = dedupe_cards(cards, items)

    schema_errors = []
    for c in cards:
        try:
            validate_with_schema(c, "news_card.schema.json")
        except SchemaError as exc:
            c["needs_review"] = True
            schema_errors.append(f"{c.get('source_url','')}: {exc}")

    write_json(output_path, cards)

    report = {
        "tool": "classify_and_dedupe",
        "ok": True,
        "input_items": len(items),
        "cards": len(cards),
        "duplicates_removed": duplicates_removed,
        "needs_review": count_needs_review(cards),
        "schema_errors": schema_errors,
        "output": str(output_path),
    }
    print_report(report)
    return 0


if __name__ == "__main__":
    sys.exit(main())
