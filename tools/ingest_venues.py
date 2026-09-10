#!/usr/bin/env python3
"""Ingestão de venues a partir de banco/fixture, sem scraping externo."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from common import PILOT_CITIES, TMP_DIR, ensure_tmp_dirs, print_report, read_json, slugify, write_json
from config import get_settings
from schema_loader import SchemaError, validate_with_schema
from supabase_client import SupabaseClient


def _normalize_venue(v: dict) -> dict:
    venue = dict(v)
    venue.setdefault("address", "")
    venue.setdefault("geo", {"lat": None, "lng": None})
    venue.setdefault("has_screen", False)
    venue.setdefault("matchday_note", "")
    venue["city"] = venue.get("city", "").strip()
    venue["state"] = venue.get("state", "").strip()
    if not venue.get("venue_id"):
        venue["venue_id"] = f"{slugify(venue.get('city','cidade'))}-{slugify(venue.get('name','venue'))}"
    if venue.get("type") not in {"bar", "loja", "embaixada", "caravana", "telão"}:
        venue["status"] = "rejected"
        venue["matchday_note"] = (venue.get("matchday_note", "") + " | tipo inválido").strip(" |")
    if venue.get("status") not in {"pending", "verified", "rejected", "closed"}:
        venue["status"] = "pending"
    return venue


def _load_fixture(path: str) -> list[dict]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _load_from_supabase(settings) -> list[dict]:
    client = SupabaseClient(settings.supabase_url, settings.supabase_key)
    if not client.enabled:
        raise RuntimeError("Sem credenciais Supabase para leitura de venues.")
    return client.select("venues", limit=500)


def main() -> int:
    parser = argparse.ArgumentParser(description="Lê venues da cloud (ou fixture) e atualiza staging local.")
    parser.add_argument("--fixture", help="Fixture JSON para execução offline.")
    parser.add_argument("--default-city", help="Cidade padrão para sumarização (sobrescreve .env).")
    args = parser.parse_args()

    ensure_tmp_dirs()
    settings = get_settings()
    default_city = args.default_city or settings.default_city

    if args.fixture:
        rows = _load_fixture(args.fixture)
        source = "fixture"
    else:
        try:
            rows = _load_from_supabase(settings)
            source = "supabase"
        except Exception as exc:
            rows = []
            source = "indisponivel"
            error = str(exc)

    normalized = []
    for row in rows:
        venue = _normalize_venue(row)
        try:
            validate_with_schema(venue, "raw_venue.schema.json")
            normalized.append(venue)
        except SchemaError:
            venue["status"] = "rejected"
            normalized.append(venue)

    cache_path = TMP_DIR / "venues" / "venues_latest.json"
    write_json(cache_path, normalized)

    verified_by_city = {}
    for city in PILOT_CITIES:
        verified_by_city[city] = sum(1 for v in normalized if v.get("city") == city and v.get("status") == "verified")

    report = {
        "tool": "ingest_venues",
        "source": source,
        "total": len(normalized),
        "pending": sum(1 for v in normalized if v.get("status") == "pending"),
        "verified_by_city": verified_by_city,
        "default_city": default_city,
        "output": str(cache_path),
    }
    if source == "indisponivel":
        report["errors"] = [error]
    print_report(report)
    return 0


if __name__ == "__main__":
    sys.exit(main())
