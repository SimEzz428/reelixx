# backend/app/generators/video_ai.py
"""Render a storyboard into an MP4.

Two render modes:
  - "ai":   OpenAI images (gpt-image-1) + OpenAI TTS voiceover. Costs API credits.
  - "free": branded gradient slides with on-screen text and music only. No API calls.
  - "auto": "ai" when an API key is configured and free mode is off, else "free".
"""
from __future__ import annotations

import base64
import io
import math
import os
import tempfile
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from moviepy.editor import AudioFileClip, CompositeAudioClip, ImageClip, afx, concatenate_videoclips
from PIL import Image, ImageDraw, ImageFont

from ..ai_client import ai_available, get_client
from ..storage import EXPORT_DIR, storage

ASSETS_DIR = Path(__file__).resolve().parent / "assets"

FORMATS: Dict[str, Tuple[int, int]] = {
    "reel": (1080, 1920),
    "story": (1080, 1920),
    "square": (1080, 1080),
    "portrait": (1080, 1350),
}
MUSIC = {
    "upbeat": ASSETS_DIR / "music_upbeat.mp3",
    "chill": ASSETS_DIR / "music_chill.mp3",
    "luxury": ASSETS_DIR / "music_luxury.mp3",
}
VOICES = {"alloy", "ash", "coral", "echo", "fable", "nova", "onyx", "sage", "shimmer"}
MUSIC_VOLUME = 0.2  # ≈ -14 dB under voiceover
MUSIC_VOLUME_SOLO = 0.4  # no voiceover (free mode)


# ---------- Text / colour helpers ----------
_FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def _font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for p in _FONT_CANDIDATES:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    return ImageFont.load_default(size=size)


def hex_to_rgb(h: Optional[str], default: Tuple[int, int, int] = (17, 17, 17)) -> Tuple[int, int, int]:
    if not isinstance(h, str):
        return default
    c = h.strip().lstrip("#")
    if len(c) == 3:
        c = "".join(ch * 2 for ch in c)
    if len(c) != 6:
        return default
    try:
        return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16))
    except ValueError:
        return default


def _shade(rgb: Tuple[int, int, int], factor: float) -> Tuple[int, int, int]:
    return tuple(max(0, min(255, int(v * factor))) for v in rgb)  # type: ignore[return-value]


def _ink(bg: Tuple[int, int, int]) -> Tuple[int, int, int]:
    """Readable text colour (white or near-black) for a background colour."""
    r, g, b = bg
    return (17, 17, 17) if (0.299 * r + 0.587 * g + 0.114 * b) > 170 else (255, 255, 255)


def _wrap(draw: ImageDraw.ImageDraw, text: str, font, max_width: int, max_lines: int = 5) -> List[str]:
    lines: List[str] = []
    for paragraph in text.split("\n"):
        cur = ""
        for word in paragraph.split():
            trial = f"{cur} {word}".strip()
            if draw.textlength(trial, font=font) <= max_width or not cur:
                cur = trial
            else:
                lines.append(cur)
                cur = word
        if cur:
            lines.append(cur)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1].rstrip(".,;: ") + "…"
    return lines


