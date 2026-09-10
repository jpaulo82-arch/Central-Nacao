#!/usr/bin/env python3
"""Ingestão do estado de partida (real ou mock)."""

from __future__ import annotations

import argparse
import sys

from config import get_settings
from football_adapter import get_football_adapter
from common import TMP_DIR, ensure_tmp_dirs, print_report, write_json
from schema_loader import SchemaError, validate_with_schema


def main() -> int:
    parser = argparse.ArgumentParser(description="Obtém e grava o estado da partida em .tmp/matches.")
    parser.add_argument("--fixture", help="Fixture usada quando API_FUTEBOL_KEY estiver ausente.")
    args = parser.parse_args()

    ensure_tmp_dirs()
    settings = get_settings()
    adapter = get_football_adapter(settings.api_futebol_key, fixture_path=args.fixture)

    try:
        result = adapter.get_next_match()
        validate_with_schema(result.payload, "raw_match.schema.json")
        path = TMP_DIR / "matches" / f"{result.payload['match_id']}.json"
        write_json(path, result.payload)
        print_report(
            {
                "tool": "ingest_match",
                "ok": True,
                "mock": result.mock,
                "provider": result.provider,
                "match_id": result.payload["match_id"],
                "status": result.payload["status"],
                "output": str(path),
            }
        )
        return 0
    except SchemaError as exc:
        print_report({"tool": "ingest_match", "ok": False, "mock": not bool(settings.api_futebol_key), "motivo": f"Schema inválido: {exc}"})
        return 2
    except Exception as exc:
        print_report({"tool": "ingest_match", "ok": False, "mock": not bool(settings.api_futebol_key), "motivo": str(exc)})
        return 2


if __name__ == "__main__":
    sys.exit(main())
