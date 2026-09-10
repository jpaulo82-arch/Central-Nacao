#!/usr/bin/env python3
"""Handshake de classificação LLM com validação de schema."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from config import get_settings
from llm_adapter import classify_mock, classify_with_llm
from schema_loader import SchemaError, validate_with_schema
from common import FIXTURES_DIR, print_report


def main() -> int:
    parser = argparse.ArgumentParser(description="Classifica 1 headline e valida o JSON de saída no schema.")
    parser.add_argument(
        "--fixture",
        default=str(FIXTURES_DIR / "news_bundle.json"),
        help="Fixture com notícias para teste.",
    )
    args = parser.parse_args()

    items = json.loads(Path(args.fixture).read_text(encoding="utf-8"))
    item = items[0]
    settings = get_settings()

    used_mock = not bool(settings.llm_api_key)
    try:
        if used_mock:
            output = classify_mock(item["title_raw"], item.get("summary_raw", ""))
        else:
            try:
                output = classify_with_llm(settings.llm_api_key, item["title_raw"], item.get("summary_raw", ""))
            except Exception:
                output = classify_mock(item["title_raw"], item.get("summary_raw", ""))
                used_mock = True

        validate_with_schema(output, "news_card_llm.schema.json")
        print_report(
            {
                "tool": "ping_llm",
                "ok": True,
                "mock": used_mock,
                "title": output.get("title", ""),
                "stamp": output.get("stamp", ""),
            }
        )
        return 0
    except SchemaError as exc:
        print_report({"tool": "ping_llm", "ok": False, "mock": used_mock, "needs_review": True, "motivo": str(exc)})
        return 2


if __name__ == "__main__":
    sys.exit(main())
