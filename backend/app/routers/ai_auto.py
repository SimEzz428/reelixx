# backend/app/routers/ai_auto.py
from __future__ import annotations
from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any
import requests, re, random, time
from bs4 import BeautifulSoup
from pathlib import Path

router = APIRouter()

EXPORT_DIR = Path(__file__).resolve().parents[1] / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

def scrape_product_data(url: str) -> Dict[str, Any]:
    try:
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        title = soup.title.text.strip() if soup.title else "Untitled Product"
        desc_tag = soup.find("meta", {"name": "description"})
        desc = (
            desc_tag["content"].strip()
            if desc_tag and desc_tag.get("content")
            else "A great product with amazing quality and design."
        )
        return {"title": title, "description": desc}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"scrape_failed: {e}")


def offline_brief(text: str) -> Dict[str, Any]:
    words = re.findall(r"[A-Za-z]{4,}", text)
    keywords = random.sample(words, min(len(words), 5))
    bullets = [f"Perfect for {kw.lower()} lovers" for kw in keywords]
    return {
        "title": text.split("—")[0].strip()[:80],
        "description": text[:200],
        "bullets": bullets,
        "tone": random.choice(["energetic", "trustworthy", "playful"]),
        "voice": "alloy",
        "music_mood": random.choice(["upbeat", "calm", "dramatic"]),
        "duration_sec": 15,
    }

def offline_storyboard(brief: Dict[str, Any]) -> Dict[str, Any]:
    scenes = []
    bullets = brief.get("bullets", [])
    start = 0
    for b in bullets:
        scenes.append(
            {
                "start": start,
                "end": start + 3,
                "text": b.capitalize(),
                "sfx": random.choice(["click", "pop", "whoosh"]),
                "transition_in": random.choice(["fade", "whip", "slide"]),
            }
        )
        start += 3
    return {
        "canvas": {"w": 1080, "h": 1920, "fps": 30},
        "scenes": scenes,
    }

def offline_caption(brief: Dict[str, Any]) -> str:
    title = brief.get("title", "Great Product")
    desc = brief.get("description", "")
    tags = re.findall(r"[A-Za-z]{4,}", desc)
    hashtags = " ".join(f"#{w.lower()}" for w in random.sample(tags, min(5, len(tags))))
    return f"{title} — {desc[:80]} {hashtags}"


@router.post("/ai/auto")
def auto_generate(request: Request, data: Dict[str, str]):
    try:
        url = data.get("url")
        if not url:
            raise HTTPException(status_code=400, detail="Missing URL")

        scraped = scrape_product_data(url)
        text = f"{scraped['title']} — {scraped['description']}"
        brief = offline_brief(text)
        storyboard = offline_storyboard(brief)
        caption = offline_caption(brief)

        
        filename = f"auto_ad_{int(time.time()*1000)}.mp4"
        out_path = EXPORT_DIR / filename
        out_path.write_text("FAKE_VIDEO_PLACEHOLDER")

        return {
            "ok": True,
            "brief": brief,
            "storyboard": storyboard,
            "caption": caption,
            "video": {
                "ok": True,
                "path": str(out_path),
                "url": f"/exports/{filename}",
                "filename": filename,
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"auto_failed: {e}")