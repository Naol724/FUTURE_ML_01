# Deployment Guide

The app deploys as **two independent pieces**:

- **`backend/`** — a self-contained FastAPI service. It bundles the forecast data
  at `backend/data/final_sales_forecast.csv`, so it has **no dependency on the ML
  pipeline (`src/`, `outputs/`)** at runtime.
- **`frontend/`** — a static React/Vite SPA, deployed to Vercel or Netlify. It
  talks to the backend over HTTPS using the `VITE_API_BASE` env var.

```
[ Vercel / Netlify ]  --->  VITE_API_BASE  --->  [ Backend host (Render/Railway/Fly/Docker) ]
   frontend/dist                                       backend/  (FastAPI + bundled CSV)
```

Deploy the **backend first**, note its public URL, then deploy the frontend
pointing `VITE_API_BASE` at that URL, and finally set the backend's
`CORS_ORIGINS` to the frontend URL.

---

## 1. Backend

The backend serves `/api/*` JSON endpoints. It is configured entirely through env vars:

| Variable        | Default                                        | Purpose                                              |
| --------------- | ---------------------------------------------- | ---------------------------------------------------- |
| `PORT`          | `8000`                                          | Port to listen on (most hosts set this for you).     |
| `CORS_ORIGINS`  | `*`                                             | Comma-separated allowed frontend origins.            |
| `FORECAST_CSV`  | `backend/data/final_sales_forecast.csv`         | Override the forecast data path (optional).          |

### Option A — Docker (portable: any VPS, Render, Railway, Fly.io)

```bash
cd backend
docker build -t forecastr-api .
docker run -p 8000:8000 -e CORS_ORIGINS="https://your-frontend.vercel.app" forecastr-api
# verify
curl http://localhost:8000/api/health
```

### Option B — Render / Railway (no Docker)

1. Create a new **Web Service** from this repo.
2. Set **Root Directory** to `backend`.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   (a `Procfile` with this command is already included).
5. Add env var `CORS_ORIGINS=https://your-frontend-url`.

### Option C — Fly.io

```bash
cd backend
fly launch --dockerfile Dockerfile   # accept defaults, set CORS_ORIGINS as a secret
fly deploy
```

---

## 2. Frontend (Vercel or Netlify)

Set **Root Directory** to `frontend`. Both platforms auto-detect Vite; config
files (`vercel.json`, `netlify.toml`) are included with the SPA fallback already set.

Required environment variable:

```
VITE_API_BASE=https://your-backend-url      # no trailing slash
```

### Vercel

1. Import the repo, set **Root Directory** = `frontend`.
2. Framework preset: **Vite** (auto). Build: `npm run build`, Output: `dist`.
3. Add env var `VITE_API_BASE` = your backend URL.
4. Deploy.

### Netlify

1. New site from the repo, set **Base directory** = `frontend`.
2. Build command `npm run build`, publish directory `frontend/dist`.
3. Add env var `VITE_API_BASE` = your backend URL.
4. Deploy.

> `VITE_API_BASE` is baked in at build time — after changing it, trigger a redeploy.

---

## 3. Local development

```bash
make install          # backend (pip) + frontend (npm) deps
make backend          # FastAPI on http://127.0.0.1:8000
make frontend         # Vite dev server on http://127.0.0.1:5173 (proxies /api)
```

Or run the full app from a single process (FastAPI serves the built SPA):

```bash
make serve            # builds frontend into backend/static, serves on :8000
```

In local dev `VITE_API_BASE` is left empty and Vite proxies `/api` to the backend.
