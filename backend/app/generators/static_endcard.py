from __future__ import annotations
from typing import Any, Dict, Tuple
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import os

DEFAULT_W, DEFAULT_H = 1080, 1920

def _pick_color(brand: Dict[str, Any] | None) -> Tuple[int, int, int]:
    # brand may be dict or string
    if isinstance(brand, dict):
        color = brand.get("color")
        if isinstance(color, str):
            c = color.strip().lstrip("#")
            try:
                if len(c) == 6:
                    return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))  # type: ignore
                if len(c) == 3:
                    return tuple(int(c[i] * 2, 16) for i in range(3))  # type: ignore
            except Exception:
                pass
    # default dark
    return (17, 17, 17)

def _text(draw: ImageDraw.ImageDraw, xy: Tuple[int, int], text: str, size: int, color=(255,255,255), anchor="mm"):
    # Try a few common fonts; fallback to default
    font_paths = [
        "/System/Library/Fonts/SFCompactRounded.ttf",  # macOS (often)
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    font = None
    for p in font_paths:
        if os.path.exists(p):
            try:
                font = ImageFont.truetype(p, size)
                break
            except Exception:
                continue
    if font is None:
        font = ImageFont.load_default()
    draw.text(xy, text, fill=color, font=font, anchor=anchor)

def render_endcard(brief: Dict[str, Any] | None, brand: Dict[str, Any] | None, *, w: int = DEFAULT_W, h: int = DEFAULT_H, cta: str = "Try it today →") -> str:
    """
    Returns a data URL: 'data:image/png;base64,...'
    """
    title = ""
    if isinstance(brief, dict):
        # brief.brand might be a string; we only need title here
        title = str(brief.get("title") or "").strip()

    bg = _pick_color(brand)
    img = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(img)

    # Layout
    padding = int(h * 0.05)
    center_x = w // 2

    # Title
    if title:
        _text(d, (center_x, int(h * 0.35)), title[:28], size=int(h * 0.055), color=(255,255,255))

    # CTA button
    btn_w, btn_h = int(w * 0.66), int(h * 0.09)
    btn_x0 = (w - btn_w) // 2
    btn_y0 = int(h * 0.56)
    btn_x1 = btn_x0 + btn_w
    btn_y1 = btn_y0 + btn_h

    # Button bg (white by default)
    d.rounded_rectangle([btn_x0, btn_y0, btn_x1, btn_y1], radius=24, fill=(255,255,255))
    _text(d, (center_x, btn_y0 + btn_h // 2), cta[:32], size=int(h * 0.038), color=(0,0,0))

    # Footer strip (slightly darker)
    footer_h = int(h * 0.14)
    d.rectangle([0, h - footer_h, w, h], fill=(0,0,0, 40))
    _text(d, (center_x, h - footer_h // 2), "Reelixx • auto-generated end-card", size=int(h * 0.03), color=(220,220,220))

    # Encode to base64 data URL
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/png;base64,{b64}"