#!/usr/bin/env python3
"""Envio de bloco editorial 'Hoje na Nação' para webhook."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import requests

from common import TMP_DIR, ensure_tmp_dirs, print_report, today_str, write_json
from config import get_settings


def _format_message(payload: dict) -> str:
    cards_lines = []
    for c in payload.get("agora", {}).get("cards", [])[:5]:
        cards_lines.append(f"- [{c.get('stamp','')}] {c.get('title','')} ({c.get('source_name','')})")
    if not cards_lines:
        cards_lines = ["- Sem cards válidos no momento."]

    nacao_count = len(payload.get("nacao", {}).get("items", []))
    lances_count = len(payload.get("cortes", {}).get("lances", []))
    memes_count = len(payload.get("cortes", {}).get("memes", []))
    venues_count = len(payload.get("perto_de_voce", {}).get("items", []))
    city = payload.get("perto_de_voce", {}).get("default_city", "Rio de Janeiro")

    msg = (
        f"🔴⚫ CENTRAL DA NAÇÃO — {payload.get('date')}\n"
        f"Modo: {'DIA DE JOGO' if payload.get('mode') == 'matchday' else 'normal'}\n\n"
        "📌 AGORA\n"
        f"{payload.get('agora', {}).get('headline', '')}\n"
        + "\n".join(cards_lines)
        + "\n\n"
        + f"📣 NAÇÃO\nItens curados: {nacao_count}\n\n"
        + f"🎬 CORTES\nLances: {lances_count} | Memes: {memes_count}\n\n"
        + f"📍 PERTO DE VOCÊ ({city})\nLocais: {venues_count}\n\n"
        + "[✅ Publicar] [✏️ Pedir edição] [🗑️ Segurar]"
    )
    return msg


def main() -> int:
    parser = argparse.ArgumentParser(description="Posta o bloco editorial em webhook ou simula em dry-run.")
    parser.add_argument("--payload", help="Arquivo payload do dia.")
    parser.add_argument("--dry-run", action="store_true", help="Não envia no webhook.")
    parser.add_argument("--decision", choices=["approved", "edit", "hold", "none"], default="none")
    args = parser.parse_args()

    ensure_tmp_dirs()
    date = today_str()
    payload_path = Path(args.payload) if args.payload else TMP_DIR / "payload" / f"{date}.json"
    if not payload_path.exists():
        print_report({"tool": "send_editor_queue", "ok": False, "motivo": f"Payload não encontrado: {payload_path}"})
        return 2

    payload = json.loads(payload_path.read_text(encoding="utf-8"))
    message = _format_message(payload)
    settings = get_settings()

    sent = False
    status_code = None
    error = ""

    if args.dry_run:
        sent = True
    else:
        if not settings.editor_webhook_url:
            error = "EDITOR_WEBHOOK_URL ausente no .env."
        else:
            for attempt in [1, 2, 3]:
                try:
                    response = requests.post(settings.editor_webhook_url, json={"content": message}, timeout=15)
                    status_code = response.status_code
                    if 200 <= response.status_code < 300:
                        sent = True
                        break
                except Exception as exc:  # pragma: no cover
                    error = str(exc)

    decision_path = TMP_DIR / "queue" / f"{payload.get('date', date)}.json"
    state = {
        "decision": args.decision,
        "decided_at": payload.get("generated_at"),
        "editor_notes": payload.get("editor_notes", []),
        "message_preview": message[:300],
    }
    write_json(decision_path, state)

    ok = sent or args.dry_run
    print_report(
        {
            "tool": "send_editor_queue",
            "ok": ok,
            "dry_run": args.dry_run,
            "sent": sent,
            "status_code": status_code,
            "decision": args.decision,
            "queue_state": str(decision_path),
            "error": error,
        }
    )
    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
