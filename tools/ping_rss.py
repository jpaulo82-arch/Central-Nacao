#!/usr/bin/env python3
"""Handshake RSS: busca 1 item por fonte da allowlist."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from common import FIXTURES_DIR, is_allowlisted_news_url, print_report
from rss_client import RssClient
from schema_loader import validate_with_schema
from sources import SOURCES


def main() -> int:
    parser = argparse.ArgumentParser(description="Busca 1 item por fonte RSS da allowlist.")
    parser.add_argument("--offline", action="store_true", help="Executa sem rede usando fixture local.")
    parser.add_argument(
        "--fixture",
        default=str(FIXTURES_DIR / "news_bundle.json"),
        help="Arquivo fixture para modo offline.",
    )
    args = parser.parse_args()

    if args.offline:
        items = json.loads(Path(args.fixture).read_text(encoding="utf-8"))
        sample_by_source = {}
        for item in items:
            if item["source_id"] not in sample_by_source:
                sample_by_source[item["source_id"]] = item
        errors = []
        for it in sample_by_source.values():
            if not is_allowlisted_news_url(it.get("url", "")):
                errors.append(f"URL fora da allowlist: {it.get('url')}")
            validate_with_schema(it, "raw_news_item.schema.json")
        print_report(
            {
                "tool": "ping_rss",
                "ok": len(errors) == 0,
                "offline": True,
                "sources_checked": len(sample_by_source),
                "errors": errors,
            }
        )
        return 0 if not errors else 2

    client = RssClient()
    checked = 0
    errors: list[str] = []

    for source in SOURCES:
        try:
            entries = client.fetch_feed(source["feed_url"], source["source_id"], source["source_name"])
            if not entries:
                errors.append(f"{source['source_id']}: sem itens retornados")
                continue
            first = entries[0]
            validate_with_schema(first, "raw_news_item.schema.json")
            checked += 1
        except Exception as exc:
            errors.append(f"{source['source_id']}: {exc}")

    print_report({"tool": "ping_rss", "ok": checked > 0 and len(errors) < len(SOURCES), "sources_checked": checked, "errors": errors})
    return 0 if checked > 0 else 2


if __name__ == "__main__":
    sys.exit(main())
