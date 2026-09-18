"""Scraper de tabela do Brasileirao via Wikipedia (fonte publica, sem chave de API paga).

Extraimos apenas dados factuais (posicao, pontos, jogos, vitorias, empates,
derrotas, saldo de gols) da tabela de classificacao publicada na Wikipedia --
nunca prosa/texto editorial do artigo. Fatos e numeros nao sao protegidos por
direito autoral; a fonte fica sempre registrada no campo 'fonte' do resultado.

A Wikipedia exige um User-Agent identificavel (nao generico) para requests
automatizados -- ver https://meta.wikimedia.org/wiki/User-Agent_policy.
"""

from __future__ import annotations

import re
from typing import Any

import requests
from bs4 import BeautifulSoup

from common import now_sp

_HEADERS = {
    "User-Agent": (
        "CentralDaNacaoBot/1.0 "
        "(+https://github.com/jpaulo82-arch/Central-Nacao; pipeline editorial sem fins lucrativos) "
        "python-requests"
    )
}

# Aliases de cabecalho -> campo interno. Cobrimos variantes em ingles e
# portugues porque a Wikipedia pode servir qualquer uma dependendo do idioma
# da pagina consultada.
_HEADER_ALIASES: dict[str, str] = {
    "pos": "posicao",
    "posição": "posicao",
    "posicao": "posicao",
    "#": "posicao",
    "pld": "jogos",
    "mp": "jogos",
    "j": "jogos",
    "jogos": "jogos",
    "w": "vitorias",
    "v": "vitorias",
    "vitórias": "vitorias",
    "d": "empates",
    "e": "empates",
    "empates": "empates",
    "l": "derrotas",
    "derrotas": "derrotas",
    "gf": "gf",
    "ga": "ga",
    "gd": "saldo_gols",
    "sg": "saldo_gols",
    "+/-": "saldo_gols",
    "saldo": "saldo_gols",
    "pts": "pontos",
    "p": "pontos",
    "pontos": "pontos",
}


def _fetch(url: str) -> str:
    resp = requests.get(url, headers=_HEADERS, timeout=20)
    resp.raise_for_status()
    return resp.text


def _clean_text(node) -> str:
    return re.sub(r"\s+", " ", node.get_text(" ", strip=True)).strip()


def _first_int(text: str) -> int | None:
    m = re.search(r"-?\d+", text)
    return int(m.group()) if m else None


def _find_standings_table(soup: BeautifulSoup):
    """Acha a tabela de classificacao entre as 'wikitable' da pagina.

    Identificamos pelo cabecalho conter, ao mesmo tempo, uma coluna de pontos
    (Pts/P) e uma coluna de posicao ou time -- evita pegar tabelas de
    artilharia, premiacoes etc. que tambem usam a classe 'wikitable'.
    """
    for table in soup.find_all("table", class_=lambda c: c and "wikitable" in c):
        first_row = table.find("tr")
        if not first_row:
            continue
        headers = [_clean_text(c).lower() for c in first_row.find_all(["th", "td"])]
        has_pts = any(h in ("pts", "p", "pontos") for h in headers)
        has_pos_or_team = any(h in ("pos", "#", "posição", "posicao", "team", "clube", "equipe") for h in headers)
        if has_pts and has_pos_or_team:
            return table, headers
    return None, None


def get_classificacao_brasileirao(team_name: str = "Flamengo", year: int | None = None) -> dict[str, Any]:
    """Retorna a linha do time na tabela do Brasileirao Serie A do ano informado.

    Levanta RuntimeError se a pagina/tabela/time nao forem encontrados -- quem
    chama deve tratar isso como enriquecimento opcional (nunca derrubar o
    pipeline por causa disso).
    """
    year = year or now_sp().year
    url = f"https://en.wikipedia.org/wiki/{year}_Campeonato_Brasileiro_S%C3%A9rie_A"
    html = _fetch(url)
    soup = BeautifulSoup(html, "lxml")
    table, headers = _find_standings_table(soup)
    if table is None:
        raise RuntimeError(f"Tabela de classificacao nao encontrada em {url}.")

    col_map: dict[int, str] = {}
    for idx, h in enumerate(headers):
        key = _HEADER_ALIASES.get(h)
        if key:
            col_map[idx] = key

    rows = table.find_all("tr")[1:]
    for pos_idx, row in enumerate(rows, start=1):
        cells = row.find_all(["th", "td"])
        if not cells:
            continue
        row_text = _clean_text(row)
        if team_name.lower() not in row_text.lower():
            continue

        values: dict[str, int] = {}
        for idx, cell in enumerate(cells):
            key = col_map.get(idx)
            if not key:
                continue
            n = _first_int(_clean_text(cell))
            if n is not None:
                values[key] = n

        if "pontos" not in values or "jogos" not in values:
            # Cabecalho nao mapeou direito -- nao arriscamos devolver numero errado.
            raise RuntimeError(f"Nao consegui mapear colunas de pontos/jogos para '{team_name}' em {url}.")

        saldo = values.get("saldo_gols")
        if saldo is None and "gf" in values and "ga" in values:
            saldo = values["gf"] - values["ga"]

        return {
            "posicao": values.get("posicao", pos_idx),
            "pontos": values["pontos"],
            "jogos": values["jogos"],
            "vitorias": values.get("vitorias", 0),
            "empates": values.get("empates", 0),
            "derrotas": values.get("derrotas", 0),
            "saldo_gols": saldo if saldo is not None else 0,
            "data_ref": now_sp().date().isoformat(),
            "fonte": url,
        }

    raise RuntimeError(f"Time '{team_name}' nao encontrado na tabela de {url}.")
