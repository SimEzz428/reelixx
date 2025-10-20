# backend/app/generators/voice_ai.py
from __future__ import annotations
from pathlib import Path
import time, os
from openai import OpenAI


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

APP_DIR = Path(__file__).resolve().parent
EXPORT_DIR = APP_DIR.parent / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


def tts_generate(text: str, voice: str = "alloy") -> Path:

    out = EXPORT_DIR / f"vo_{int(time.time() * 1000)}.mp3"

   
    with client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice=voice,
        input=text
    ) as resp:
        resp.stream_to_file(out)

    return out