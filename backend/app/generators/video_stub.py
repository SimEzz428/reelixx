# app/generators/video_stub.py
from __future__ import annotations
from typing import Dict, Any, List, Tuple
from pathlib import Path
import time
import numpy as np

from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import (
    ImageClip,
    AudioFileClip,
    concatenate_videoclips,
    afx,
)

APP_DIR = Path(__file__).resolve().parent
EXPORT_DIR = APP_DIR.parent / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

ASSETS_DIR = APP_DIR / "assets"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_MUSIC = ASSETS_DIR / "music_upbeat.mp3"   



def _hex_to_rgb(hexcolor: str) -> Tuple[int, int, int]:
    h = hexcolor.lstrip("#")
    if len(h) == 3:
        h = "".join([c * 2 for c in h])
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def _wrap_text(draw: ImageDraw.ImageDraw, text: str, max_width: int, font: ImageFont.ImageFont) -> str:

    words = (text or "").split()
    if not words:
        return ""

    lines: List[str] = []
    cur = words[0]
    for w in words[1:]:
        test = f"{cur} {w}"
        if draw.textlength(test, font=font) <= max_width:
            cur = test
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return "\n".join(lines)


def _render_card(
    text: str,
    size: Tuple[int, int],
    bg_hex: str,
) -> Image.Image:
  
    W, H = size
    img = Image.new("RGB", (W, H), _hex_to_rgb(bg_hex))
    draw = ImageDraw.Draw(img)


    try:
      
        font_path = str((ASSETS_DIR / "Inter-SemiBold.ttf"))
        font = ImageFont.truetype(font_path, size=int(H * 0.05))
    except Exception:
        font = ImageFont.load_default()

    
    max_text_width = int(W * 0.82)
    wrapped = _wrap_text(draw, text or "", max_text_width, font)


    bbox = draw.multiline_textbbox((0, 0), wrapped, font=font, align="center", spacing=8)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (W - tw) // 2
    y = (H - th) // 2


    shadow_offset = 2
    draw.multiline_text((x + shadow_offset, y + shadow_offset), wrapped, fill=(0, 0, 0), font=font, align="center", spacing=8)


    draw.multiline_text((x, y), wrapped, fill=(255, 255, 255), font=font, align="center", spacing=8)

    return img



def render_stub_video(
    storyboard: Dict[str, Any],
    color: str = "#111111",
    music_path: Path | None = None,
) -> Dict[str, Any]:
    canvas = storyboard.get("canvas") or {}
    W = int(canvas.get("w", 1080))
    H = int(canvas.get("h", 1920))
    fps = int(canvas.get("fps", 30))

    scenes = storyboard.get("scenes", [])
    if not scenes:
    
        scenes = [{"start": 0, "end": 6, "text": "Your Ad"}]

   
    clips: List[ImageClip] = []
    for s in scenes:
        start = float(s.get("start", 0))
        end = float(s.get("end", max(3.0, start + 3.0)))
        duration = max(0.2, end - start)

        text = (s.get("text") or "").strip() or " "
        frame_img = _render_card(text, (W, H), color)
        clip = ImageClip(np.array(frame_img)).with_duration(duration).with_fps(fps)
        clips.append(clip)

    video = concatenate_videoclips(clips, method="compose")

  
    if music_path is None:
        music_path = DEFAULT_MUSIC if DEFAULT_MUSIC.exists() else None

    if music_path is not None:
        try:
            music = AudioFileClip(str(music_path)).fx(afx.volumex, 0.6)
            music = music.set_duration(video.duration)
            video = video.set_audio(music)
        except Exception:
           
            pass

    ts = int(time.time())
    out = EXPORT_DIR / f"stub_{ts}.mp4"
    
    video.write_videofile(str(out), fps=fps, codec="libx264", audio_codec="aac", preset="medium", threads=2, logger=None)
    video.close()

    return {
        "ok": True,
        "path": str(out),
        "url": f"/exports/{out.name}",
        "filename": out.name,
        "duration": getattr(video, "duration", None),
    }