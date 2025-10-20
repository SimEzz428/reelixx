# backend/app/routers/exportpack.py
from __future__ import annotations

import io
import json
import zipfile
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from ..db import SessionLocal
from ..models import Variant  

router = APIRouter()


EXPORT_DIR = Path(__file__).resolve().parents[1] / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/variants/{variant_id}/export_zip")
def export_zip(variant_id: int):
    
    db = SessionLocal()
    try:
        v: Variant | None = db.query(Variant).filter(Variant.id == variant_id).first()
        if not v:
            raise HTTPException(status_code=404, detail="Variant not found")

        mp4_name = f"variant_{variant_id}.mp4"
        mp4_path = EXPORT_DIR / mp4_name
        if not mp4_path.exists():
    
            raise HTTPException(status_code=404, detail="MP4 not found. Assemble the variant first.")

        zip_name = f"variant_{variant_id}.zip"
        zip_path = EXPORT_DIR / zip_name

        
        mem = io.BytesIO()
        with zipfile.ZipFile(mem, mode="w", compression=zipfile.ZIP_DEFLATED) as z:
            
            z.write(mp4_path, arcname=mp4_name)

          
            storyboard = v.storyboard_json or {}
            z.writestr("storyboard.json", json.dumps(storyboard, ensure_ascii=False, indent=2))

            
            script = getattr(v, "script_json", None) or {}
            z.writestr("script.json", json.dumps(script, ensure_ascii=False, indent=2))

        mem.seek(0)
        with open(zip_path, "wb") as f:
            f.write(mem.read())

      
        return {"download": f"/exports/{zip_name}"}

    finally:
        db.close()


@router.get("/exports/download/{filename}")
def download(filename: str):
    file_path = EXPORT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Not Found")
    return FileResponse(path=str(file_path), media_type="application/octet-stream", filename=filename)