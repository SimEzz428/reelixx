# backend/app/routers/exportpack.py
from __future__ import annotations

import json
import zipfile
from pathlib import PurePosixPath
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..db import get_db
from ..generators.post_text import generate_post_text
from ..storage import EXPORT_DIR

router = APIRouter()


@router.post("/variants/{variant_id}/export_zip")
def export_zip(variant_id: int, db: Session = Depends(get_db)):
    """Bundle the rendered MP4, storyboard, script and caption into a ZIP."""
    v = db.get(models.Variant, variant_id)
    if not v:
        raise HTTPException(status_code=404, detail="Variant not found")
    if not v.mp4_url:
        raise HTTPException(status_code=404, detail="No MP4 yet. Render the variant first.")

    mp4_name = PurePosixPath(urlparse(v.mp4_url).path).name
    mp4_path = EXPORT_DIR / mp4_name
    if not mp4_path.exists():
        raise HTTPException(status_code=404, detail="Rendered MP4 is not stored locally; download it directly.")

    project = db.get(models.Project, v.project_id)
    post = generate_post_text(
        brief=(project.brief_json if project else None) or {},
        script=v.script_json or {},
        tone=v.tone,
        persona=v.persona,
    )

    zip_name = f"reelixx_variant_{variant_id}.zip"
    with zipfile.ZipFile(EXPORT_DIR / zip_name, mode="w", compression=zipfile.ZIP_DEFLATED) as z:
        z.write(mp4_path, arcname=f"ad_variant_{variant_id}.mp4")
        z.writestr("storyboard.json", json.dumps(v.storyboard_json or {}, ensure_ascii=False, indent=2))
        z.writestr("script.json", json.dumps(v.script_json or {}, ensure_ascii=False, indent=2))
        z.writestr("caption.txt", post["text"])

    return {"download": f"/exports/download/{zip_name}"}
