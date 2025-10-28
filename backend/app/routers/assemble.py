# backend/app/routers/assemble.py
from __future__ import annotations
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models
from ..generators.video_ai import generate_ai_ad

router = APIRouter()

def _brand_color(project: models.Project) -> str | None:
    brand = project.brand_json or {}
    if isinstance(brand, dict):
        c = brand.get("color")
        if isinstance(c, str):
            return c
    return None

def _script_caption(v: models.Variant) -> str:

    s = v.script_json or {}
    if isinstance(s, dict) and isinstance(s.get("beats"), list):
        try:
            return " ".join(
                (b.get("vo") or b.get("text") or "").strip()
                for b in s["beats"]
            ).strip() or " "
        except Exception:
            pass
    return " "

@router.post("/variants/{variant_id}/assemble")
def assemble_variant(variant_id: int, db: Session = Depends(get_db)):
    v = db.get(models.Variant, variant_id)
    if not v:
        raise HTTPException(status_code=404, detail="Variant not found")

    if not v.storyboard_json:
        raise HTTPException(status_code=400, detail="Variant has no storyboard_json")

    sb = v.storyboard_json
    if not isinstance(sb, dict) or not sb.get("scenes"):
        raise HTTPException(status_code=400, detail="Storyboard must have scenes")

    project = db.get(models.Project, v.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    color = _brand_color(project) or "#111111"
    caption = _script_caption(v)

    try:
        result: dict[str, Any] = generate_ai_ad(
            storyboard=sb,
            caption=caption,
            brand_color=color,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI assemble failed: {e}")

    filename = (result or {}).get("filename")
    url = (result or {}).get("url")

    if not (filename or url):
        raise HTTPException(status_code=500, detail="AI generator returned no filename/url")

    if not url and filename:
        url = f"/exports/{filename}"


    if filename:
        download = f"/exports/download/{filename}"
    else:
        name = Path(url).name
        download = f"/exports/download/{name}" if name else url

    return {
        "ok": True,
        "ai": True,
        "mp4_url": url,
        "download": download,
        "filename": filename,
    }