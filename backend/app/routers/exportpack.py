from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import json, zipfile, io

from ..db import get_db
from .. import models
from ..generators.video_stub import EXPORT_DIR  # same dir used for MP4s

router = APIRouter()

@router.post("/variants/{variant_id}/export_zip")
def export_variant_zip(variant_id: int, db: Session = Depends(get_db)):
    v = db.get(models.Variant, variant_id)
    if not v:
        raise HTTPException(status_code=404, detail="Variant not found")

    # Expected MP4 path
    mp4_name = f"variant_{variant_id}.mp4"
    mp4_path = EXPORT_DIR / mp4_name
    if not mp4_path.exists():
        # Let the UI call /variants/{id}/assemble first
        raise HTTPException(status_code=404, detail="MP4 not found. Assemble first.")

    # Build ZIP in memory
    zip_name = f"variant_{variant_id}_package.zip"
    zip_path = EXPORT_DIR / zip_name

    # Make JSON text safely
    script_json_text = json.dumps(v.script_json or {}, indent=2, ensure_ascii=False)
    storyboard_json_text = json.dumps(v.storyboard_json or {}, indent=2, ensure_ascii=False)

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        # Add MP4 from disk
        zf.write(mp4_path, arcname=mp4_name)
        # Add JSONs from memory
        zf.writestr(f"variant_{variant_id}_script.json", script_json_text)
        zf.writestr(f"variant_{variant_id}_storyboard.json", storyboard_json_text)

    # Persist ZIP to disk (so we can reuse your /download/{filename} route)
    with open(zip_path, "wb") as f:
        f.write(buf.getvalue())

    return {
        "ok": True,
        "download": f"/download/{zip_name}",   # your Force-Download route
        "files": {
            "mp4": f"/exports/{mp4_name}",
            "script": f"variant_{variant_id}_script.json",
            "storyboard": f"variant_{variant_id}_storyboard.json",
        },
    }