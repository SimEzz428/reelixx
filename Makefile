# Local development helpers. Run `make setup` once, then `make dev-backend` and `make dev-frontend`.
PY := backend/.venv/bin/python

.PHONY: setup dev-backend dev-frontend test lint build

setup:
	python3 -m venv backend/.venv
	$(PY) -m pip install -r backend/requirements-dev.txt
	cd frontend && npm ci
	@test -f backend/.env || cp backend/.env.example backend/.env
	@test -f frontend/.env.local || cp frontend/.env.local.example frontend/.env.local

dev-backend:
	cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

test:
	cd backend && .venv/bin/python -m pytest -q

lint:
	$(PY) -m flake8 backend
	cd frontend && npm run lint && npm run typecheck

build:
	cd frontend && npm run build
