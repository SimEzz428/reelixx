from __future__ import annotations
from typing import Any, Dict, List, Tuple
from pathlib import Path
import os, io, math, time
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from moviepy import ImageClip, concatenate_videoclips
from moviepy import vfx

# ---------- Paths ----------
APP_DIR = Path(__file__).resolve().parent  # backend/app/generators
EXPORT_DIR = (
    APP_DIR.parent / "exports"
)  # backend/app/exports (matches StaticFiles mount)
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


# ---------- Helpers ----------
def _hex_to_rgb(h: str | None, default=(17, 17, 17)) -> Tuple[int, int, int]:
    if not h or not isinstance(h, str):
        return default
    c = h.strip().lstrip("#")
    try:
        if len(c) == 6:
            return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16))
        if len(c) == 3:
            return tuple(int(x * 2, 16) for x in c)  # type: ignore
    except Exception:
        pass
    return default


def _pick_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    # Try a few common fonts by platform; fallback to default bitmap
    candidates = [
        "/System/Library/Fonts/SFCompactRounded.ttf",
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


def _draw_frame(
    w: int, h: int, bg_rgb: Tuple[int, int, int], lines: List[str]
) -> np.ndarray:
    """Return an RGB numpy array frame with centered text lines."""
    img = Image.new("RGB", (w, h), bg_rgb)
    draw = ImageDraw.Draw(img)

    # Title-ish first line larger
    sizes = [int(h * 0.06)] + [int(h * 0.045)] * (max(0, len(lines) - 1))
    y = int(h * 0.30)
    for i, text in enumerate(lines):
        font = _pick_font(sizes[i])
        # Wrap text lightly: limit ~28 chars per line slice
        text = text.strip()
        if not text:
            continue
        # Measure
        tw, th = draw.textbbox((0, 0), text, font=font)[2:]
        x = (w - tw) // 2
        draw.text((x, y), text, fill=(255, 255, 255), font=font)
        y += th + int(h * 0.03)

    # Safe-area guide (subtle)
    # draw.rectangle([int(w*0.05), int(h*0.05), int(w*0.95), int(h*0.95)], outline=(255,255,255))
    return np.array(img)


def _caption_lines(beat: Dict[str, Any]) -> List[str]:
    # Prefer overlay text, else vo, trimmed to short bursts
    t = (beat.get("text") or beat.get("vo") or "").strip()
    if not t:
        return []
    # Split on " • " or punctuation to 1–2 lines
    parts = [p.strip() for p in t.replace("•", "|").split("|") if p.strip()]
    if not parts:
        parts = [t]
    return parts[:2]


# ---------- Public API ----------
def render_storyboard_to_mp4(
    storyboard: Dict[str, Any],
    *,
    brand_color_hex: str | None = None,
    outfile_basename: str | None = None,
) -> Dict[str, Any]:
    """
    Renders a simple vertical MP4 from storyboard JSON (text-only scenes).
    Returns: { ok, path, url? }
    """
    canvas = storyboard.get("canvas") or {"w": 1080, "h": 1920, "fps": 30}
    w, h, fps = (
        int(canvas.get("w", 1080)),
        int(canvas.get("h", 1920)),
        int(canvas.get("fps", 30)),
    )

    scenes = storyboard.get("scenes") or []
    if not scenes:
        raise ValueError("Storyboard has no scenes")

    bg_rgb = _hex_to_rgb(brand_color_hex, default=(17, 17, 17))

    clips = []
    for s in scenes:
        start = float(s.get("start", 0.0))
        end = float(s.get("end", start + 2.0))
        dur = max(0.4, end - start)

        lines = _caption_lines(s)
        frame = _draw_frame(w, h, bg_rgb, lines or [" "])
        clip = ImageClip(frame).with_duration(dur)
        clip = clip.with_fps(fps)
        clips.append(clip)

    video = concatenate_videoclips(clips, method="compose")
    # Downscale/normalize if huge
    if w > 1080 or h > 1920:
        scale_w = 1080 / float(w)
        video = video.fx(vfx.resize, scale_w)

    # Output path
    ts = int(time.time())
    stem = Path(outfile_basename).stem if outfile_basename else f"reelixx_preview_{ts}"
    name = f"{stem}.mp4"
    out_path = EXPORT_DIR / name

    # Write video
    # NOTE: moviepy uses imageio-ffmpeg; ensure ffmpeg is installed on system.
    video.write_videofile(
        str(out_path),
        fps=fps,
        codec="libx264",
        audio=False,
        preset="medium",
        threads=2,
        logger=None,
    )
    video.close()

    # Build a public URL served by FastAPI StaticFiles at /exports
    public_url = f"/exports/{name}"

    return {
        "ok": True,
        "path": str(out_path),
        "url": public_url,
        "filename": name,
    }
