# Reelixx

**AI short-form ad generator.** Give it a product brief, or just a product URL, and Reelixx writes the script, builds a timed storyboard, generates a caption with hashtags, and renders a ready-to-post MP4 or image in Reel, Story, Square or Portrait format.

Stack: **Next.js 15 + Tailwind 4** frontend, **FastAPI + SQLAlchemy + MoviePy** backend, optional **OpenAI** (gpt-4o-mini, gpt-image-1, TTS).

## Features

- **Studio wizard**: ad type → format → details → generate → review & export.
- **Import from URL**: scrapes title, description, features and images from a product page.
- **Two render modes**
  - **Free preview**: branded gradient slides, on-screen copy and music. No API key needed, costs nothing.
  - **Full AI**: AI-written script, gpt-image-1 visuals with captions, voiceover and ducked music.
- **Formats**: 1080×1920 (Reel/Story), 1080×1080 (Square), 1080×1350 (Portrait).
- **Exports**: MP4 download, ZIP bundle (MP4 + storyboard + script + caption), PNG end-cards, shareable project page.
- **Library & Dashboard**: every ad you generate is kept in your browser.
- **Brand Kit**: default brand name, color and music for new sessions.

## Quick start

Requires Python 3.11+, Node 20+.

```bash
make setup          # venv + pip install, npm ci, creates backend/.env and frontend/.env.local
make dev-backend    # http://localhost:8000  (API docs at /docs)
make dev-frontend   # http://localhost:3000
```

The app runs fully in **free mode** with no API key. To enable AI rendering, edit `backend/.env`:

```env
OPENAI_API_KEY=sk-...
REELIXX_FREE_MODE=0
REELIXX_IMAGE_QUALITY=medium   # low | medium | high
```

Even with a key set, the Studio defaults to **Free preview**, so you only spend credits when you choose **Full AI**.

## Configuration

| Variable | Where | Default | Purpose |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | backend | — | Enables AI script, images and voiceover |
| `REELIXX_FREE_MODE` | backend | `0` | `1` disables all OpenAI calls |
| `REELIXX_IMAGE_QUALITY` | backend | `medium` | gpt-image-1 quality |
| `DATABASE_URL` | backend | `sqlite:///./reelixx.db` | Any SQLAlchemy URL (Postgres in prod) |
| `CORS_ORIGINS` | backend | `http://localhost:3000,…` | Allowed frontend origins (comma-separated) |
| `CORS_ORIGIN_REGEX` | backend | — | e.g. `https://reelixx-.*\.vercel\.app` for preview deploys |
| `REELIXX_EXPORT_DIR` | backend | `backend/app/exports` | Where rendered files are written |
| `AWS_*`, `S3_BUCKET_NAME` | backend | — | Store renders in S3 instead of local disk |
| `NEXT_PUBLIC_API_BASE` | frontend | `http://localhost:8000` | Backend URL |
| `NEXT_PUBLIC_SITE_URL` | frontend | `http://localhost:3000` | Canonical URL for metadata/sitemap |

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | `{ok, db, ai}` |
| `POST` | `/scrape/` | Product URL → brief |
| `POST` | `/projects/` | Create project from brief + brand |
| `GET` | `/projects/{id}` | Project details |
| `POST` | `/projects/{id}/generate` | Script + storyboard (`format`, `tones`, `ai_script`) |
| `GET` | `/projects/{id}/variants/latest` | Latest variant (storyboard, `mp4_url`) |
| `POST` | `/variants/{id}/assemble` | Render MP4 (`mode`: `free`/`ai`/`auto`, `music_mood`, `voice`) |
| `POST` | `/variants/{id}/export_zip` | ZIP bundle |
| `GET` | `/post_text/projects/{id}` | Caption + hashtags |
| `POST` | `/generate_static/` | PNG end-card (data URL) |
| `POST` | `/ai/script` · `/ai/generate` · `/ai/auto` | Stateless one-shot endpoints (brief or URL → MP4) |

Interactive docs: <http://localhost:8000/docs>.

## Development

```bash
make test    # backend test suite (runs in free mode with an isolated DB; no network, no credits)
make lint    # flake8 + eslint + tsc
make build   # production frontend build
```

`backend/scripts/smoke_live.py [URL]` runs the full flow against a running server.

## Deployment

- **Render**: `render.yaml` defines both services. Set `CORS_ORIGINS` (and optionally `OPENAI_API_KEY`) on the backend.
- **Vercel** (frontend): set Root Directory to `frontend/` and `NEXT_PUBLIC_API_BASE` to your backend URL.
- **Docker**: `backend/Dockerfile`; `backend/docker-compose.yml` runs the API with Postgres locally.
- **AWS EC2**: see [`deploy/aws`](deploy/aws/README.md).

Rendered files live on local disk unless S3 is configured. On hosts with ephemeral disks (Render free tier), configure S3 to keep videos across restarts.

## Project structure

```
backend/
  app/
    main.py              FastAPI app, CORS, static exports, health
    ai_client.py         Lazy OpenAI client (app boots without a key)
    generators/
      script_ai.py       Hook/value/proof/CTA script (template or gpt-4o-mini)
      storyboard.py      Script → timed storyboard for a format
      video_ai.py        Storyboard → MP4 (free or AI mode)
      post_text.py       Caption + hashtags
      static_endcard.py  PNG end-card
    routers/             projects, assemble, export, scrape, post_text, static, ai
  tests/                 pytest suite
frontend/src/
  app/                   studio, library, dashboard, brand, share/[id], review/[id]
  components/            Navbar, Footer, AdCard, StatusDot
  lib/                   api client, local library storage, brand defaults, health hook
```
