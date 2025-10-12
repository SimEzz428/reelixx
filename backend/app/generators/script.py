from __future__ import annotations
from typing import Any, Dict, List, Optional

# Simple, deterministic script generator for MVP plumbing.
# Structure: Hook → Value → Proof → CTA (12–20s total)

def _short(text: Optional[str], fallback: str, limit: int = 8) -> str:
    if not text:
        return fallback
    words = text.split()
    return " ".join(words[:limit])

def _pick_hook(brief: Dict[str, Any], tone: Optional[str]) -> str:
    name = brief.get("title") or "this"
    price = brief.get("price")
    if tone == "luxurious":
        return f"Premium {name}, feel the difference"
    if tone == "playful":
        return f"You’re not ready for {name} 🤯"
    if tone == "expert":
        return f"{name}: engineered for daily performance"
    return f"Stop scrolling — {name} changes your routine"

def _value_lines(brief: Dict[str, Any]) -> List[str]:
    desc = brief.get("description") or ""
    brand = brief.get("brand") or ""
    benefits = brief.get("benefits") or []
    out: List[str] = []
    if benefits and isinstance(benefits, list):
        out.extend([_short(b, "", 8) for b in benefits[:3] if b])
    if not out and desc:
        out.append(_short(desc, "Built for your day", 8))
    if brand:
        out.append(f"By {brand}")
    return out[:3] or ["Lighter. Better. Everyday."]

def _proof_line(brief: Dict[str, Any]) -> str:
    # Placeholder proof; later we’ll pull ratings/UGC/social proof.
    return "Real users love the results"

def _cta_line(brief: Dict[str, Any]) -> str:
    price = brief.get("price")
    if price:
        return f"Grab yours today — only {price}"
    return "Tap to try it today"

def generate_script(brief: Dict[str, Any], tone: Optional[str] = None, persona: Optional[str] = None) -> Dict[str, Any]:
    """
    Returns a storyboard-friendly JSON:
    {
      "version": "1.0",
      "duration_s": 18.0,
      "beats": [
        {"id":"hook","start":0.0,"end":2.0,"vo":"...","text":"..."},
        ...
      ]
    }
    """
    # Timing plan (seconds)
    hook_end = 2.0
    value_end = 10.0
    proof_end = 16.0
    cta_end = 18.0

    hook = _pick_hook(brief, (tone or "").lower())
    values = _value_lines(brief)
    proof = _proof_line(brief)
    cta = _cta_line(brief)

    beats: List[Dict[str, Any]] = [
        {"id": "hook", "start": 0.0, "end": hook_end, "vo": hook, "text": _short(hook, hook, 6)},
        {"id": "value", "start": hook_end, "end": value_end, "vo": " • ".join(values), "text": _short(values[0] if values else "", "Better everyday", 6)},
        {"id": "proof", "start": value_end, "end": proof_end, "vo": proof, "text": _short(proof, proof, 6)},
        {"id": "cta", "start": proof_end, "end": cta_end, "vo": cta, "text": _short(cta, cta, 6)},
    ]

    return {
        "version": "1.0",
        "tone": tone,
        "persona": persona,
        "duration_s": cta_end,
        "beats": beats,
    }