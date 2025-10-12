from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models
from ..generators.static_endcard import render_endcard

router = APIRouter()


class StaticGenIn(BaseModel):
    project_id: int = Field(..., ge=1)
    cta: Optional[str] = "Try it today →"
    width: int = Field(1080, ge=320, le=2160)
    height: int = Field(1920, ge=320, le=3840)


class StaticGenOut(BaseModel):
    ok: bool = True
    data_url: Optional[str] = None
    reason: Optional[str] = None


@router.post("/", response_model=StaticGenOut)
def generate_static(inb: StaticGenIn, db: Session = Depends(get_db)) -> StaticGenOut:
    project = db.get(models.Project, inb.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        data_url = render_endcard(
            brief=project.brief_json or {},
            brand=project.brand_json or {},
            w=inb.width,
            h=inb.height,
            cta=inb.cta or "Try it today →",
        )
        return StaticGenOut(ok=True, data_url=data_url)
    except Exception as e:
        return StaticGenOut(ok=False, reason=str(e))
