"""
FastAPI wrapper around the existing FUTURE_ML_01 forecasting pipeline.

This service does NOT reimplement any ML logic. It imports and calls the
existing production functions from `src/`:

    load_and_preprocess_data  (src/preprocess.py)
    split_features_and_target (src/features.py)
    train_random_forest       (src/model.py)
    evaluate_predictions      (src/model.py)
    plot_and_save_forecast    (src/visualize.py)

Run locally:
    uvicorn api.main:app --reload --port 8000
"""

import json
import os

# Force a headless matplotlib backend BEFORE src/visualize.py imports pyplot;
# training runs in a background thread where GUI backends crash.
os.environ.setdefault("MPLBACKEND", "Agg")

import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from fastapi import BackgroundTasks, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

# Make the existing ML modules in /src importable without modifying them.
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "src"))

from features import split_features_and_target  # noqa: E402
from model import evaluate_predictions, train_random_forest  # noqa: E402
from preprocess import load_and_preprocess_data  # noqa: E402
from visualize import plot_and_save_forecast  # noqa: E402

from api import db  # noqa: E402

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

STORAGE_DIR = Path(os.environ.get("STORAGE_DIR", REPO_ROOT / "api" / "storage"))
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_MB = int(os.environ.get("MAX_UPLOAD_MB", "50"))
REQUIRED_COLUMNS = {"date", "store_nbr", "onpromotion", "sales"}

# Demo dataset bundled with the API so users can try the app without a CSV.
SAMPLE_CSV_PATH = Path(__file__).resolve().parent / "sample_data" / "sample_sales_data.csv"

# Cap the number of prediction rows returned as JSON so huge datasets don't
# produce multi-hundred-MB responses. The full result is always available
# through the CSV download endpoint.
MAX_JSON_ROWS = int(os.environ.get("MAX_JSON_ROWS", "20000"))

# Comma-separated list of allowed frontend origins, e.g.
# "https://my-frontend.onrender.com,http://localhost:3000"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    if origin.strip()
]

