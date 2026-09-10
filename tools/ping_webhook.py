#!/usr/bin/env python3
"""Handshake com webhook editorial (Discord/Slack)."""

from __future__ import annotations

import argparse
import sys

import requests

from config import get_settings
from common import iso_sp, print_report


def main() -> int:
    parser = argparse.ArgumentParser(description="Envia mensagem de pong para o webhook editorial.")
    parser.add_argument("--dry-run", action="store_true", help="Não envia na rede; apenas simula o payload.")
    args = parser.parse_args()

    settings = get_settings()
    message = f"🔴⚫ Central da Nação ping: pong ({iso_sp()})"

    if args.dry_run:
        print_report({"tool": "ping_webhook", "ok": True, "dry_run": True, "message": message})
        return 0

    if not settings.editor_webhook_url:
        print_report(
            {
                "tool": "ping_webhook",
                "ok": False,
                "motivo": "EDITOR_WEBHOOK_URL ausente no .env.",
            }
        )
        return 1

    try:
        response = requests.post(settings.editor_webhook_url, json={"content": message}, timeout=15)
        ok = 200 <= response.status_code < 300
        print_report(
            {
                "tool": "ping_webhook",
                "ok": ok,
                "status_code": response.status_code,
                "motivo": "" if ok else f"HTTP {response.status_code}",
            }
        )
        return 0 if ok else 2
    except Exception as exc:  # pragma: no cover
        print_report({"tool": "ping_webhook", "ok": False, "motivo": str(exc)})
        return 2


if __name__ == "__main__":
    sys.exit(main())
