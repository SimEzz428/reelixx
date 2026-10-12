# backend/app/ai_client.py
"""Single, lazily-created OpenAI client.

The client is only built on first use so the API can boot (and run in free
mode) without an OPENAI_API_KEY.
"""
from __future__ import annotations

import os
from functools import lru_cache
from typing import Any


def ai_available() -> bool:
    """True when paid AI features may be used (key present and free mode off)."""
    return bool(os.getenv("OPENAI_API_KEY")) and os.getenv("REELIXX_FREE_MODE", "0") != "1"


@lru_cache(maxsize=1)
def _client() -> Any:
    from openai import OpenAI

    return OpenAI(api_key=os.environ["OPENAI_API_KEY"])


def get_client() -> Any:
    """Return the OpenAI client, or raise if AI features are unavailable."""
    if not ai_available():
        raise RuntimeError(
            "AI features are disabled. Set OPENAI_API_KEY and REELIXX_FREE_MODE=0 in backend/.env."
        )
    return _client()
