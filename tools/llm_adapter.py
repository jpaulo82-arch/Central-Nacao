"""Adapter LLM opcional com mock determinístico."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import requests

from common import normalize_spaces


@dataclass
class LlmClassification:
    title: str
    lede: str
    stamp: str
    category: str
    team_unit: str


def _infer_category(text: str) -> str:
    t = text.lower()
    if any(k in t for k in ["jogo", "fla-flu", "maracanã", "escalação", "treino"]):
        return "jogo"
    if any(k in t for k in ["renovação", "janela", "sonda", "mercado", "contrato"]):
        return "mercado"
    if any(k in t for k in ["lesão", "desfalque"]):
        return "lesao"
    if any(k in t for k in ["conselho", "diretoria"]):
        return "conselho"
    if any(k in t for k in ["história", "memória"]):
        return "historia"
    if any(k in t for k in ["meme"]):
        return "meme"
    if any(k in t for k in ["trânsito", "bar", "embaixada", "loja"]):
        return "local"
    return "outro"


def classify_mock(title_raw: str, summary_raw: str) -> dict[str, Any]:
    text = normalize_spaces(f"{title_raw}. {summary_raw}")
    category = _infer_category(text)
    title = normalize_spaces(title_raw)[:120]
    lede_base = normalize_spaces(summary_raw)[:220]
    lede = lede_base if lede_base else f"A Nação acompanha: {title.lower()}."
    return {
        "title": title,
        "lede": lede,
        "stamp": "confirmado",
        "category": category,
        "team_unit": "profissional_m",
    }


def classify_with_llm(api_key: str, title_raw: str, summary_raw: str) -> dict[str, Any]:
    """Chamada opcional e simples de LLM; em erro, subir exceção para fallback mock."""
    prompt = (
        "Retorne JSON com campos title, lede, stamp, category, team_unit para notícia do Flamengo. "
        "Sem markdown."
    )
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Título: {title_raw}\nResumo: {summary_raw}"},
            ],
            "temperature": 0,
            "response_format": {"type": "json_object"},
        },
        timeout=20,
    )
    response.raise_for_status()
    payload = response.json()
    content = payload["choices"][0]["message"]["content"]
    import json

    return json.loads(content)
