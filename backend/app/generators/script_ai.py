# backend/app/generators/script_ai.py
from __future__ import annotations
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_script_storyboard(
    title: str,
    description: str,
    tone: str = "neutral",
    voice: str = "alloy",
    music_mood: str = "calm",
    duration_sec: int = 15,
    bullets: list[str] | None = None,  # ✅ allow bullets
) -> dict:
   
    bullet_text = ""
    if bullets:
        bullet_text = "Key features:\n" + "\n".join(f"- {b}" for b in bullets)

    prompt = f"""
    Write a 15-second video ad storyboard for the following product.

    Title: {title}
    Description: {description}
    {bullet_text}

    Tone: {tone}
    Voice: {voice}
    Music mood: {music_mood}

    Return JSON with:
    {{
      "canvas": {{"w": 1080, "h": 1920, "fps": 30}},
      "scenes": [
        {{"start": 0, "end": 3, "text": "...", "sfx": "...", "transition_in": "..."}},
        ...
      ]
    }}
    """

    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a creative ad director who writes concise and vivid storyboards."},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.8,
        max_tokens=700,
    )

    out = res.choices[0].message.content
    import json

    try:
        data = json.loads(out)
    except Exception:
        data = {
            "canvas": {"w": 1080, "h": 1920, "fps": 30},
            "scenes": [
                {"start": 0, "end": 3, "text": "Introducing your product.", "sfx": "whoosh"},
                {"start": 3, "end": duration_sec, "text": "Fast. Reliable. Made for you.", "sfx": "ding"},
            ],
        }

    return data