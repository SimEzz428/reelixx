# backend/app/generators/video_ai.py
from __future__ import annotations

from pathlib import Path
from typing import Dict, Any, List, Tuple
import io
import os
import time
import base64
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from pydub import AudioSegment
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips

# ---------- Paths ----------
APP_DIR = Path(__file__).resolve().parent
ASSETS_DIR = APP_DIR / "assets"
EXPORT_DIR = APP_DIR.parent / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

# ---------- Env / Modes ----------
API_KEY = os.getenv("OPENAI_API_KEY")
FREE_MODE = os.getenv("REELIXX_FREE_MODE", "0") == "1" or not API_KEY

# Lazy OpenAI client (only if available & not in free mode)
client = None
if not FREE_MODE:
    from openai import OpenAI  # import here to avoid import overhead in free mode
    client = OpenAI(api_key=API_KEY)

# ---------- Helpers (common) ----------
def _pick_font(size: int) -> ImageFont.ImageFont:
    """Pick a font that exists on macOS/Linux; fallback to default."""
    candidates = [
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/SFNSRounded.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()

def _wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int, max_lines: int = 4) -> List[str]:
    words = text.split()
    lines: List[str] = []
    cur = ""
    for w in words:
        trial = (cur + " " + w).strip()
        bbox = draw.textbbox((0, 0), trial, font=font)
        if (bbox[2] - bbox[0]) <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
        if len(lines) >= max_lines:
            break
    if cur and len(lines) < max_lines:
        lines.append(cur)
    return lines

def _hex_to_rgb(h: str | None, default=(17, 17, 17)) -> Tuple[int, int, int]:
    if not h or not isinstance(h, str):
        return default
    c = h.strip().lstrip("#")
    try:
        if len(c) == 6:
            return (int(c[0:2],16), int(c[2:4],16), int(c[4:6],16))
        if len(c) == 3:
            return tuple(int(x*2, 16) for x in c)  # type: ignore
    except Exception:
        pass
    return default

# ---------- Assets ----------
def _pick_music(mood: str | None = "upbeat") -> Path | None:
    """
    Return a music asset path if it exists; otherwise None (we'll fall back to silence).
    """
    mood = (mood or "upbeat").lower().strip()
    candidates = {
        "upbeat": ASSETS_DIR / "music_upbeat.mp3",
        "chill": ASSETS_DIR / "music_chill.mp3",
        "corporate": ASSETS_DIR / "music_corporate.mp3",
        "energetic": ASSETS_DIR / "music_energetic.mp3",
    }
    p = candidates.get(mood) or candidates["upbeat"]
    return p if p.exists() else None

# ---------- TTS ----------
def tts_generate(text: str, voice: str = "alloy") -> Path:
    """
    Generate an MP3 voiceover.
    - Pro mode: OpenAI TTS (gpt-4o-mini-tts)
    - Free mode: silent MP3 whose duration ~= reading time
    """
    out = EXPORT_DIR / f"vo_{int(time.time()*1000)}.mp3"

    if FREE_MODE or client is None:
        # Estimate duration: ~14 chars/sec, min 1.2s
        secs = max(1.2, len(text.strip()) / 14.0)
        silence = AudioSegment.silent(duration=int(secs * 1000))
        silence.export(out, format="mp3")
        return out

    # OpenAI TTS
    with client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice=voice,
        input=text
    ) as resp:
        resp.stream_to_file(out)
    return out

# ---------- Music mix ----------
def bg_music_overlay(voice_path: Path, music_path: Path | None, music_gain_db: float = -15.0) -> Path:
    """
    Mix background music under the voice. If music_path is None, just return voice.
    """
    voice = AudioSegment.from_file(str(voice_path))

    if music_path and music_path.exists():
        music = AudioSegment.from_file(str(music_path))
        # Trim/loop or crop to match voice duration
        if len(music) < len(voice):
            # Simple loop if bg track is shorter
            loops = math.ceil(len(voice) / max(1, len(music)))
            music = music * loops
        music = music[: len(voice)]
        music = music + music_gain_db
        mixed = music.overlay(voice)
    else:
        mixed = voice

    out = EXPORT_DIR / f"mix_{int(time.time()*1000)}.mp3"
    mixed.export(out, format="mp3")
    return out

