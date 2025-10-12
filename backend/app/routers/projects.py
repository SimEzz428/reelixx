from fastapi import APIRouter, Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session
import json
from ..generators.script import generate_script
from ..generators.storyboard import compose_storyboard  # NEW

from .. import models, schemas
from ..db import get_db
from ..models import Variant, Job, JobStatus

router = APIRouter()


@router.post("/", response_model=schemas.ProjectOut)
def create_project(payload: schemas.ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project entry in the database."""
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
    """Create a draft variant and a job; generate a script (heuristic v0)."""
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create a draft variant
    tone = payload.tones[0] if payload.tones else None
    variant = Variant(
        project_id=project.id, tone=tone, persona=payload.persona, status="draft"
    )
    db.add(variant)

    # Create a job and mark running
    job = Job(project_id=project.id, kind="generate-variant", status=JobStatus.running)
    db.add(job)
    db.commit()
    db.refresh(job)

    # === NEW: generate script JSON (no external API yet) ===
    brief = project.brief_json or {}
    script_json = generate_script(brief, tone=tone, persona=payload.persona)
    storyboard_json = compose_storyboard(script_json, brief)
    # persist artifacts on the variant
    variant.script_json = script_json
    variant.storyboard_json = storyboard_json
    variant.status = "ready"
    db.add(variant)

    # Finish the job with the script embedded in logs
    job.status = JobStatus.completed
    job.logs = json.dumps(
        {"script": script_json, "storyboard": storyboard_json}, indent=2
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    return job


@router.get("/{project_id}/variants/latest", response_model=schemas.VariantOut)
def get_latest_variant(project_id: int, db: Session = Depends(get_db)):
    # Ensure project exists
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Most recent variant for this project
    v = (
        db.query(models.Variant)
        .filter(models.Variant.project_id == project_id)
        .order_by(models.Variant.id.desc())
        .first()
    )
    if not v:
        raise HTTPException(status_code=404, detail="No variants for this project")

    return v
