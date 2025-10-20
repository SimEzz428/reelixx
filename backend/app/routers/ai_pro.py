# backend/app/routers/ai_pro.py
from __future__ import annotations
from typing import Any, Dict
from fastapi import APIRouter, Body, HTTPException

from app.generators.script_ai import generate_script_storyboard
from app.generators.video_ai_pro import generate_ai_video

router = APIRouter()

@router.post("/ai/script")
def ai_script(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    title = (payload.get("title") or "").strip()
    description = (payload.get("description") or "").strip()
    tone = (payload.get("tone") or "neutral").strip()
    duration_sec = int(payload.get("duration_sec") or 15)

    storyboard = generate_script_storyboard(
        title=title, description=description, tone=tone, duration_sec=duration_sec
    )

    return {"ok": True, "storyboard": storyboard}

@router.post("/ai/generate_pro")
def ai_generate_pro(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    try:
        title = (payload.get("title") or "").strip()
        description = (payload.get("description") or "").strip()
        tone = (payload.get("tone") or "neutral").strip()
        duration_sec = int(payload.get("duration_sec") or 15)
        voice = (payload.get("voice") or "alloy").strip()
        music_mood = (payload.get("music_mood") or "upbeat").strip()

        storyboard = payload.get("storyboard")
        if not storyboard:
            storyboard = generate_script_storyboard(
                title=title, description=description, tone=tone, duration_sec=duration_sec
            )

        video_info = generate_ai_video(
            storyboard, voice=voice, music_mood=music_mood
        )

        return {"ok": True, "video": video_info, "storyboard": storyboard}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"generate_pro_failed: {e}")