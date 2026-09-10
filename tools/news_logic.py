"""Lógica determinística de classificação, dedupe e criação de cards."""

from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from difflib import SequenceMatcher
from typing import Any

from common import RUMOR_TRIGGERS, TZ, is_official_url, normalize_spaces


@dataclass
class CardBuildResult:
    cards: list[dict[str, Any]]
    duplicates_removed: int
    needs_review_count: int


def _extract_entities(text: str) -> set[str]:
    tokens = re.findall(r"[A-Za-zÀ-ÿ]{3,}", text)
    entities = {t.lower() for t in tokens if t[:1].isupper() or t.lower() in {"flamengo", "fla-flu", "maracanã"}}
    return entities


def similarity_title_entities(a: str, b: str) -> float:
    a_n = normalize_spaces(a).lower()
    b_n = normalize_spaces(b).lower()
    title_score = SequenceMatcher(None, a_n, b_n).ratio()
    ea = _extract_entities(a)
    eb = _extract_entities(b)
    if ea or eb:
        jaccard = len(ea & eb) / max(len(ea | eb), 1)
    else:
        jaccard = 0.0
    return (title_score * 0.8) + (jaccard * 0.2)


def _has_cross_confirmation(item: dict[str, Any], all_items: list[dict[str, Any]]) -> bool:
    source = item.get("source_name", "")
    peers = 0
    for other in all_items:
        if other is item:
            continue
        if other.get("source_name") == source:
            continue
        if similarity_title_entities(item.get("title_raw", ""), other.get("title_raw", "")) > 0.82:
            peers += 1
    return peers >= 1


def apply_stamp_rules(card: dict[str, Any], raw_item: dict[str, Any], all_items: list[dict[str, Any]]) -> dict[str, Any]:
    combined = f"{raw_item.get('title_raw', '')} {raw_item.get('summary_raw', '')}".lower()
    if is_official_url(raw_item.get("url", "")):
        card["stamp"] = "oficial"
    elif any(k in combined for k in RUMOR_TRIGGERS) and not _has_cross_confirmation(raw_item, all_items):
        card["stamp"] = "rumor"
    else:
        if card.get("stamp") not in {"oficial", "confirmado", "rumor", "opiniao", "meme", "ugc"}:
            card["stamp"] = "confirmado"
            card["needs_review"] = True
    return card


def _group_duplicates(items: list[dict[str, Any]]) -> list[list[int]]:
    parent = list(range(len(items)))

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a: int, b: int) -> None:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if similarity_title_entities(items[i]["title"], items[j]["title"]) > 0.82:
                union(i, j)

    buckets: dict[int, list[int]] = defaultdict(list)
    for idx in range(len(items)):
        buckets[find(idx)].append(idx)
    return list(buckets.values())


def _parse_iso(value: str) -> datetime:
    return datetime.fromisoformat(value).astimezone(TZ)


def dedupe_cards(cards: list[dict[str, Any]], raw_items: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], int]:
    groups = _group_duplicates(cards)
    removed = 0
    for group in groups:
        if len(group) <= 1:
            continue

        ordered = sorted(group, key=lambda idx: _parse_iso(raw_items[idx]["published_at"]))
        oldest_idx = ordered[0]
        official_indices = [idx for idx in ordered if cards[idx]["stamp"] == "oficial"]

        keep = {oldest_idx}
        keep.update(official_indices)
        primary = oldest_idx

        for idx in ordered:
            if idx in keep:
                continue
            cards[idx]["duplicate_of"] = cards[primary]["card_id"]
            removed += 1
    return cards, removed


def assign_card_ids(cards: list[dict[str, Any]], date_compact: str) -> None:
    counters: dict[str, int] = defaultdict(int)
    for card in cards:
        cat = card.get("category", "outro")
        counters[cat] += 1
        card["card_id"] = f"{date_compact}-{cat}-{counters[cat]:02d}"


def count_needs_review(cards: list[dict[str, Any]]) -> int:
    return sum(1 for c in cards if c.get("needs_review"))
