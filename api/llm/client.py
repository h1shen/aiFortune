"""豆包（Volcengine Ark）LLM 客户端。Ark 兼容 OpenAI Chat Completions 协议。"""
from __future__ import annotations

from typing import AsyncIterator, Iterable

from openai import OpenAI

from ..config import ARK_API_KEY, ARK_BASE_URL, ARK_MODEL


def get_client() -> OpenAI:
    if not ARK_API_KEY:
        raise RuntimeError("ARK_API_KEY 未配置，请检查 server/.env")
    return OpenAI(base_url=ARK_BASE_URL, api_key=ARK_API_KEY)


def chat_stream(messages: Iterable[dict], *, temperature: float = 0.7, max_tokens: int = 2048) -> Iterable[str]:
    """同步流式生成（逐 token yield 字符串）。"""
    client = get_client()
    stream = client.chat.completions.create(
        model=ARK_MODEL,
        messages=list(messages),
        stream=True,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    for chunk in stream:
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta
        if delta and delta.content:
            yield delta.content


def chat_once(messages: Iterable[dict], *, temperature: float = 0.7, max_tokens: int = 2048) -> str:
    """非流式（小段一次返回），用于单轮 reading/laiyi。"""
    client = get_client()
    resp = client.chat.completions.create(
        model=ARK_MODEL,
        messages=list(messages),
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content or ""
