.PHONY: help install backend frontend build serve

help:
	@echo "Sales & Demand Forecasting — dashboard targets"
	@echo "  make install    Install backend (pip) and frontend (npm) dependencies"
	@echo "  make backend    Run the FastAPI API on http://127.0.0.1:8000 (reload)"
	@echo "  make frontend   Run the Vite dev server on http://127.0.0.1:5173"
	@echo "  make build      Build the frontend bundle into backend/static"
	@echo "  make serve      Build the frontend, then serve the full app from FastAPI"

install:
	pip install -r backend/requirements.txt
	cd frontend && npm install

backend:
	uvicorn backend.app:app --reload --port 8000

frontend:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

serve: build
	uvicorn backend.app:app --port 8000
