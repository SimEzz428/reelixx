# app/routers/projects.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from typing import Any, Dict, Optional

from ..generators.storyboard import compose_storyboard  
from .. import models, schemas
from ..db import get_db
from ..models import Variant, Job, JobStatus

router = APIRouter()


def generate_script(brief: Dict[str, Any], *, tone: Optional[str] = None, persona: Optional[str] = None) -> Dict[str, Any]:
    title = (
        brief.get("title")
        or brief.get("product_title")
        or (brief.get("product") or {}).get("title")
        or "Your product"
    )
    desc = (
        brief.get("description")
        or (brief.get("product") or {}).get("description")
        or ""
    )

    beats = [
        {"time": 0.0,  "vo": f"Meet {title}."},
        {"time": 2.5,  "vo": (desc[:140] or "Built for daily use.")},
        {"time": 5.0,  "vo": "See how it works."},
        {"time": 8.0,  "vo": "Tap to get yours now."},
    ]
    return {"beats": beats, "meta": {"tone": tone, "persona": persona}}



@router.post("/", response_model=schemas.ProjectOut)
def create_project(payload: schemas.ProjectCreate, db: Session = Depends(get_db)):
    
    project = models.Project(
        title=payload.title,
        product_url=str(payload.product_url) if payload.product_url else None,
        brief_json=payload.brief.model_dump() if payload.brief else None,
        brand_json=payload.brand,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.post("/{project_id}/generate", response_model=schemas.JobOut)
def generate_variant(
    project_id: int,
    payload: schemas.GenerateRequest,
    db: Session = Depends(get_db),
):
   
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")


    tone = payload.tones[0] if payload.tones else None
    variant = Variant(
        project_id=project.id,
        tone=tone,
        persona=payload.persona,
        status="draft",
    )
    db.add(variant)


    job = Job(project_id=project.id, kind="generate-variant", status=JobStatus.running)
    db.add(job)
    db.commit()
    db.refresh(job)

    
    brief = project.brief_json or {}
    script_json = generate_script(brief, tone=tone, persona=payload.persona)
    storyboard_json = compose_storyboard(script_json, brief)

   
    variant.script_json = script_json
    variant.storyboard_json = storyboard_json
    variant.status = "ready"
    db.add(variant)

    
    job.status = JobStatus.completed
    job.logs = json.dumps({"script": script_json, "storyboard": storyboard_json}, indent=2)
    db.add(job)
    db.commit()
    db.refresh(job)

    return job


@router.get("/{project_id}/variants/latest", response_model=schemas.VariantOut)
def get_latest_variant(project_id: int, db: Session = Depends(get_db)):

    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    v = (
        db.query(models.Variant)
        .filter(models.Variant.project_id == project_id)
        .order_by(models.Variant.id.desc())
        .first()
    )
    if not v:
        raise HTTPException(status_code=404, detail="No variants for this project")

    return v