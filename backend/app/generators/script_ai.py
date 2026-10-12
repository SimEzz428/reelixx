# backend/app/generators/script_ai.py
"""Ad script generation: four timed beats (hook → value → proof → CTA).

`generate_script` uses a deterministic template. `generate_script_ai` asks
gpt-4o-mini for punchier copy and falls back to the template on any failure.
Both return the same shape: {"beats": [{id, start, end, text}], "meta": {...}}.
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional

from ..ai_client import get_client

log = logging.getLogger(__name__)

BEAT_IDS = ("hook", "value", "proof", "cta")
# Share of total duration for each beat.
BEAT_WEIGHTS = (0.2, 0.35, 0.2, 0.25)

PROOF_BY_TONE = {
    "professional": "Trusted by thousands of happy customers.",
    "playful": "Your new favourite thing. Seriously.",
    "luxury": "Crafted for those who expect more.",
    "energetic": "People can't stop talking about it.",
    "expert": "Engineered and tested to perform.",
}


def _brief_fields(brief: Dict[str, Any]) -> tuple[str, str, str, List[str]]:
    product = brief.get("product") if isinstance(brief.get("product"), dict) else {}
    title = str(brief.get("title") or brief.get("product_title") or product.get("title") or "Your product").strip()
    desc = str(brief.get("description") or product.get("description") or "").strip()
    price = str(brief.get("price") or "").strip()
    bullets = [str(b).strip() for b in (brief.get("bullets") or []) if str(b).strip()]
    return title, desc, price, bullets


def format_price(price: str) -> str:
    price = price.strip()
    if not price:
        return ""
    return f"${price}" if re.fullmatch(r"\d+(\.\d{1,2})?", price) else price


def _first_sentence(text: str, limit: int = 90) -> str:
    sentence = re.split(r"(?<=[.!?])\s", text.strip(), maxsplit=1)[0]
    if len(sentence) > limit:
        sentence = sentence[:limit].rsplit(" ", 1)[0] + "…"
    return sentence


def _timed(texts: List[str], duration_sec: float) -> List[Dict[str, Any]]:
    beats, t = [], 0.0
    for beat_id, weight, text in zip(BEAT_IDS, BEAT_WEIGHTS, texts):
        end = round(t + duration_sec * weight, 2)
        beats.append({"id": beat_id, "start": round(t, 2), "end": end, "text": text})
        t = end
    return beats


def generate_script(
    brief: Dict[str, Any],
    *,
    tone: Optional[str] = None,
    persona: Optional[str] = None,
    duration_sec: float = 12.5,
) -> Dict[str, Any]:
    title, desc, price, bullets = _brief_fields(brief)
    price_txt = format_price(price)
    proof = PROOF_BY_TONE.get((tone or "").lower(), PROOF_BY_TONE["professional"])
    texts = [
        f"Meet {title}.",
        _first_sentence(desc) or f"{title} makes every day easier.",
        _first_sentence(bullets[0], 70) if bullets else proof,
        f"Get yours for {price_txt} — tap the link." if price_txt else "Tap the link to get yours today.",
    ]
    return {"beats": _timed(texts, duration_sec), "meta": {"tone": tone, "persona": persona, "source": "template"}}


def generate_script_ai(
    brief: Dict[str, Any],
    *,
    tone: Optional[str] = None,
    persona: Optional[str] = None,
    duration_sec: float = 12.5,
) -> Dict[str, Any]:
    title, desc, price, bullets = _brief_fields(brief)
    prompt = (
        "Write voiceover lines for a short vertical video ad with exactly four beats: "
        "hook, value, proof, cta. Each line must be under 12 words, spoken naturally, no hashtags or emojis.\n"
        f"Product: {title}\nDescription: {desc or 'n/a'}\nPrice: {format_price(price) or 'n/a'}\n"
        f"Key features: {'; '.join(bullets[:5]) or 'n/a'}\nTone: {tone or 'professional'}\n"
        f"Speaker persona: {persona or 'friendly creator'}\n"
        'Respond with JSON: {"hook": "...", "value": "...", "proof": "...", "cta": "..."}'
    )
    try:
        res = get_client().chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a direct-response copywriter for TikTok and Reels ads."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.8,
            max_tokens=300,
        )
        data = json.loads(res.choices[0].message.content or "{}")
        texts = [str(data.get(k) or "").strip() for k in BEAT_IDS]
        if not all(texts):
            raise ValueError(f"incomplete script: {data}")
    except Exception as e:  # network, quota, bad JSON — never block generation on copywriting
        log.warning("AI script failed, using template: %s", e)
        return generate_script(brief, tone=tone, persona=persona, duration_sec=duration_sec)
    return {"beats": _timed(texts, duration_sec), "meta": {"tone": tone, "persona": persona, "source": "ai"}}
