from __future__ import annotations
from typing import Any, Dict, List
import re
import random


def _slugify_words(text: str) -> List[str]:
    text = re.sub(r"[^a-zA-Z0-9\s-]", " ", text).lower()
    words = [w for w in text.split() if len(w) > 2][:5]
    return words


def _mix_hashtags(
    product_words: List[str], tone: str | None, persona: str | None
) -> List[str]:
    core = {f"#{w}" for w in product_words}
    generic = {
        "#tiktokmademebuyit",
        "#viral",
        "#musthave",
        "#ad",
        "#giftideas",
        "#smallbusiness",
        "#onlineshopping",
        "#deal",
        "#trend",
        "#foryou",
    }
    style = set()
    t = (tone or "").lower()
    p = (persona or "").lower()
    if "lux" in t:
        style |= {"#luxury", "#premium"}
    if "playful" in t:
        style |= {"#fun", "#aesthetic"}
    if "expert" in t:
        style |= {"#protips", "#howto"}
    if "gen" in p:
        style |= {"#genz", "#relatable"}
    pool = list(core | generic | style)
    random.shuffle(pool)
    return pool[:10]


def generate_post_text(
    brief: Dict[str, Any] | None,
    script: Dict[str, Any] | None,
    *,
    tone: str | None,
    persona: str | None,
) -> Dict[str, Any]:
    """
    Returns:
    {
      "caption": "Short punchy line...",
      "hashtags": ["#tag1", "#tag2", ...]
    }
    """
    brief = brief or {}
    script = script or {}
    title = (brief.get("title") or "").strip()
    price = (brief.get("price") or "").strip()
    beats = script.get("beats") or []
    hook = ""
    if beats:
        hook = str(beats[0].get("vo") or beats[0].get("text") or "").strip()

    # Caption: prefer hook, keep it short, add CTA signal.
    base = hook or f"Meet {title}" if title else "Stop scrolling"
    base = re.sub(r"\s+", " ", base).strip()
    if price:
        cta = f" Tap to get yours — only {price}."
    else:
        cta = " Tap to get yours today."
    caption = (base[:95] + "…") if len(base) > 98 else base
    caption = caption + cta

    product_words = _slugify_words(title or "")
    hashtags = _mix_hashtags(product_words, tone, persona)

    return {"caption": caption, "hashtags": hashtags}
