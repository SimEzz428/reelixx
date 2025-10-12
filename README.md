# Reelixx — AI Short-Form Ad Generator (MVP)

Generate on-brand, high-converting short-form video ads (9:16) from a product brief — scripts, storyboard, static end-card, captions, and a stub video render (MP4).

## Stack
- **Frontend:** Next.js (App Router), Tailwind
- **Backend:** FastAPI, SQLAlchemy (SQLite for dev), MoviePy + ffmpeg
- **Outputs:** MP4 preview, PNG end-card, ZIP (MP4 + JSONs)

---

## Quickstart

### 0) Prereqs
- macOS / Linux (Windows WSL works)
- **Python 3.11+** with `venv`
- **Node 18+ / 20+** and **npm**
- **ffmpeg** installed (Homebrew: `brew install ffmpeg`)

### 1) Backend (FastAPI)
```bash
cd backend
# activate venv from project root
source ../.venv/bin/activate

# run API
uvicorn app.main:app --reload --port 8000
