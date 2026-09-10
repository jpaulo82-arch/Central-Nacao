"""Cliente RSS com politeness e retries."""

from __future__ import annotations

import time
from datetime import datetime
from typing import Any

import feedparser
import requests

from common import TZ, iso_sp


class RssClient:
    def __init__(self) -> None:
        self._domain_last_hit: dict[str, float] = {}

    def _respect_politeness(self, domain: str) -> None:
        now = time.time()
        last = self._domain_last_hit.get(domain)
        if last is not None:
            elapsed = now - last
            if elapsed < 5:
                time.sleep(5 - elapsed)
        self._domain_last_hit[domain] = time.time()

    def fetch_feed(self, feed_url: str, source_id: str, source_name: str) -> list[dict[str, Any]]:
        domain = feed_url.split("/")[2] if "://" in feed_url else feed_url
        self._respect_politeness(domain)

        errors: list[str] = []
        backoffs = [0, 5, 15, 30]
        last_exc: Exception | None = None
        for attempt, wait_s in enumerate(backoffs, start=1):
            if wait_s:
                time.sleep(wait_s)
            try:
                response = requests.get(feed_url, timeout=15)
                response.raise_for_status()
                parsed = feedparser.parse(response.text)
                entries = []
                for entry in parsed.entries:
                    url = entry.get("link", "")
                    title = (entry.get("title", "") or "").strip()
                    summary = (entry.get("summary", "") or "").strip()
                    published_parsed = entry.get("published_parsed") or entry.get("updated_parsed")
                    if published_parsed:
                        dt = datetime(*published_parsed[:6], tzinfo=TZ)
                        published_at = dt.isoformat(timespec="seconds")
                    else:
                        published_at = iso_sp()
                    entries.append(
                        {
                            "source_id": source_id,
                            "source_name": source_name,
                            "url": url,
                            "title_raw": title,
                            "summary_raw": summary,
                            "published_at": published_at,
                            "fetched_at": iso_sp(),
                        }
                    )
                return entries
            except Exception as exc:
                last_exc = exc
                errors.append(f"tentativa {attempt}: {exc}")
        raise RuntimeError("Falha no fetch RSS após retries: " + " | ".join(errors)) from last_exc