def _draw_centered(draw: ImageDraw.ImageDraw, lines: List[str], font, cx: int, cy: int, fill=(255, 255, 255)) -> None:
    line_h = int(font.size * 1.25)
    y = cy - (line_h * len(lines)) // 2
    for line in lines:
        draw.text((cx, y + line_h // 2), line, font=font, fill=fill, anchor="mm")
        y += line_h


def _gradient(w: int, h: int, color: Tuple[int, int, int]) -> Image.Image:
    top, bottom = np.array(_shade(color, 1.15)), np.array(_shade(color, 0.35))
    t = np.linspace(0.0, 1.0, h)[:, None]
    rows = (top[None, :] * (1 - t) + bottom[None, :] * t).astype(np.uint8)
    return Image.fromarray(np.repeat(rows[:, None, :], w, axis=1))


# ---------- Frames ----------
def render_text_slide(text: str, size: Tuple[int, int], brand_color: str, brand_name: str = "") -> Image.Image:
    """Free-mode scene: brand gradient with large centred text."""
    w, h = size
    color = hex_to_rgb(brand_color)
    img = _gradient(w, h, color)
    draw = ImageDraw.Draw(img)
    if brand_name:
        draw.text((w // 2, int(h * 0.08)), brand_name.upper(), font=_font(int(w * 0.035)),
                  fill=_ink(_shade(color, 1.15)), anchor="mm")
    font = _font(int(w * 0.075))
    lines = _wrap(draw, text, font, int(w * 0.82))
    _draw_centered(draw, lines, font, w // 2, h // 2, fill=_ink(_shade(color, 0.75)))
    return img


def render_endcard(
    size: Tuple[int, int], brand_color: str, brand_name: str, cta: str = "Try it today →"
) -> Image.Image:
    w, h = size
    color = hex_to_rgb(brand_color)
    ink = _ink(_shade(color, 0.75))
    img = _gradient(w, h, color)
    draw = ImageDraw.Draw(img)
    title_font = _font(int(w * 0.09))
    _draw_centered(draw, _wrap(draw, brand_name or "Your Brand", title_font, int(w * 0.85), 2),
                   title_font, w // 2, int(h * 0.42), fill=ink)
    btn_w, btn_h = int(w * 0.62), int(w * 0.13)
    x0, y0 = (w - btn_w) // 2, int(h * 0.42) + int(w * 0.16)
    draw.rounded_rectangle([x0, y0, x0 + btn_w, y0 + btn_h], radius=btn_h // 2, fill=ink)
    draw.text((w // 2, y0 + btn_h // 2), cta, font=_font(int(w * 0.05)), fill=_shade(color, 0.6), anchor="mm")
    return img


def _cover(img: Image.Image, size: Tuple[int, int]) -> Image.Image:
    """Scale and centre-crop an image to exactly fill `size`."""
    w, h = size
    scale = max(w / img.width, h / img.height)
    img = img.resize((math.ceil(img.width * scale), math.ceil(img.height * scale)), Image.LANCZOS)
    left, top = (img.width - w) // 2, (img.height - h) // 2
    return img.crop((left, top, left + w, top + h))


def _caption_over(img: Image.Image, text: str) -> Image.Image:
    """Overlay caption text on a darkened band at the bottom of an image."""
    w, h = img.size
    band_h = int(h * 0.38)
    alpha = np.linspace(0, 200, band_h).astype(np.uint8)[:, None].repeat(w, axis=1)
    shade = Image.new("RGBA", (w, band_h), (0, 0, 0, 0))
    shade.putalpha(Image.fromarray(alpha))
    out = img.convert("RGBA")
    out.alpha_composite(shade, (0, h - band_h))
    draw = ImageDraw.Draw(out)
    font = _font(int(w * 0.062))
    _draw_centered(draw, _wrap(draw, text, font, int(w * 0.86), 3), font, w // 2, h - int(band_h * 0.4))
    return out.convert("RGB")


def _ai_image(prompt: str, size: Tuple[int, int]) -> Image.Image:
    w, h = size
    api_size = "1024x1024" if abs(w - h) < 50 else ("1024x1536" if h > w else "1536x1024")
    res = get_client().images.generate(
        model="gpt-image-1",
        prompt=f"Cinematic, photorealistic product advertisement shot, no text or logos in frame. {prompt}",
        size=api_size,
        quality=os.getenv("REELIXX_IMAGE_QUALITY", "medium"),
    )
    raw = base64.b64decode(res.data[0].b64_json)
    return _cover(Image.open(io.BytesIO(raw)).convert("RGB"), size)


def _tts(text: str, voice: str, out: Path) -> AudioFileClip:
    with get_client().audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts", voice=voice if voice in VOICES else "alloy", input=text
    ) as resp:
        resp.stream_to_file(out)
    return AudioFileClip(str(out))


# ---------- Public entry ----------
def resolve_mode(mode: str | None) -> str:
    mode = (mode or "auto").lower()
    if mode == "auto":
        return "ai" if ai_available() else "free"
    if mode == "ai" and not ai_available():
        raise RuntimeError("AI render requested but OPENAI_API_KEY is not set (or REELIXX_FREE_MODE=1).")
    if mode not in ("ai", "free"):
        raise ValueError(f"Unknown render mode: {mode!r}")
    return mode


def _scene_text(scene: Dict[str, Any]) -> str:
    text = str(scene.get("text") or "").strip()
    if not text:
        for ov in scene.get("overlay") or []:
            if isinstance(ov, dict) and ov.get("type") == "text" and ov.get("text"):
                return str(ov["text"]).strip()
    return text


def _is_endcard(scene: Dict[str, Any]) -> bool:
    visual = scene.get("visual") or {}
    return scene.get("id") == "endcard" or (isinstance(visual, dict) and visual.get("type") == "endcard")


def generate_ai_ad(
    storyboard: Dict[str, Any],
    *,
    brand_color: str = "#111111",
    brand_name: str = "",
    music_mood: str | None = "upbeat",
    voice: str = "alloy",
    mode: str | None = "auto",
) -> Dict[str, Any]:
    scenes: List[Dict[str, Any]] = storyboard.get("scenes") or []
    if not scenes:
        raise ValueError("Storyboard must contain scenes.")

    mode = resolve_mode(mode)
    canvas = storyboard.get("canvas") or {}
    size = (int(canvas.get("w", 1080)), int(canvas.get("h", 1920)))
    fps = int(canvas.get("fps", 30))

    filename = f"ad_{uuid.uuid4().hex[:12]}.mp4"
    out_path = EXPORT_DIR / filename

    with tempfile.TemporaryDirectory(prefix="reelixx_") as tmp_dir:
        tmp = Path(tmp_dir)
        clips: List[ImageClip] = []
        audio_parts: List[AudioFileClip] = []
        cursor = 0.0

        for i, scene in enumerate(scenes):
            text = _scene_text(scene) or " "
            endcard = _is_endcard(scene)
            try:
                planned = float(scene.get("end", 0)) - float(scene.get("start", 0))
            except (TypeError, ValueError):
                planned = 0.0
            duration = planned if planned > 0 else max(1.5, len(text) / 14.0)

            if mode == "ai" and not endcard and text.strip():
                vo = _tts(text, voice, tmp / f"vo_{i}.mp3")
                audio_parts.append(vo.set_start(cursor))
                duration = max(duration, vo.duration + 0.3)

            if endcard:
                frame = render_endcard(size, brand_color, brand_name or text.split("\n")[0])
            elif mode == "ai":
                visual = scene.get("visual") or {}
                prompt = (visual.get("query") if isinstance(visual, dict) else None) or text
                frame = _caption_over(_ai_image(prompt, size), text)
            else:
                frame = render_text_slide(text, size, brand_color, brand_name)

            clips.append(ImageClip(np.array(frame)).set_duration(duration))
            cursor += duration

        # One continuous audio bed: looped music under the voiceover lines.
        voiced = bool(audio_parts)
        music_path = MUSIC.get((music_mood or "").lower())
        if music_path and music_path.exists():
            music = afx.audio_loop(AudioFileClip(str(music_path)), duration=cursor)
            music = music.volumex(MUSIC_VOLUME if voiced else MUSIC_VOLUME_SOLO).audio_fadeout(min(1.5, cursor))
            audio_parts.insert(0, music)

        video = concatenate_videoclips(clips, method="chain")
        if audio_parts:
            video = video.set_audio(CompositeAudioClip(audio_parts).set_duration(cursor))
        try:
            video.write_videofile(
                str(out_path),
                fps=fps,
                codec="libx264",
                audio_codec="aac",
                temp_audiofile=str(tmp / "render_audio.m4a"),
                threads=2,
                logger=None,
                ffmpeg_params=["-pix_fmt", "yuv420p", "-movflags", "+faststart"],
            )
            duration_s = float(video.duration)
        finally:
            video.close()
            for part in audio_parts:
                part.close()

    url = storage.save_file_from_path(out_path, f"videos/{filename}")
    if storage.use_s3 and out_path.exists():
        out_path.unlink()

    return {"ok": True, "mode": mode, "url": url, "filename": filename, "duration": duration_s}
