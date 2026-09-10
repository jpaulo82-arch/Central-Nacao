"""Cliente Supabase REST opcional para escrita/leitura simples."""

from __future__ import annotations

from typing import Any

import requests


class SupabaseClient:
    """Cliente mínimo para PostgREST do Supabase."""

    def __init__(self, url: str, key: str, timeout: int = 15) -> None:
        self.url = url.rstrip("/")
        self.key = key
        self.timeout = timeout

    @property
    def enabled(self) -> bool:
        return bool(self.url and self.key)

    def _headers(self) -> dict[str, str]:
        return {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
        }

    def upsert(self, table: str, rows: list[dict[str, Any]], on_conflict: str | None = None) -> dict[str, Any]:
        params = {}
        if on_conflict:
            params["on_conflict"] = on_conflict
        response = requests.post(
            f"{self.url}/rest/v1/{table}",
            headers={**self._headers(), "Prefer": "resolution=merge-duplicates,return=representation"},
            params=params,
            json=rows,
            timeout=self.timeout,
        )
        response.raise_for_status()
        return {"status_code": response.status_code, "data": response.json() if response.text else []}

    def select(self, table: str, limit: int = 10, columns: str = "*") -> list[dict[str, Any]]:
        response = requests.get(
            f"{self.url}/rest/v1/{table}",
            headers=self._headers(),
            params={"select": columns, "limit": str(limit)},
            timeout=self.timeout,
        )
        response.raise_for_status()
        return response.json()

    def ping_write_read(self, table: str = "agent_pings") -> dict[str, Any]:
        row = {"probe": "central-da-nacao", "message": "pong"}
        write = self.upsert(table, [row])
        data = self.select(table, limit=1)
        return {"write": write["status_code"], "read_count": len(data)}
