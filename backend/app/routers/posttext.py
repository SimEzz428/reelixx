from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models, schemas
from ..generators.post_text import generate_post_text

router = APIRouter()


@router.get("/projects/{project_id}", response_model=schemas.PostTextOut)
def get_post_text(project_id: int, db: Session = Depends(get_db)):
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Use the latest variant if any (for tone/persona + script JSON)
    v = (
        db.query(models.Variant)
        .filter(models.Variant.project_id == project_id)
        .order_by(models.Variant.id.desc())
        .first()
    )

    script = v.script_json if v and v.script_json else {}
    tone = v.tone if v else None
    persona = v.persona if v else None

    result = generate_post_text(
        brief=project.brief_json or {},
        script=script,
        tone=tone,
        persona=persona,
    )
    return result
