# 📈 Forecastly — Sales & Demand Forecasting for Businesses

> **Future Interns — Machine Learning Internship | Task 1**
> Repository: [`FUTURE_ML_01`](https://github.com/Naol724/FUTURE_ML_01)

An end-to-end machine learning product: a production ML pipeline (Random Forest, strict out-of-time validation) wrapped in a **FastAPI** service and delivered through a modern **Next.js** dashboard. Upload a sales CSV — or use the built-in sample dataset — train the model in the background, and explore interactive forecasts, accuracy metrics, and exportable reports. Deployable to **Render** with a single Blueprint.

---

## 🚀 Live Demo

| Service | URL |
| --- | --- |
| **Frontend (dashboard)** | [forecastly-frontend.onrender.com](https://forecastly-frontend.onrender.com) |
| **API (docs)** | [forecastly-api-husd.onrender.com/docs](https://forecastly-api-husd.onrender.com/docs) |

> Free-tier instances sleep when idle — the first visit may take ~30 seconds while the server wakes up. The dashboard shows a friendly "waking up" banner while this happens.

---

## ✨ What It Does

* **Drag-and-drop CSV upload** with client-side schema validation (`date, store_nbr, onpromotion, sales`) before anything touches the network — plus a one-click **sample dataset** for instant demos.
* **Background model training** with live status polling, so large files never time out.
* **Animated metric cards** — MAE, RMSE, R² — each with a plain-language tooltip explaining what the number means for the business.
* **Interactive actual-vs-predicted chart** (Recharts), filterable by store, exportable as PNG.
* **Sortable, paginated results table** with per-row delta, and one-click **CSV download** of the full forecast.
* **Run history** — persisted to **MongoDB Atlas** server-side and localStorage client-side, so past runs survive restarts and can be reopened.
* **Polished UX** — dark mode, skeleton loaders, empty/error states, mobile-responsive layout, keyboard navigation and ARIA labels throughout.

---

## 🗂️ Project Structure

```
FUTURE_ML_01/
│
├── frontend/                 # Next.js 14 (App Router) + TypeScript dashboard
│   └── src/
│       ├── app/              # Routes: / (landing), /dashboard, /history, /about
│       ├── components/       # UI primitives + dashboard components
│       └── lib/              # Typed API client (Zod), CSV validation, history store
│
├── api/                      # FastAPI wrapper around the ML pipeline
│   ├── main.py               # Endpoints, background jobs, CORS, storage
│   ├── db.py                 # Optional MongoDB Atlas run-history persistence
│   ├── sample_data/          # Bundled demo dataset (543 rows, 3 stores)
│   └── smoke_test.py         # End-to-end API test (python -m api.smoke_test)
│
├── src/                      # Production ML engine (imported by /api, unchanged)
│   ├── preprocess.py         # Data loading and date parsing
│   ├── features.py           # Chronological train/test splitting
│   ├── model.py              # Random Forest training + evaluation metrics
│   └── visualize.py          # Forecast chart export
│
├── notebooks/                # EDA, preprocessing and modeling notebooks
├── data/                     # Raw Kaggle dataset + sample data (gitignored)
├── outputs/                  # Generated forecasts (CSV) and charts (PNG)
│
├── render.yaml               # One-step Render Blueprint (deploys both services)
├── DEPLOYMENT.md             # Step-by-step Render deployment guide
├── requirements.txt          # Python dependencies (pipeline + API)
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **ML pipeline** | Python, Pandas, NumPy, scikit-learn (Random Forest Regressor), Matplotlib |
| **API** | FastAPI, Uvicorn, background tasks, PyMongo (optional Atlas history) |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, TanStack Query, Zod |
| **Design** | Deep navy + electric cyan identity, Space Grotesk / Inter type system, dark mode |
| **Deployment** | Render (Blueprint: Python web service + Node web service), MongoDB Atlas |

---

## ⚙️ Run Everything Locally

**Prerequisites:** Python 3.11+, Node.js 18+.

```bash
git clone https://github.com/Naol724/FUTURE_ML_01.git
cd FUTURE_ML_01

# ── Terminal 1: API ──────────────────────────────────────
python -m venv venv
venv\Scripts\activate                # Windows  |  source venv/bin/activate (macOS/Linux)
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000

# ── Terminal 2: Frontend ─────────────────────────────────
cd frontend
npm install
npm run dev                          # → http://localhost:3000
```

The frontend reads the API base URL from `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Optional — persistent run history:** create a `.env` file at the repo root with your
MongoDB Atlas connection string (the file is gitignored):

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=Cluster0
```

Without it, everything still works; the History page simply shows browser-local runs only.

**Verify the API end-to-end** (upload → train → metrics → chart → download):

```bash
python -m api.smoke_test
```

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check (used by Render + frontend cold-start banner) |
| `POST` | `/api/upload` | Upload a CSV, validate schema, returns `dataset_id` |
| `POST` | `/api/sample` | Register the bundled demo dataset, returns `dataset_id` |
| `POST` | `/api/forecast/{dataset_id}` | Start training as a background job |
| `GET` | `/api/forecast/{dataset_id}` | Poll job status; returns predictions + metrics when done |
| `GET` | `/api/forecast/{dataset_id}/download` | Download the full forecast as CSV |
| `GET` | `/api/forecast/{dataset_id}/chart` | Daily chart data as JSON (`?format=png` for the image) |
| `GET` | `/api/history` | Past runs persisted in MongoDB Atlas |

Interactive docs available at `/docs` (Swagger UI) when the API is running.

---

## ☁️ Deployment (Render)

The repo ships with a **`render.yaml` Blueprint** that deploys both services in one step:

1. Push the repo to GitHub.
2. In Render: **New → Blueprint** → connect the repo → **Apply**.
3. Set the `MONGODB_URI` env var when prompted (it is never stored in the repo).
4. After the first deploy, align the URLs: `NEXT_PUBLIC_API_URL` on the frontend and `CORS_ORIGINS` on the API.

Full step-by-step instructions, manual setup, and free-tier notes: **[DEPLOYMENT.md](DEPLOYMENT.md)**.

**Environment variables (never hardcoded):**

| Variable | Service | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | frontend | Base URL of the FastAPI service |
| `CORS_ORIGINS` | api | Comma-separated allowed frontend origins |
| `MONGODB_URI` | api | Atlas connection string for run history (optional) |
| `MPLBACKEND=Agg` | api | Headless matplotlib for chart generation |

---

## 🧠 Methodology (How the Forecast Is Built)

1. **Ingest & clean** — the CSV is parsed and calendar features (`year`, `month`, `day`, `dayofweek`) are extracted from each date.
2. **Chronological split** — the first ~80% of the timeline trains the model; the most recent ~20% is held back for evaluation. The model never sees the future it is graded on, eliminating data leakage.
3. **Ensemble training** — a Random Forest Regressor (50 trees) learns store-level patterns, weekly/seasonal rhythms, and promotion effects.
4. **Honest evaluation** — all metrics are computed exclusively on the held-out future window:

| Metric | Business Meaning |
| --- | --- |
| **MAE** | Average units missed per prediction |
| **RMSE** | Like MAE, but penalizes large misses heavily |
| **R²** | Share of sales variation explained (1.0 = perfect) |

5. **Deliverables** — a business-ready forecast CSV and an actual-vs-predicted chart, both exportable from the dashboard.

Dataset: [Kaggle Store Sales — Time Series Forecasting](https://www.kaggle.com/competitions/store-sales-time-series-forecasting) (columns `date`, `store_nbr`, `onpromotion`, `sales`). Any CSV matching this schema works.

---

## 🏆 Skills Demonstrated

* End-to-end ML product engineering: pipeline → API → frontend → cloud deployment.
* Out-of-time chronological validation for trustworthy forecasting metrics.
* Async job orchestration (background training + polling) and graceful degradation (cold starts, optional database).
* Production frontend craft: typed API contracts (Zod), accessibility, responsive design, intentional loading/empty/error states.

---

## 🔗 Internship Details

| Field | Info |
| --- | --- |
| **Organization** | Future Interns |
| **Track** | Machine Learning (ML) |
| **Task Number** | 01 |
| **Repository Format** | `FUTURE_ML_01` |
| **Submission** | Via official Future Interns Task Portal (CIN ID Required) |
| **LinkedIn** | [Future Interns](https://www.linkedin.com/company/future-interns/) |
| **Website** | [futureinterns.com](https://futureinterns.com) |

---

## 👤 Author

**Naol Gonfa (Nileget)**

* **GitHub**: [@Naol724](https://github.com/Naol724)
* **Website**: [naol.online](https://naol.online)
* **Telegram**: [@nilegt_](https://t.me/nilegt_)

---

> *"Consistency builds mastery."*
