"""Configuração de fontes e contas allowlist do MVP."""

from __future__ import annotations

SOURCES = [
    {
        "source_id": "flamengo_oficial",
        "source_name": "Flamengo (site oficial)",
        "site_url": "https://www.flamengo.com.br/noticias",
        "feed_url": "https://www.flamengo.com.br/rss/noticias.xml",
    },
    {
        "source_id": "ge_flamengo",
        "source_name": "ge Flamengo",
        "site_url": "https://ge.globo.com/futebol/times/flamengo",
        "feed_url": "https://ge.globo.com/rss/ge/futebol/times/flamengo/",
    },
    {
        "source_id": "lance_flamengo",
        "source_name": "Lance! Flamengo",
        "site_url": "https://www.lance.com.br/flamengo",
        "feed_url": "https://www.lance.com.br/rss/flamengo.xml",
    },
    {
        "source_id": "colunadofla",
        "source_name": "Coluna do Fla",
        "site_url": "https://colunadofla.com",
        "feed_url": "https://colunadofla.com/feed/",
    },
    {
        "source_id": "fla10",
        "source_name": "Fla10",
        "site_url": "https://fla10.news",
        "feed_url": "https://fla10.news/feed/",
    },
    {
        "source_id": "serflamengo",
        "source_name": "Ser Flamengo",
        "site_url": "https://serflamengo.com.br",
        "feed_url": "https://serflamengo.com.br/feed/",
    },
    {
        "source_id": "uol_flamengo",
        "source_name": "UOL Esporte",
        "site_url": "https://www.uol.com.br/esporte",
        "feed_url": "https://rss.uol.com.br/feed/esporte.xml",
    },
    {
        "source_id": "cnn_flamengo",
        "source_name": "CNN Brasil Esportes",
        "site_url": "https://www.cnnbrasil.com.br/esportes",
        "feed_url": "https://www.cnnbrasil.com.br/esportes/feed/",
    },
]

SOCIAL_ALLOWLIST = ["@Flamengo", "@flamengo_en", "@ColunadoFla"]
