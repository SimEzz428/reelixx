from __future__ import annotations
from typing import Any, Dict, List

# Maps script beats -> suggested visuals, overlays, transitions, and sfx.
# No external APIs yet; deterministic and safe defaults for 9:16 vertical.

DEFAULT_CANVAS = {"w": 1080, "h": 1920, "fps": 30}

def _overlay_text(text: str, style: str = "default") -> Dict[str, Any]:
    return {"type": "text", "text": text, "style": style}

def _endcard_overlay(brief: Dict[str, Any]) -> List[Dict[str, Any]]:
    # brand may be a dict (with color/logo) or a plain string (brand name only)
    brand = brief.get("brand") or {}
    color = "#111111"
    logo = None

    if isinstance(brand, dict):
        color = brand.get("color") or color
        logo = brand.get("logo_url")
    # if it's a string we just keep defaults

    return [
        {"type": "panel", "color": color, "alpha": 0.9},
        {"type": "logo", "url": logo} if logo else {"type": "shape", "shape": "circle"},
    ]

def _beat_visual(beat_id: str, brief: Dict[str, Any]) -> Dict[str, Any]:
    title = brief.get("title") or "product"
    images = brief.get("images") or []
    # Prefer product image if available
    if images:
        primary = images[0]
    else:
        primary = None

    if beat_id == "hook":
        return {
            "type": "image_or_stock",
            "prefer": primary,
            "query": f"close-up {title}, dramatic lighting, vertical",
        }
    if beat_id == "value":
        return {"type": "user_or_stock", "query": f"{title} in use, hands-on vertical demo"}
    if beat_id == "proof":
        return {"type": "stock", "query": "happy customer reaction, lifestyle vertical"}
    if beat_id == "cta":
        return {"type": "endcard", "brand": True}
    return {"type": "stock", "query": f"{title} abstract motion"}

def _transition_in(beat_id: str) -> str:
    return "cut" if beat_id == "hook" else "whip"

def _sfx_for(beat_id: str) -> str:
    return {"hook": "whoosh", "value": "whoosh", "proof": "soft_pop", "cta": "click"}.get(beat_id, "whoosh")

def compose_storyboard(script: Dict[str, Any], brief: Dict[str, Any]) -> Dict[str, Any]:
    """
    Input: script JSON from generate_script()
    Output: storyboard JSON the assembler can use later.
    """
    beats = script.get("beats", [])
    scenes: List[Dict[str, Any]] = []
    for b in beats:
        beat_id = b.get("id")
        scene = {
            "id": beat_id,
            "start": float(b.get("start", 0.0)),
            "end": float(b.get("end", 0.0)),
            "visual": _beat_visual(beat_id, brief),
            "transition_in": _transition_in(beat_id),
            "overlay": [],
            "sfx": _sfx_for(beat_id),
        }

        # Overlay rules
        vo_text = (b.get("text") or b.get("vo") or "")[:48]
        if beat_id in ("hook", "value", "proof"):
            scene["overlay"].append(_overlay_text(vo_text, style="caption"))
        elif beat_id == "cta":
            scene["overlay"].append(_overlay_text("Try it today →", style="cta"))
            scene["overlay"].extend(_endcard_overlay(brief))

        scenes.append(scene)

    return {
        "version": "1.0",
        "canvas": DEFAULT_CANVAS,
        "audio": {"music": "upbeat_01", "duck": True, "vo_text": " ".join([b.get("vo","") for b in beats])},
        "scenes": scenes,
        "exports": [{"preset": "vertical_1080p"}],
    }