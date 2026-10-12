# app/routers/projects.py
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..ai_client import ai_available
from ..db import get_db
from ..generators.script_ai import generate_script, generate_script_ai
from ..generators.storyboard import compose_storyboard
from ..models import Job, JobStatus, Variant

router = APIRouter()


def _get_project(db: Session, project_id: int) -> models.Project:
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/", response_model=schemas.ProjectOut)
def create_project(payload: schemas.ProjectCreate, db: Session = Depends(get_db)):
    project = models.Project(
        title=payload.title,
        product_url=str(payload.product_url) if payload.product_url else None,
        brief_json=payload.brief.model_dump(exclude_none=True) if payload.brief else None,
        brand_json=payload.brand,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    return _get_project(db, project_id)


@router.post("/{project_id}/generate", response_model=schemas.JobOut)
def generate_variant(project_id: int, payload: schemas.GenerateRequest, db: Session = Depends(get_db)):
    """Create a variant with a script + storyboard. Rendering happens in /variants/{id}/assemble."""
    project = _get_project(db, project_id)
    tone = payload.tones[0] if payload.tones else None
    brief = project.brief_json or {}

    job = Job(project_id=project.id, kind="generate-variant", status=JobStatus.running)
    db.add(job)
    db.commit()

    try:
        writer = generate_script_ai if payload.ai_script and ai_available() else generate_script
        script_json = writer(brief, tone=tone, persona=payload.persona)
        storyboard_json = compose_storyboard(script_json, brief, brand=project.brand_json, fmt=payload.format)
    except Exception as e:
        job.status = JobStatus.failed
        job.logs = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Generation failed: {e}")

    db.add(Variant(
        project_id=project.id,
        tone=tone,
        persona=payload.persona,
        status="ready",
        script_json=script_json,
        storyboard_json=storyboard_json,
    ))
    job.status = JobStatus.completed
    job.logs = json.dumps({"script": script_json, "storyboard": storyboard_json}, indent=2)
    db.commit()
    db.refresh(job)
    return job


@router.get("/{project_id}/variants/latest", response_model=schemas.VariantOut)
def get_latest_variant(project_id: int, db: Session = Depends(get_db)):
    _get_project(db, project_id)
    v = (
        db.query(models.Variant)
        .filter(models.Variant.project_id == project_id)
        .order_by(models.Variant.id.desc())
        .first()
    )
    if not v:
        raise HTTPException(status_code=404, detail="No variants for this project")
    return v
