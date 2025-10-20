# backend/app/generators/video_ai_pro.py
from __future__ import annotations
from typing import Dict, Any, List, Optional
from pathlib import Path
import time
import numpy as np
from PIL import Image
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips

from .image_ai import resolve_images_for_scenes
from .voice_ai import tts_generate
from .music_ai import duck_and_mix

APP_DIR = Path(__file__).resolve().parent
EXPORT_DIR = APP_DIR.parent / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

def _img_clip(path: Path, duration: float, fps: int = 30) -> ImageClip:
    arr = np.array(Image.open(path).convert("RGB"))
    return ImageClip(arr).set_duration(duration).set_fps(fps)

def generate_ai_video(
    storyboard: Dict[str, Any],
    *,
    voice: str = "alloy",
    music_mood: str = "upbeat",
    scene_images: Optional[List[Path]] = None,  # <-- new
) -> Dict[str, Any]:
    scenes: List[Dict[str, Any]] = storyboard.get("scenes", [])
    if not scenes:
        raise ValueError("Storyboard must contain scenes")

    fps = int((storyboard.get("canvas") or {}).get("fps", 30))
    prompts = [(s.get("text") or "").strip() or "product hero" for s in scenes]
    resolved_imgs = resolve_images_for_scenes(prompts, provided=scene_images)

    clips = []
    for i, s in enumerate(scenes):
        text = (s.get("text") or "").strip() or " "
       
        voice_mp3 = tts_generate(text, voice=voice)
        mixed_mp3 = duck_and_mix(voice_mp3, mood=music_mood)

    
        img_path = resolved_imgs[i]

        
        audio_clip = AudioFileClip(str(mixed_mp3))
        clip = _img_clip(img_path, duration=audio_clip.duration, fps=fps).set_audio(audio_clip)
        clips.append(clip)

    video = concatenate_videoclips(clips, method="compose")
    ts = int(time.time())
    out = EXPORT_DIR / f"pro_ad_{ts}.mp4"
    video.write_videofile(
        str(out), fps=fps, codec="libx264", audio_codec="aac", preset="medium", threads=2, logger=None
    )
    duration = getattr(video, "duration", None)
    video.close()

    return {
        "ok": True,
        "path": str(out),
        "url": f"/exports/{out.name}",
        "filename": out.name,
        "duration": duration,
    }