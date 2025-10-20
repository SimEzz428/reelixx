# backend/app/generators/music_ai.py
from __future__ import annotations
from pathlib import Path
from pydub import AudioSegment

APP_DIR = Path(__file__).resolve().parent
ASSETS = APP_DIR / "assets"
EXPORT_DIR = APP_DIR.parent / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


MUSIC_MAP = {
    "upbeat": ASSETS / "music_upbeat.mp3",
    "luxury": ASSETS / "music_luxury.mp3",
    "chill":  ASSETS / "music_chill.mp3",
}

def pick_music(mood: str = "upbeat") -> Path:
    p = MUSIC_MAP.get(mood) or MUSIC_MAP["upbeat"]
    return p

def duck_and_mix(voice_mp3: Path, mood: str = "upbeat") -> Path:
    voice = AudioSegment.from_file(voice_mp3)
    music_path = pick_music(mood)
    music = AudioSegment.from_file(str(music_path))
    music = (music - 15)
    music = music[: len(voice)] if len(music) > len(voice) else music.append(AudioSegment.silent(duration=len(voice) - len(music)), crossfade=0)
    mixed = music.overlay(voice)
    out = EXPORT_DIR / f"mix_{voice_mp3.stem}.mp3"
    mixed.export(out, format="mp3")
    return out