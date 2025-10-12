from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pathlib import Path

from ..db import get_db
from .. import models
from ..models import Variant
from ..generators.video_stub import render_storyboard_to_mp4

router = APIRouter()


def _brand_color(project: models.Project) -> str | None:
    brand = project.brand_json or {}
    if isinstance(brand, dict):
        c = brand.get("color")
        if isinstance(c, str):
            return c
    return None


# IMPORTANT: no "/variants" here – the router is already included with prefix="/variants"
@router.post("/{variant_id}/assemble")
def assemble_variant(variant_id: int, request: Request, db: Session = Depends(get_db)):
    v = db.get(models.Variant, variant_id)
    if not v:
        raise HTTPException(status_code=404, detail="Variant not found")
    if not v.storyboard_json:
        raise HTTPException(status_code=400, detail="Variant has no storyboard_json")

    project = db.get(models.Project, v.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    color = _brand_color(project)

    # Render an MP4 from the storyboard (text-only preview)
    result = render_storyboard_to_mp4(
        v.storyboard_json,
        brand_color_hex=color,
        outfile_basename=f"variant_{variant_id}.mp4",
    )

    # Use the URL returned by the renderer (already under /exports)
    mp4_url = result.get("url") or f"/exports/{Path(result['path']).name}"

    # also provide absolute URL for convenience (frontend can use either)
    abs_url = str(request.base_url).rstrip("/") + mp4_url

    return {"ok": True, "mp4_url": mp4_url, "abs_url": abs_url}
