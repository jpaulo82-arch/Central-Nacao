#!/usr/bin/env python3
"""Publicação do payload diário com gate de aprovação."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from common import TMP_DIR, ensure_tmp_dirs, iso_sp, print_report, today_str, write_json
from config import get_settings
from schema_loader import SchemaError, validate_with_schema
from supabase_client import SupabaseClient


def main() -> int:
    parser = argparse.ArgumentParser(description="Publica payload approved na cloud; senão mantém draft.")
    parser.add_argument("--payload", help="Arquivo do payload diário.")
    parser.add_argument("--queue", help="Arquivo de decisão da fila.")
    parser.add_argument("--dry-run-cloud", action="store_true", help="Não escreve na cloud, só simula gate.")
    args = parser.parse_args()

    ensure_tmp_dirs()
    date = today_str()
    payload_path = Path(args.payload) if args.payload else TMP_DIR / "payload" / f"{date}.json"
    queue_path = Path(args.queue) if args.queue else TMP_DIR / "queue" / f"{date}.json"

    if not payload_path.exists():
        print_report({"tool": "publish_payload", "ok": False, "motivo": f"Payload não encontrado: {payload_path}"})
        return 2

    payload = json.loads(payload_path.read_text(encoding="utf-8"))
    queue = json.loads(queue_path.read_text(encoding="utf-8")) if queue_path.exists() else {"decision": "none"}

    settings = get_settings()
    decision = queue.get("decision", "none")
    gate_open = decision == "approved" or settings.auto_publish

    try:
        validate_with_schema(payload, "daily_payload.schema.json")
    except SchemaError as exc:
        print_report({"tool": "publish_payload", "ok": False, "motivo": f"Schema inválido: {exc}"})
        return 2

    if not gate_open:
        payload["status"] = "draft"
        write_json(payload_path, payload)
        print_report(
            {
                "tool": "publish_payload",
                "ok": True,
                "published": False,
                "status": "draft",
                "motivo": "Sem aprovação e AUTO_PUBLISH=false.",
            }
        )
        return 0

    payload["status"] = "published"
    payload["published_at"] = iso_sp()

    cloud = "pending"
    cloud_error = ""
    if args.dry_run_cloud:
        cloud = "ok"
    else:
        if settings.supabase_url and settings.supabase_key:
            try:
                client = SupabaseClient(settings.supabase_url, settings.supabase_key)
                client.upsert("daily_payload", [{"date": payload["date"], "payload": payload}], on_conflict="date")
                cloud = "ok"
            except Exception as exc:  # pragma: no cover
                cloud = "failed"
                cloud_error = str(exc)
        else:
            cloud = "pending"
            cloud_error = "Sem credenciais Supabase."

    if cloud == "ok":
        write_json(payload_path, payload)

    print_report(
        {
            "tool": "publish_payload",
            "ok": cloud in {"ok", "pending"},
            "published": cloud == "ok",
            "status": payload["status"],
            "cloud": cloud,
            "home_html": "pending",
            "published_at": payload.get("published_at"),
            "cloud_error": cloud_error,
        }
    )
    return 0 if cloud in {"ok", "pending"} else 2


if __name__ == "__main__":
    sys.exit(main())
