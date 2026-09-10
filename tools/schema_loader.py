"""Carregamento e validação de JSON Schema."""

from __future__ import annotations

import json
from typing import Any

from jsonschema import Draft202012Validator

from common import SCHEMAS_DIR


class SchemaError(Exception):
    """Erro de validação de schema."""


def load_schema(name: str) -> dict[str, Any]:
    path = SCHEMAS_DIR / name
    return json.loads(path.read_text(encoding="utf-8"))


def validate_with_schema(data: Any, schema_name: str) -> None:
    schema = load_schema(schema_name)
    validator = Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(data), key=lambda e: e.path)
    if errors:
        msgs = []
        for err in errors:
            where = ".".join([str(p) for p in err.path]) or "raiz"
            msgs.append(f"{where}: {err.message}")
        raise SchemaError("; ".join(msgs))
