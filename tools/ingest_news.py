#!/usr/bin/env python3
"""Ingestão de notícias da allowlist com modo fixture/offline."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from common import (
    FIXTURES_DIR,
    TMP_DIR,
    ensure_tmp_dirs,
    is_allowlisted_news_url,
    print_report,
    read_json,
    today_str,
    within_last_24h,
    write_json,
)
from rss_client import RssClient
from schema_loader import SchemaError, validate_with_schema
from sources import SOURCES


def load_fixture(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("Fixture de notícias deve ser uma lista de itens.")
    return data


def filter_and_validate(items: list[dict], seen_urls: set[str]) -> tuple[list[dict], list[str]]:
    out: list[dict] = []
    errors: list[str] = []
    for item in items:
        try:
            validate_with_schema(item, "raw_news_item.schema.json")
            if not is_allowlisted_news_url(item["url"]):
                errors.append(f"ignorado: domínio fora da allowlist ({item['url']})")
                continue
            if not within_last_24h(item["published_at"]):
                errors.append(f"ignorado: fora da janela ~24h ({item['url']})")
                continue
            if item["url"] in seen_urls:
                continue
            out.append(item)
            seen_urls.add(item["url"])
        except SchemaError as exc:
            errors.append(f"schema inválido em {item.get('url', 'sem-url')}: {exc}")
    return out, errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Coleta notícias da allowlist e grava em .tmp/news.")
    parser.add_argument("--fixture", help="Arquivo JSON para modo dry-run/offline.")
    parser.add_argument("--offline", action="store_true", help="Força modo offline (requer --fixture).")
    parser.add_argument("--date", help="Data alvo no formato YYYY-MM-DD (opcional).")
    args = parser.parse_args()

    ensure_tmp_dirs()
    date = args.date or today_str()
    news_path = TMP_DIR / "news" / f"{date}.json"
    seen_path = TMP_DIR / "seen" / f"{date}.json"
    seen_urls = set(read_json(seen_path, default=[]))

    raw_items: list[dict] = []
    errors: list[str] = []

    if args.offline or args.fixture:
        fixture = Path(args.fixture or str(FIXTURES_DIR / "news_bundle.json"))
        raw_items = load_fixture(fixture)
    else:
        client = RssClient()
        for source in SOURCES:
            try:
                fetched = client.fetch_feed(source["feed_url"], source["source_id"], source["source_name"])
                raw_items.extend(fetched)
            except Exception as exc:
                errors.append(f"{source['source_id']}: {exc}")

    new_items, validate_errors = filter_and_validate(raw_items, seen_urls)
    errors.extend(validate_errors)

    write_json(news_path, new_items)
    write_json(seen_path, sorted(seen_urls))

    print_report(
        {
            "tool": "ingest_news",
            "date": date,
            "fetched": len(raw_items),
            "new_items": len(new_items),
            "errors": errors,
            "cloud_pending": True,
            "output": str(news_path),
        }
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