app = FastAPI(
    title="Sales & Demand Forecasting API",
    description="HTTP wrapper around the FUTURE_ML_01 Random Forest pipeline.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=os.environ.get("CORS_ORIGIN_REGEX", r"https?://localhost(:\d+)?"),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Small on-disk job store (keeps Render free tier simple: no DB required)
# ---------------------------------------------------------------------------


def _dataset_dir(dataset_id: str) -> Path:
    return STORAGE_DIR / dataset_id


def _status_path(dataset_id: str) -> Path:
    return _dataset_dir(dataset_id) / "status.json"


def _read_status(dataset_id: str) -> dict:
    path = _status_path(dataset_id)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Unknown dataset_id.")
    return json.loads(path.read_text())


def _write_status(dataset_id: str, payload: dict) -> None:
    _status_path(dataset_id).write_text(json.dumps(payload))


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Pipeline execution (background task)
# ---------------------------------------------------------------------------


def _pick_split_date(df: pd.DataFrame) -> str:
    """Choose a chronological split date at ~80% of the unique dates.

    The original pipeline hardcodes 2017-06-01 (for the Kaggle dataset).
    For arbitrary uploads we keep the exact same chronological-split logic
    from src/features.py but pass it a split date that guarantees both a
    non-empty training window and a non-empty evaluation window.
    """
    unique_dates = df["date"].sort_values().unique()
    if len(unique_dates) < 5:
        raise ValueError("Dataset needs at least 5 distinct dates to split chronologically.")
    split_idx = max(1, int(len(unique_dates) * 0.8))
    split_idx = min(split_idx, len(unique_dates) - 1)
    return pd.Timestamp(unique_dates[split_idx]).strftime("%Y-%m-%d")


def run_forecast_job(dataset_id: str) -> None:
    """Runs the existing pipeline end-to-end and persists all artifacts."""
    dataset_dir = _dataset_dir(dataset_id)
    status = _read_status(dataset_id)

    try:
        # 1. Ingest & preprocess (src/preprocess.py)
        df_clean = load_and_preprocess_data(str(dataset_dir / "raw.csv"))

        # 2. Chronological split (src/features.py)
        split_date = _pick_split_date(df_clean)
        X_train, y_train, X_test, y_test, test_subset = split_features_and_target(
            df_clean, split_date=split_date
        )
        if len(X_train) == 0 or len(X_test) == 0:
            raise ValueError("Chronological split produced an empty train or test set.")

        # 3. Train & predict (src/model.py)
        model = train_random_forest(X_train, y_train)
        predictions = model.predict(X_test)

        # 4. Metrics (src/model.py)
        mae, rmse, r2 = evaluate_predictions(y_test, predictions)

        # 5. Persist the business-ready forecast CSV
        results = test_subset.copy()
        results["predicted_sales"] = predictions
        forecast_csv = results[["date", "store_nbr", "onpromotion", "sales", "predicted_sales"]].rename(
            columns={"sales": "actual_sales"}
        )
        forecast_csv.to_csv(dataset_dir / "final_sales_forecast.csv", index=False)

        # 6. Persist the evaluation chart PNG (src/visualize.py)
        plot_and_save_forecast(test_subset, predictions, output_path=str(dataset_dir / "forecast_vs_actual.png"))

        # 7. Build the JSON payloads consumed by the frontend.
        rows = results[["date", "store_nbr", "sales", "predicted_sales"]].copy()
        rows["date"] = rows["date"].dt.strftime("%Y-%m-%d")
        truncated = len(rows) > MAX_JSON_ROWS
        if truncated:
            rows = rows.head(MAX_JSON_ROWS)
        predictions_json = [
            {
                "date": r.date,
                "store_nbr": int(r.store_nbr),
                "actual": round(float(r.sales), 3),
                "predicted": round(float(r.predicted_sales), 3),
            }
            for r in rows.itertuples()
        ]

        daily = (
            results.groupby("date")[["sales", "predicted_sales"]]
            .sum()
            .reset_index()
            .sort_values("date")
        )
        chart_json = [
            {
                "date": r.date.strftime("%Y-%m-%d"),
                "actual": round(float(r.sales), 3),
                "predicted": round(float(r.predicted_sales), 3),
            }
            for r in daily.itertuples()
        ]

        result_payload = {
            "predictions": predictions_json,
            "predictions_truncated": truncated,
            "metrics": {"mae": round(float(mae), 4), "rmse": round(float(rmse), 4), "r2": round(float(r2), 4)},
            "split_date": split_date,
            "test_rows": int(len(results)),
            "stores": sorted(int(s) for s in results["store_nbr"].unique()),
        }
        (dataset_dir / "result.json").write_text(json.dumps(result_payload))
        (dataset_dir / "chart.json").write_text(json.dumps(chart_json))

        status.update({"status": "done", "finished_at": _utcnow(), "error": None})
        _write_status(dataset_id, status)

        # Best-effort persistence to MongoDB Atlas (skipped when not configured).
        db.save_run(
            {
                "dataset_id": dataset_id,
                "filename": status.get("filename"),
                "finished_at": status["finished_at"],
                "rows": status.get("rows"),
                "test_rows": int(len(results)),
                "stores": len(result_payload["stores"]),
                "split_date": split_date,
                "metrics": result_payload["metrics"],
            }
        )
    except Exception as exc:  # surface the failure to the polling frontend
        status.update({"status": "error", "finished_at": _utcnow(), "error": str(exc)})
        _write_status(dataset_id, status)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "time": _utcnow()}


