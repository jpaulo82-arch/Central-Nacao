#!/usr/bin/env python3
"""Ingestao da classificacao (tabela) do Brasileirao via Wikipedia.

Fonte publica e gratuita -- sem chave de API paga. E enriquecimento opcional
do payload: se a Wikipedia estiver fora do ar, mudar a pagina, ou o time nao
for encontrado, registramos o motivo e seguimos com sucesso (nunca derruba o
job de build por causa disso).
"""

from __future__ import annotations

import sys

from common import TMP_DIR, ensure_tmp_dirs, print_report, write_json
from wiki_scraper import get_classificacao_brasileirao


def main() -> int:
    ensure_tmp_dirs()
    try:
        data = get_classificacao_brasileirao()
    except Exception as exc:
        print_report({"tool": "ingest_classificacao", "ok": False, "motivo": str(exc)})
        return 0

    path = TMP_DIR / "classificacao" / "latest.json"
    write_json(path, data)
    print_report({"tool": "ingest_classificacao", "ok": True, **data, "output": str(path)})
    return 0


if __name__ == "__main__":
    sys.exit(main())
