from __future__ import annotations

from typing import Any, Dict, List, Optional

from .video_ai import FORMATS

ENDCARD_SECONDS = 2.5
SFX = {"hook": "whoosh", "value": "whoosh", "proof": "soft_pop", "cta": "click"}


def _visual(beat_id: str, title: str, images: List[str]) -> Dict[str, Any]:
    if beat_id == "hook":
        return {"type": "image", "prefer": images[0] if images else None,
                "query": f"hero shot of {title}, dramatic lighting, close-up"}
    if beat_id == "value":
        return {"type": "image", "query": f"{title} in use, hands-on lifestyle demo"}
    if beat_id == "proof":
        return {"type": "image", "query": f"happy customer enjoying {title}, lifestyle"}
    return {"type": "image", "query": f"{title} product shot on clean studio background"}


def brand_name_of(brief: Dict[str, Any], brand: Optional[Dict[str, Any]] = None) -> str:
    if isinstance(brand, dict) and brand.get("name"):
        return str(brand["name"]).strip()
    b = brief.get("brand")
    if isinstance(b, dict):
        b = b.get("name")
    return str(b or brief.get("title") or "Your Brand").strip()


def compose_storyboard(
    script: Dict[str, Any],
    brief: Dict[str, Any],
    *,
    brand: Optional[Dict[str, Any]] = None,
    fmt: str = "reel",
) -> Dict[str, Any]:
    """Turn a timed script into a storyboard the video renderer understands."""
    title = str(brief.get("title") or "product")
    images = [i for i in (brief.get("images") or []) if isinstance(i, str)]
    w, h = FORMATS.get(fmt, FORMATS["reel"])

    scenes: List[Dict[str, Any]] = []
    for b in script.get("beats", []):
        beat_id = b.get("id") or "beat"
        text = str(b.get("text") or b.get("vo") or "").strip()
        scenes.append({
            "id": beat_id,
            "start": float(b.get("start", 0.0)),
            "end": float(b.get("end", 0.0)),
            "text": text,
            "visual": _visual(beat_id, title, images),
            "transition_in": "cut" if beat_id == "hook" else "whip",
            "overlay": [{"type": "text", "text": text, "style": "cta" if beat_id == "cta" else "caption"}],
            "sfx": SFX.get(beat_id, "whoosh"),
        })

    last_end = max((s["end"] for s in scenes), default=0.0)
    name = brand_name_of(brief, brand)
    scenes.append({
        "id": "endcard",
        "start": last_end,
        "end": last_end + ENDCARD_SECONDS,
        "text": name,
        "visual": {"type": "endcard"},
        "overlay": [{"type": "text", "text": "Try it today →", "style": "cta"}],
        "sfx": "click",
        "transition_in": "whip",
    })

    return {
        "version": "1.1",
        "format": fmt if fmt in FORMATS else "reel",
        "canvas": {"w": w, "h": h, "fps": 30},
        "audio": {"music": "upbeat", "duck": True, "vo_text": " ".join(s["text"] for s in scenes[:-1])},
        "scenes": scenes,
    }
