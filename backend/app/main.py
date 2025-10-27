# backend/app/main.py
from __future__ import annotations
from pathlib import Path
import os
from dotenv import load_dotenv


load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles


from app.routers import scrape, projects, jobs, staticgen, posttext, assemble, exportpack
from app.routers.ai_generate import router as ai_router
from app.routers.ai_pro import router as ai_pro_router
from app.routers.ai_auto import router as ai_auto_router  

from .db import Base, engine

app = FastAPI(title="Reelixx API", version="1.0.0", docs_url="/docs", redoc_url=None)


# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002").split(",")
if os.getenv("ENVIRONMENT") == "development":
    cors_origins.append("*")  # Allow all origins in development

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)


EXPORT_DIR = Path(__file__).resolve().parent / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/exports", StaticFiles(directory=str(EXPORT_DIR)), name="exports")


@app.get("/exports/download/{filename}")
def force_download(filename: str):
    file_path = EXPORT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Not Found")
    return FileResponse(
        path=str(file_path),
        media_type="application/octet-stream",
        filename=filename,
    )


@app.get("/health", tags=["meta"])
def health():
    """Health check endpoint for load balancer"""
    try:
        # Test database connection
        from .db import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        return {
            "ok": True,
            "db": True,
            "environment": os.getenv("ENVIRONMENT", "development")
        }
    except Exception as e:
        return {
            "ok": False,
            "db": False,
            "error": str(e),
            "environment": os.getenv("ENVIRONMENT", "development")
        }



app.include_router(scrape.router,      prefix="/scrape",          tags=["scrape"])
app.include_router(projects.router,    prefix="/projects",        tags=["projects"])
app.include_router(jobs.router,        prefix="/jobs",            tags=["jobs"])
app.include_router(staticgen.router,   prefix="/generate_static", tags=["static"])
app.include_router(posttext.router,    prefix="/post_text",       tags=["post_text"])
app.include_router(assemble.router,    prefix="",                 tags=["assemble"])   
app.include_router(exportpack.router,  prefix="",                 tags=["export"])    
app.include_router(ai_router,          prefix="/ai",              tags=["ai"])
app.include_router(ai_pro_router,      prefix="/ai",              tags=["ai-pro"])     
app.include_router(ai_auto_router,     prefix="/ai",              tags=["ai-auto"])   