# Deploying on Render

This repo is a monorepo with two deployable services:

| Service | Path | Tech | Render type |
| --- | --- | --- | --- |
| `forecastly-api` | `/api` (+ shared `/src` ML code) | FastAPI + scikit-learn | Python Web Service |
| `forecastly-frontend` | `/frontend` | Next.js 14 (App Router) | Node Web Service |

A `render.yaml` Blueprint at the repo root defines both.

---

## Option A — One-step Blueprint deploy (recommended)

1. Push this repository to GitHub.
2. In the [Render dashboard](https://dashboard.render.com), click **New → Blueprint**.
3. Connect the repository. Render reads `render.yaml` and proposes both services.
4. Click **Apply**. Both services build and deploy.
5. After the first deploy, verify the two URLs Render assigned:
   - If the API URL is **not** `https://forecastly-api.onrender.com`, update the
     `NEXT_PUBLIC_API_URL` env var on the frontend service.
   - If the frontend URL is **not** `https://forecastly-frontend.onrender.com`, update the
     `CORS_ORIGINS` env var on the API service (comma-separated list of allowed origins).
6. Changing `NEXT_PUBLIC_API_URL` requires a **redeploy of the frontend** (it is inlined at
   build time). Render does this automatically when you save the env var.

---

## Option B — Manual setup (two Web Services)

### 1. API service

- **New → Web Service**, connect the repo.
- **Runtime:** Python
- **Root Directory:** *(leave blank — repo root, so `/src` is importable)*
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/api/health`
- **Environment variables:**
  | Key | Value |
  | --- | --- |
  | `PYTHON_VERSION` | `3.12.7` |
  | `MPLBACKEND` | `Agg` |
  | `CORS_ORIGINS` | `https://<your-frontend>.onrender.com,http://localhost:3000` |
  | `MONGODB_URI` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=Cluster0` *(optional — persists run history)* |

### 2. Frontend service

- **New → Web Service**, connect the same repo.
- **Runtime:** Node
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`
- **Environment variables:**
  | Key | Value |
  | --- | --- |
  | `NODE_VERSION` | `20` |
  | `NEXT_PUBLIC_API_URL` | `https://<your-api>.onrender.com` |

---

## MongoDB Atlas (run history)

The API optionally persists completed forecast runs (dataset id, filename, metrics,
timestamps) to MongoDB Atlas so the `/history` page works across browsers and server
restarts.

- Locally: put the connection string in a `.env` file at the repo root
  (`MONGODB_URI=mongodb+srv://...`). The file is gitignored.
- On Render: the Blueprint declares `MONGODB_URI` with `sync: false`, so Render prompts
  you for the value in the dashboard — never commit it to the repo.
- In Atlas, make sure **Network Access** allows connections from Render
  (easiest: allow `0.0.0.0/0`, since Render free tier has no static IPs).
- Without `MONGODB_URI`, everything still works; server-side history is just empty.

## Free-tier notes

- Free instances **spin down after ~15 minutes idle**. Three mitigations are built in:
  1. A GitHub Actions workflow (`.github/workflows/keep-warm.yml`) pings both services
     every 10 minutes during waking hours (05:00–16:59 UTC) so they stay warm without
     exceeding Render's 750 free instance-hours/month. Adjust the cron window as needed.
  2. Every frontend page fires a background health-check on load, so the API starts
     waking the moment a visitor lands anywhere on the site.
  3. The dashboard shows a "waking up the server" banner and retries the health check
     until the API responds.
- Uploaded datasets and forecast results are stored on the API service's **ephemeral disk**
  (`api/storage/`). They survive between requests but are wiped on redeploys/restarts —
  fine for a demo; attach a Render Disk if you need persistence.
- Random Forest training runs as a **background task**; the frontend polls
  `GET /api/forecast/{dataset_id}` every 2 seconds until the status is `done` or `error`,
  so slow training never hits a request timeout.

---

## Running everything locally

```bash
# 1. API (from the repo root)
python -m venv venv
venv\Scripts\activate          # Windows   |   source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000

# 2. Frontend (in a second terminal)
cd frontend
npm install
npm run dev                     # uses .env.local -> NEXT_PUBLIC_API_URL=http://localhost:8000
```

Open http://localhost:3000, upload a CSV with columns
`date, store_nbr, onpromotion, sales`, and run a forecast.