# ---------- Image generation ----------
def generate_scene_image(prompt: str, size: str = "1024x1536", brand_color: str = "#111111") -> Path:
    """
    Create a scene image.
    - Pro mode: OpenAI gpt-image-1
    - Free mode: solid background with clean wrapped text
    """
    out = EXPORT_DIR / f"scene_{int(time.time()*1000)}.png"

    if FREE_MODE or client is None:
        # Make a nice 9:16 canvas and place prompt text
        w, h = (1080, 1920)
        bg = _hex_to_rgb(brand_color, (17, 17, 17))
        img = Image.new("RGB", (w, h), bg)
        draw = ImageDraw.Draw(img)

        title_font = _pick_font(int(h * 0.06))
        body_w = int(w * 0.8)
        lines = _wrap(draw, prompt.strip() or " ", title_font, body_w, max_lines=6)

        y = int(h * 0.25)
        for i, line in enumerate(lines):
            bb = draw.textbbox((0, 0), line, font=title_font)
            tw = bb[2] - bb[0]
            x = (w - tw) // 2
            draw.text((x, y), line, fill=(255, 255, 255), font=title_font)
            y += int(title_font.size * 1.25)

        img.save(out, format="PNG", optimize=True)
        return out

    # OpenAI image
    res = client.images.generate(
        model="gpt-image-1",
        prompt=f"vertical 9:16 cinematic product ad still, {prompt}",
        size=size,
        quality="high",
    )
    b64 = res.data[0].b64_json
    img = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
    img.save(out, format="PNG", optimize=True)
    return out

# ---------- Public entry ----------
def generate_ai_ad(
    storyboard: Dict[str, Any],
    caption: Dict[str, Any] | str,
    *,
    brand_color: str = "#111111",
    music_mood: str | None = "upbeat",
    tts_voice: str = "alloy",
) -> Dict[str, Any]:
    """
    Build the ad:
      - TTS per scene (or silence in free mode)
      - Background music under VO (or silence if missing)
      - One image per scene (OpenAI or local slide)
    """
    scenes: List[Dict[str, Any]] = storyboard.get("scenes") or []
    if not scenes:
        raise ValueError("Storyboard must contain scenes.")

    # background music
    music_file = _pick_music(music_mood)

    clips = []
    for s in scenes:
        # Text source: scene text -> caption string -> caption.caption
        raw_caption = caption if isinstance(caption, str) else (caption.get("caption") if isinstance(caption, dict) else "")
        text = (s.get("text") or raw_caption or "").strip() or " "

        # 1) voice
        voice_mp3 = tts_generate(text, voice=tts_voice)

        # 2) music mix
        mixed_mp3 = bg_music_overlay(voice_mp3, music_file)

        # 3) image
        img_path = generate_scene_image(text, size="1024x1536", brand_color=brand_color)

        # 4) clip (duration from audio)
        audio_clip = AudioFileClip(str(mixed_mp3))
        frame = np.array(Image.open(img_path).convert("RGB"))
        clip = (
            ImageClip(frame)
            .set_duration(audio_clip.duration)
            .set_audio(audio_clip)
            .set_fps(30)
        )
        clips.append(clip)

    final = concatenate_videoclips(clips, method="compose")

    ts = int(time.time())
    out_path = EXPORT_DIR / f"ai_ad_{ts}.mp4"
    final.write_videofile(
        str(out_path),
        fps=30,
        codec="libx264",
        audio_codec="aac",
        threads=2,
        logger=None,
    )
    final.close()

    return {
        "ok": True,
        "path": str(out_path),
        "url": f"/exports/{out_path.name}",
        "filename": out_path.name,
    }