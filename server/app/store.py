"""In-memory chart cache. MVP 用内存即可；重启即清空。"""
from __future__ import annotations

import threading
from typing import Any

_lock = threading.Lock()
_charts: dict[str, dict[str, Any]] = {}


def put(chart_id: str, chart: dict[str, Any]) -> None:
    with _lock:
        _charts[chart_id] = chart


def get(chart_id: str) -> dict[str, Any] | None:
    with _lock:
        return _charts.get(chart_id)


def size() -> int:
    with _lock:
        return len(_charts)
