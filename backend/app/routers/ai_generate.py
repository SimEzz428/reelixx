# backend/app/routers/ai_generate.py
from fastapi import APIRouter, HTTPException, Body
from typing import Any, Dict, List
import math, os
from dotenv import load_dotenv


load_dotenv()

from app.generators.video_ai import generate_ai_ad  

router = APIRouter()


def _mk_storyboard(product_title: str, description: str, duration_sec: int = 15) -> Dict[str, Any]:
    
    duration_sec = max(6, int(duration_sec or 15)) 
    base = [3, 6, 3, max(3, duration_sec - 12)] 

    desc_first = (description or "").strip().split(".")[0][:90]
    lines = [
        f"Meet {product_title}",                       
        desc_first or "See how it works.",            
        "Real results. Loved by customers.",          
        "Tap to get yours today →",                   
    ]

    scenes: List[Dict[str, Any]] = []
    t = 0.0
    for seconds, text in zip(base, lines):
        start, end = round(t, 3), round(t + seconds, 3)
        scenes.append({
            "start": start,
            "end": end,
            "text": text,
            "sfx": "click",
            "transition_in": "whip",
        })
        t = end

    return {
        "canvas": {"w": 1080, "h": 1920, "fps": 30},
        "scenes": scenes,
        "exports": [{"preset": "vertical_1080p"}],
    }


def _mk_caption(product_title: str) -> Dict[str, Any]:
    return {
        "caption": f"Stop scrolling. {product_title} is here — try it now.",
        "hashtags": ["#ad", "#reels", "#viral", "#musthave", "#foryou", "#smallbusiness"]
    }


@router.post("/ai/generate")
def ai_generate(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    
    try:
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=400,
                detail="Missing OPENAI_API_KEY. Add it to backend/.env and restart the server."
            )

        product_title = (payload.get("product_title") or "Your Product").strip()
        description   = (payload.get("description") or "").strip()
        brand_color   = (payload.get("brand_color") or "#111111").strip()
        duration_sec  = int(payload.get("duration_sec") or 15)

        storyboard = payload.get("storyboard")
        if not storyboard or not storyboard.get("scenes"):
            storyboard = _mk_storyboard(product_title, description, duration_sec)

        caption = payload.get("caption") or _mk_caption(product_title)

        video_info = generate_ai_ad(storyboard, caption, brand_color=brand_color)

        return {
            "ok": True,
            "storyboard": storyboard,
            "caption": caption,
            "video": video_info, 
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"render_failed: {e}")