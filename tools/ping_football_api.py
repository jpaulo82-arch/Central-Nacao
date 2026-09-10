#!/usr/bin/env python3
"""Handshake da API de futebol (com fallback mock)."""

from __future__ import annotations

import argparse
import sys

from config import get_settings
from football_adapter import get_football_adapter
from common import FIXTURES_DIR, print_report
from schema_loader import SchemaError, validate_with_schema


def main() -> int:
    parser = argparse.ArgumentParser(description="Obtém próximo jogo do Flamengo via adapter (real ou mock).")
    parser.add_argument(
        "--fixture",
        default=str(FIXTURES_DIR / "match_scheduled.json"),
        help="Fixture de fallback quando não há API_FUTEBOL_KEY.",
    )
    args = parser.parse_args()

    settings = get_settings()
    adapter = get_football_adapter(settings.api_futebol_key, fixture_path=args.fixture)

    try:
        result = adapter.get_next_match()
        validate_with_schema(result.payload, "raw_match.schema.json")
        print_report(
            {
                "tool": "ping_football_api",
                "ok": True,
                "mock": result.mock,
                "provider": result.provider,
                "match_id": result.payload.get("match_id"),
            }
        )
        return 0
    except SchemaError as exc:
        print_report({"tool": "ping_football_api", "ok": False, "motivo": f"Schema inválido: {exc}"})
        return 2
    except Exception as exc:
        print_report({"tool": "ping_football_api", "ok": False, "motivo": str(exc)})
        return 2


if __name__ == "__main__":
    sys.exit(main())
