from __future__ import annotations

import base64
import io
from typing import Any, Dict

from .storyboard import brand_name_of
from .video_ai import render_endcard as _render


def render_endcard(
    brief: Dict[str, Any] | None,
    brand: Dict[str, Any] | None,
    *,
    w: int = 1080,
    h: int = 1920,
    cta: str = "Try it today →",
) -> str:
    """Render the brand end-card as a PNG data URL (same design as the video end-card)."""
    brief = brief if isinstance(brief, dict) else {}
    brand = brand if isinstance(brand, dict) else {}
    img = _render((w, h), str(brand.get("color") or "#111111"), brand_name_of(brief, brand), cta[:32])
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")
