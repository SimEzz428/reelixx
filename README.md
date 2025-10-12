# Reelixx — AI Short-Form Ad Generator (MVP)

Generate on-brand, high-converting short-form video ads (9:16) from a product brief — scripts, storyboard, static end-card, captions, and a stub video render.

## Stack
- **Frontend:** Next.js (App Router), Tailwind  
- **Backend:** FastAPI, SQLAlchemy (SQLite dev), MoviePy + ffmpeg  
- **Outputs:** MP4 preview, PNG end-card, ZIP (MP4 + JSONs)

## Dev Setup

### 1) Backend
```bash
cd backend
# (activate venv)
source ../.venv/bin/activate
uvicorn app.main:app --reload --port 8000
