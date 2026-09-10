#!/usr/bin/env python3
"""Handshake com Supabase (escrita/leitura de teste)."""

from __future__ import annotations

import argparse
import sys

from config import get_settings
from common import print_report
from supabase_client import SupabaseClient


def main() -> int:
    parser = argparse.ArgumentParser(description="Testa conexão Supabase com escrita/leitura de teste.")
    parser.add_argument("--table", default="agent_pings", help="Tabela para teste de ping (padrão: agent_pings).")
    args = parser.parse_args()

    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_key:
        report = {
            "tool": "ping_supabase",
            "ok": False,
            "motivo": "Credenciais ausentes: defina SUPABASE_URL e SUPABASE_KEY no .env.",
        }
        print_report(report)
        return 1

    client = SupabaseClient(settings.supabase_url, settings.supabase_key)
    try:
        result = client.ping_write_read(table=args.table)
        report = {"tool": "ping_supabase", "ok": True, "table": args.table, "result": result}
        print_report(report)
        return 0
    except Exception as exc:  # pragma: no cover - depende de rede/credencial
        report = {"tool": "ping_supabase", "ok": False, "motivo": str(exc)}
        print_report(report)
        return 2


if __name__ == "__main__":
    sys.exit(main())
