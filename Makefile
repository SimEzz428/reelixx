# Simple helper commands for local dev

# 🐍 Backend
dev-backend:
	@echo "🚀 Starting FastAPI on port 8000..."
	cd backend && source ../.venv/bin/activate && uvicorn app.main:app --reload --port 8000

# 💻 Frontend
dev-frontend:
	@echo "🌐 Starting Next.js on port 3000..."
	cd frontend && npm run dev

# 🧹 Lint & Format
lint:
	@echo "🔍 Checking Python..."
	flake8 backend/app || true
	@echo "🔍 Checking frontend..."
	cd frontend && npx eslint . || true

format:
	@echo "✨ Formatting Python..."
	black backend/app
	@echo "✨ Formatting frontend..."
	cd frontend && npx prettier --write .

