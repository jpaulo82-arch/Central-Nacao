"""Adapter de futebol com modo mock e modo real opcional."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import requests

from common import FIXTURES_DIR, TZ


@dataclass
class FootballAdapterResult:
    payload: dict[str, Any]
    mock: bool
    provider: str


class FootballAdapter:
    """Interface para obter dados de partidas."""

    def get_next_match(self) -> FootballAdapterResult:  # pragma: no cover - interface
        raise NotImplementedError


class MockFootballAdapter(FootballAdapter):
    def __init__(self, fixture_path: str | None = None) -> None:
        self.fixture_path = Path(fixture_path) if fixture_path else FIXTURES_DIR / "match_scheduled.json"

    def get_next_match(self) -> FootballAdapterResult:
        data = self.fixture_path.read_text(encoding="utf-8")
        import json

        payload = json.loads(data)
        return FootballAdapterResult(payload=payload, mock=True, provider="mock_fixture")


class RealFootballAdapter(FootballAdapter):
    """Adapter simples para API-Football (api-sports) como fallback opcional."""

    def __init__(self, api_key: str, team_id: int = 127, season: int = 2026) -> None:
        self.api_key = api_key
        self.team_id = team_id
        self.season = season
        self.base_url = "https://v3.football.api-sports.io"

    def get_next_match(self) -> FootballAdapterResult:
        headers = {"x-apisports-key": self.api_key}
        params = {"team": self.team_id, "next": 1, "season": self.season, "timezone": "America/Sao_Paulo"}
        response = requests.get(f"{self.base_url}/fixtures", headers=headers, params=params, timeout=15)
        response.raise_for_status()
        body = response.json()
        items = body.get("response", [])
        if not items:
            raise RuntimeError("API de futebol não retornou próximo jogo.")
        fixture = items[0]
        kickoff = fixture["fixture"]["date"]
        # date já vem com offset; mantemos como ISO textual
        payload = {
            "match_id": f"api-sports-{fixture['fixture']['id']}",
            "competition": fixture["league"]["name"],
            "kickoff_iso": kickoff,
            "home": fixture["teams"]["home"]["name"],
            "away": fixture["teams"]["away"]["name"],
            "venue": (fixture.get("fixture", {}).get("venue", {}) or {}).get("name") or "",
            "status": "scheduled",
            "score_home": None,
            "score_away": None,
            "lineup_confirmed": False,
            "broadcast": [],
        }
        return FootballAdapterResult(payload=payload, mock=False, provider="api_sports")


def get_football_adapter(api_key: str, fixture_path: str | None = None) -> FootballAdapter:
    if api_key:
        return RealFootballAdapter(api_key=api_key)
    return MockFootballAdapter(fixture_path=fixture_path)
