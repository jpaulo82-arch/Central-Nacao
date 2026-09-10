"""Leitura centralizada de variáveis de ambiente (.env)."""

from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

from common import BASE_DIR

load_dotenv(BASE_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    supabase_url: str = os.getenv("SUPABASE_URL", "").strip()
    supabase_key: str = os.getenv("SUPABASE_KEY", "").strip()
    api_futebol_key: str = os.getenv("API_FUTEBOL_KEY", "").strip()
    llm_api_key: str = os.getenv("LLM_API_KEY", "").strip()
    editor_webhook_url: str = os.getenv("EDITOR_WEBHOOK_URL", "").strip()
    auto_publish: bool = os.getenv("AUTO_PUBLISH", "false").strip().lower() == "true"
    default_city: str = os.getenv("DEFAULT_CITY", "Rio de Janeiro").strip() or "Rio de Janeiro"


def get_settings() -> Settings:
    return Settings()