def _register_dataset(contents: bytes, filename: str) -> dict:
    """Validates CSV bytes and registers them as a new dataset."""
    dataset_id = uuid.uuid4().hex[:12]
    dataset_dir = _dataset_dir(dataset_id)
    dataset_dir.mkdir(parents=True, exist_ok=True)
    raw_path = dataset_dir / "raw.csv"
    raw_path.write_bytes(contents)

    # Validate schema before accepting the dataset.
    try:
        df = pd.read_csv(raw_path)
    except Exception:
        raw_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Could not parse the file as CSV.")

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(sorted(missing))}. "
            f"Expected schema: date, store_nbr, onpromotion, sales.",
        )
    if len(df) == 0:
        raise HTTPException(status_code=400, detail="The CSV contains no data rows.")

    try:
        dates = pd.to_datetime(df["date"])
    except Exception:
        raise HTTPException(status_code=400, detail="The 'date' column could not be parsed as dates.")

    _write_status(
        dataset_id,
        {
            "dataset_id": dataset_id,
            "filename": filename,
            "status": "uploaded",
            "uploaded_at": _utcnow(),
            "rows": int(len(df)),
            "stores": int(df["store_nbr"].nunique()),
            "date_start": dates.min().strftime("%Y-%m-%d"),
            "date_end": dates.max().strftime("%Y-%m-%d"),
            "error": None,
        },
    )

    return {
        "dataset_id": dataset_id,
        "rows": int(len(df)),
        "stores": int(df["store_nbr"].nunique()),
        "date_start": dates.min().strftime("%Y-%m-%d"),
        "date_end": dates.max().strftime("%Y-%m-%d"),
    }


@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)) -> dict:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(contents) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds the {MAX_UPLOAD_MB} MB limit.")

    return _register_dataset(contents, file.filename)


@app.post("/api/sample")
def use_sample_dataset() -> dict:
    """Registers the bundled demo dataset so users can try the app instantly."""
    if not SAMPLE_CSV_PATH.exists():
        raise HTTPException(status_code=500, detail="Sample dataset is missing on the server.")
    return _register_dataset(SAMPLE_CSV_PATH.read_bytes(), "sample_sales_data.csv")


@app.get("/api/history")
def get_history() -> list[dict]:
    """Past forecast runs persisted in MongoDB (empty if no database configured)."""
    return db.list_runs()


@app.post("/api/forecast/{dataset_id}")
def start_forecast(dataset_id: str, background_tasks: BackgroundTasks) -> dict:
    status = _read_status(dataset_id)
    if status["status"] == "processing":
        return {"dataset_id": dataset_id, "status": "processing"}

    status.update({"status": "processing", "started_at": _utcnow(), "error": None})
    _write_status(dataset_id, status)
    background_tasks.add_task(run_forecast_job, dataset_id)
    return {"dataset_id": dataset_id, "status": "processing"}


@app.get("/api/forecast/{dataset_id}")
def get_forecast(dataset_id: str) -> JSONResponse:
    """Poll endpoint: returns job status, plus the full result once done."""
    status = _read_status(dataset_id)
    payload = {
        "dataset_id": dataset_id,
        "status": status["status"],
        "error": status.get("error"),
        "rows": status.get("rows"),
    }
    if status["status"] == "done":
        result_path = _dataset_dir(dataset_id) / "result.json"
        payload.update(json.loads(result_path.read_text()))
    return JSONResponse(payload)


@app.get("/api/forecast/{dataset_id}/download")
def download_forecast(dataset_id: str) -> FileResponse:
    _read_status(dataset_id)  # 404 for unknown ids
    csv_path = _dataset_dir(dataset_id) / "final_sales_forecast.csv"
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="Forecast not generated yet. Run the forecast first.")
    return FileResponse(csv_path, media_type="text/csv", filename="final_sales_forecast.csv")


@app.get("/api/forecast/{dataset_id}/chart")
def get_chart(dataset_id: str, format: str = "json"):
    """Daily aggregated actual vs. predicted sales.

    Returns chart data as JSON by default so the frontend can render it
    natively with Recharts. Pass ?format=png for the matplotlib image
    produced by the original pipeline.
    """
    _read_status(dataset_id)
    dataset_dir = _dataset_dir(dataset_id)

    if format == "png":
        png_path = dataset_dir / "forecast_vs_actual.png"
        if not png_path.exists():
            raise HTTPException(status_code=404, detail="Chart not generated yet. Run the forecast first.")
        return FileResponse(png_path, media_type="image/png", filename="forecast_vs_actual.png")

    chart_path = dataset_dir / "chart.json"
    if not chart_path.exists():
        raise HTTPException(status_code=404, detail="Chart data not generated yet. Run the forecast first.")
    return JSONResponse(json.loads(chart_path.read_text()))
