from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import FileResponse
from fastapi import HTTPException

from .routers import scrape, projects, jobs, staticgen, posttext, assemble, exportpack
from .db import Base, engine

app = FastAPI(
    title="Reelixx API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
)

# Dev CORS (Next.js on 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Serve generated MP4s from backend/app/exports
EXPORT_DIR = Path(__file__).resolve().parent / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/exports", StaticFiles(directory=str(EXPORT_DIR)), name="exports")


@app.get("/download/{filename}")
def force_download(filename: str):
    safe = Path(filename).name  # prevent path traversal
    file_path = EXPORT_DIR / safe
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Not Found")
    return FileResponse(
        path=str(file_path),
        media_type="video/mp4",
        filename=safe,  # sets Content-Disposition: attachment; filename="..."
    )


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}


# Routers
app.include_router(scrape.router, prefix="/scrape", tags=["scrape"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(staticgen.router, prefix="/generate_static", tags=["static"])
app.include_router(posttext.router, prefix="/post_text", tags=["post_text"])
app.include_router(assemble.router, prefix="/variants", tags=["assemble"])
app.include_router(exportpack.router, tags=["export"])
