"""Utilitários compartilhados da Central da Nação (Phase L)."""

from __future__ import annotations

import json
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

TZ = ZoneInfo("America/Sao_Paulo")
BASE_DIR = Path(__file__).resolve().parent
TMP_DIR = BASE_DIR / ".tmp"
SCHEMAS_DIR = BASE_DIR / "schemas"
FIXTURES_DIR = Path("/home/ubuntu/swarm_shared_files/fixtures")

PILOT_CITIES = [
    "Rio de Janeiro",
    "Belo Horizonte",
    "Recife",
    "Salvador",
    "São Paulo",
]

NEWS_ALLOWLIST = {
    "www.flamengo.com.br",
    "flamengo.com.br",
    "ge.globo.com",
    "www.lance.com.br",
    "lance.com.br",
    "colunadofla.com",
    "www.colunadofla.com",
    "fla10.news",
    "www.fla10.news",
    "serflamengo.com.br",
    "www.serflamengo.com.br",
    "uol.com.br",
    "www.uol.com.br",
    "cnnbrasil.com.br",
    "www.cnnbrasil.com.br",
}

OFFICIAL_DOMAINS = {"flamengo.com.br", "www.flamengo.com.br"}

RUMOR_TRIGGERS = ["negociando", "perto", "sondado", "sonda", "exclusividade", "conversas"]


def now_sp() -> datetime:
    return datetime.now(tz=TZ)


def iso_sp(dt: datetime | None = None) -> str:
    dt = dt or now_sp()
    return dt.astimezone(TZ).isoformat(timespec="seconds")


def today_str(dt: datetime | None = None) -> str:
    dt = dt or now_sp()
    return dt.astimezone(TZ).strftime("%Y-%m-%d")


def slugify(value: str) -> str:
    clean = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return clean or "item"


def ensure_tmp_dirs() -> None:
    for name in [
        "news",
        "seen",
        "matches",
        "cards",
        "cards_final",
        "payload",
        "ticks",
        "venues",
        "queue",
        "social",
    ]:
        (TMP_DIR / name).mkdir(parents=True, exist_ok=True)


def read_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def print_report(report: dict[str, Any]) -> None:
    print(json.dumps(report, ensure_ascii=False, separators=(",", ":")))


def extract_domain(url: str) -> str:
    val = re.sub(r"^https?://", "", url.strip().lower())
    return val.split("/")[0]


def is_allowlisted_news_url(url: str) -> bool:
    domain = extract_domain(url)
    return domain in NEWS_ALLOWLIST


def is_official_url(url: str) -> bool:
    return extract_domain(url) in OFFICIAL_DOMAINS


def within_last_24h(iso_text: str, ref: datetime | None = None) -> bool:
    ref = ref or now_sp()
    try:
        dt = datetime.fromisoformat(iso_text)
    except ValueError:
        return False
    dt = dt.astimezone(TZ)
    return (ref - timedelta(hours=24)) <= dt <= ref


def normalize_spaces(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip())
