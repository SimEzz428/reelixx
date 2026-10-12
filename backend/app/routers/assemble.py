# backend/app/routers/assemble.py
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db
from ..generators.storyboard import brand_name_of
from ..generators.video_ai import generate_ai_ad

router = APIRouter()


@router.post("/variants/{variant_id}/assemble")
def assemble_variant(
    variant_id: int,
    payload: Optional[schemas.AssembleRequest] = Body(None),
    db: Session = Depends(get_db),
):
    """Render the variant's storyboard to MP4 and store the URL on the variant."""
    payload = payload or schemas.AssembleRequest()
    v = db.get(models.Variant, variant_id)
    if not v:
        raise HTTPException(status_code=404, detail="Variant not found")

    sb = v.storyboard_json
    if not isinstance(sb, dict) or not sb.get("scenes"):
        raise HTTPException(status_code=400, detail="Variant has no storyboard scenes")

    project = db.get(models.Project, v.project_id)
    brand = (project.brand_json if project else None) or {}
    brief = (project.brief_json if project else None) or {}

    try:
        result = generate_ai_ad(
            sb,
            brand_color=str(brand.get("color") or "#111111"),
            brand_name=brand_name_of(brief, brand),
            music_mood=payload.music_mood,
            voice=payload.voice,
            mode=payload.mode,
        )
    except RuntimeError as e:  # AI requested but not configured
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Render failed: {e}")

    v.mp4_url = result["url"]
    v.duration_s = round(result["duration"] or 0)
    v.status = "rendered"
    db.commit()

    return {
        "ok": True,
        "mode": result["mode"],
        "mp4_url": result["url"],
        "download": f"/exports/download/{result['filename']}",
        "filename": result["filename"],
        "duration": result["duration"],
    }
