# backend/app/routers/ai.py
"""Stateless one-shot endpoints (no project/variant records are created)."""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, HttpUrl

from ..generators.post_text import generate_post_text
from ..generators.script_ai import generate_script, generate_script_ai
from ..generators.storyboard import compose_storyboard
from ..generators.video_ai import generate_ai_ad
from ..schemas import AdFormat, MusicMood, RenderMode
from ..utils_scrape import scrape_url

router = APIRouter()


class ScriptIn(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = ""
    price: str = ""
    bullets: List[str] = []
    brand_name: str = ""
    tone: Optional[str] = None
    persona: Optional[str] = None
    format: AdFormat = "reel"
    ai_script: bool = True


class RenderOptions(BaseModel):
    brand_color: str = "#111111"
    mode: RenderMode = "auto"
    voice: str = "alloy"
    music_mood: MusicMood = "upbeat"


class GenerateIn(ScriptIn, RenderOptions):
    pass


class AutoIn(RenderOptions):
    url: HttpUrl
    format: AdFormat = "reel"
    ai_script: bool = True


def _storyboard(inp: ScriptIn, brief: dict) -> tuple[dict, dict]:
    writer = generate_script_ai if inp.ai_script else generate_script
    script = writer(brief, tone=inp.tone, persona=inp.persona)
    brand = {"name": inp.brand_name} if inp.brand_name else None
    return script, compose_storyboard(script, brief, brand=brand, fmt=inp.format)


def _render(storyboard: dict, brief: dict, brand_name: str, opts: RenderOptions) -> dict:
    try:
        return generate_ai_ad(
            storyboard,
            brand_color=opts.brand_color,
            brand_name=brand_name or brief.get("title", ""),
            music_mood=opts.music_mood,
            voice=opts.voice,
            mode=opts.mode,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Render failed: {e}")


@router.post("/script")
def ai_script(inp: ScriptIn):
    """Script + storyboard only (no rendering). Uses AI copy when available."""
    brief = {"title": inp.title, "description": inp.description, "price": inp.price, "bullets": inp.bullets}
    script, storyboard = _storyboard(inp, brief)
    return {"ok": True, "script": script, "storyboard": storyboard}


@router.post("/generate")
def ai_generate(inp: GenerateIn):
    """Brief in, finished MP4 + caption out."""
    brief = {"title": inp.title, "description": inp.description, "price": inp.price, "bullets": inp.bullets}
    script, storyboard = _storyboard(inp, brief)
    video = _render(storyboard, brief, inp.brand_name, inp)
    caption = generate_post_text(brief, script, tone=inp.tone, persona=inp.persona)
    return {"ok": True, "script": script, "storyboard": storyboard, "caption": caption, "video": video}


@router.post("/auto")
def ai_auto(inp: AutoIn):
    """Product URL in, finished MP4 + caption out."""
    try:
        brief = scrape_url(str(inp.url))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not read that page: {e}")
    script_in = ScriptIn(title=brief["title"], format=inp.format, ai_script=inp.ai_script)
    script, storyboard = _storyboard(script_in, brief)
    video = _render(storyboard, brief, "", inp)
    caption = generate_post_text(brief, script, tone=None, persona=None)
    return {"ok": True, "brief": brief, "script": script, "storyboard": storyboard, "caption": caption, "video": video}
