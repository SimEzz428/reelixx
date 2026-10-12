# backend/app/main.py
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import FileResponse  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402
from sqlalchemy import text  # noqa: E402

from .ai_client import ai_available  # noqa: E402
from .db import Base, engine  # noqa: E402
from .routers import ai, assemble, exportpack, jobs, posttext, projects, scrape, staticgen  # noqa: E402
from .storage import EXPORT_DIR  # noqa: E402

app = FastAPI(title="Reelixx API", version="1.1.0", docs_url="/docs", redoc_url=None)

DEFAULT_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"
cors_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", DEFAULT_ORIGINS).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    # Vercel preview deployments get unique subdomains.
    allow_origin_regex=os.getenv("CORS_ORIGIN_REGEX") or None,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.get("/exports/download/{filename}", tags=["export"])
def force_download(filename: str):
    """Serve an export with Content-Disposition: attachment."""
    file_path = (EXPORT_DIR / filename).resolve()
    if file_path.parent != EXPORT_DIR.resolve() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Not Found")
    return FileResponse(path=str(file_path), media_type="application/octet-stream", filename=filename)


# Mounted after the download route so /exports/download/* isn't shadowed.
app.mount("/exports", StaticFiles(directory=str(EXPORT_DIR)), name="exports")


@app.get("/health", tags=["meta"])
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    return {"ok": db_ok, "db": db_ok, "ai": ai_available()}


app.include_router(scrape.router, prefix="/scrape", tags=["scrape"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(staticgen.router, prefix="/generate_static", tags=["static"])
app.include_router(posttext.router, prefix="/post_text", tags=["post_text"])
app.include_router(assemble.router, tags=["assemble"])
app.include_router(exportpack.router, tags=["export"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
