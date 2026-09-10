#!/usr/bin/env python3
"""Envia o MatchTick para o canal do editor via EDITOR_WEBHOOK_URL.

Lê o relatório JSON de emit_match_tick.py e, se um tick foi emitido,
posta um resumo no webhook (payload compatível com Slack). Sem webhook
configurado, apenas informa em stdout — o log/artefato segue sendo a
verdade local (nunca falha o job por ausência de webhook).

Uso: python3 notify_tick.py [RELATORIO_EMIT_MATCH_TICK]
"""
from __future__ import annotations

import json
import os
import sys

import requests

report_path = sys.argv[1] if len(sys.argv) > 1 else "/tmp/tick_report.json"


def main() -> int:
    with open(report_path, encoding="utf-8") as fh:
        report = json.load(fh)

    if not report.get("emitted"):
        print("no_tick=True")
        return 0

    url = os.environ.get("EDITOR_WEBHOOK_URL", "")
    if not url:
        print("Sem EDITOR_WEBHOOK_URL — tick gravado apenas em artefato/log.")
        print("no_tick=False")
        return 0

    with open(report["output"], encoding="utf-8") as fh:
        tick = json.load(fh)

    text = (
        f"⚽ MATCH TICK — {str(tick.get('type', '')).upper()} {tick.get('minute', '')}'\n"
        f"{tick.get('text', '')}\n"
        f"Placar: {tick.get('score', '')}"
    )
    resp = requests.post(url, json={"content": text}, timeout=15)
    resp.raise_for_status()
    print(f"no_tick=False\nwebhook_status={resp.status_code}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
