"""FastAPI service that exposes the Sales & Demand Forecasting results.

The pipeline in ``src/`` produces ``outputs/forecasts/final_sales_forecast.csv``.
This API reads that file and serves business-ready aggregates (KPIs, daily
actual-vs-forecast series, per-family and per-store breakdowns) to the dashboard
frontend so the model and the UI work together end to end.
"""
from __future__ import annotations

import math
from functools import lru_cache
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent.parent
FORECAST_CSV = BASE_DIR / "outputs" / "forecasts" / "final_sales_forecast.csv"
FRONTEND_DIST = Path(__file__).resolve().parent / "static"

app = FastAPI(
    title="Sales & Demand Forecasting API",
    description="Serves forecast analytics produced by the ML pipeline.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@lru_cache(maxsize=1)
def load_data() -> pd.DataFrame:
    if not FORECAST_CSV.exists():
        raise FileNotFoundError(
            f"Forecast file not found at {FORECAST_CSV}. "
            "Run the ML pipeline in src/ to generate it."
        )
    df = pd.read_csv(FORECAST_CSV)
    df["date"] = pd.to_datetime(df["date"])
    df["error"] = df["forecasted_sales"] - df["actual_sales"]
    df["abs_error"] = df["error"].abs()
    return df


def _filtered(store: Optional[int], family: Optional[str]) -> pd.DataFrame:
    df = load_data()
    if store is not None:
        df = df[df["store_nbr"] == store]
    if family is not None:
        df = df[df["family"] == family]
    return df


def _safe(value: float) -> float:
    """Convert NaN/inf to JSON-safe numbers."""
    if value is None or math.isnan(value) or math.isinf(value):
        return 0.0
    return float(value)


def compute_metrics(df: pd.DataFrame) -> dict:
    actual = df["actual_sales"].to_numpy(dtype=float)
    pred = df["forecasted_sales"].to_numpy(dtype=float)
    n = len(actual)
    if n == 0:
        return {"mae": 0, "rmse": 0, "r2": 0, "wape": 0, "accuracy": 0, "bias": 0}

    mae = float(np.mean(np.abs(actual - pred)))
    rmse = float(np.sqrt(np.mean((actual - pred) ** 2)))

    ss_res = float(np.sum((actual - pred) ** 2))
    ss_tot = float(np.sum((actual - actual.mean()) ** 2))
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0.0

    total_actual = float(actual.sum())
    wape = float(np.sum(np.abs(actual - pred)) / total_actual) if total_actual > 0 else 0.0
    accuracy = max(0.0, (1 - wape)) * 100
    bias = float(np.mean(pred - actual))

    return {
        "mae": _safe(mae),
        "rmse": _safe(rmse),
        "r2": _safe(r2),
        "wape": _safe(wape * 100),
        "accuracy": _safe(accuracy),
        "bias": _safe(bias),
    }


@app.get("/api/health")
def health() -> dict:
    try:
        df = load_data()
    except FileNotFoundError as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=503, detail=str(exc))
    return {"status": "ok", "rows": int(len(df))}


@app.get("/api/filters")
def filters() -> dict:
    df = load_data()
    return {
        "stores": sorted(int(s) for s in df["store_nbr"].unique()),
        "families": sorted(str(f) for f in df["family"].unique()),
        "date_start": df["date"].min().strftime("%Y-%m-%d"),
        "date_end": df["date"].max().strftime("%Y-%m-%d"),
    }


@app.get("/api/overview")
def overview(
    store: Optional[int] = Query(None),
    family: Optional[str] = Query(None),
) -> dict:
    df = _filtered(store, family)
    metrics = compute_metrics(df)
    total_actual = float(df["actual_sales"].sum())
    total_forecast = float(df["forecasted_sales"].sum())
    return {
        "metrics": metrics,
        "totals": {
            "actual": total_actual,
            "forecast": total_forecast,
            "rows": int(len(df)),
            "stores": int(df["store_nbr"].nunique()),
            "families": int(df["family"].nunique()),
            "days": int(df["date"].nunique()),
            "avg_daily_actual": _safe(total_actual / max(1, df["date"].nunique())),
        },
        "range": {
            "start": df["date"].min().strftime("%Y-%m-%d") if len(df) else None,
            "end": df["date"].max().strftime("%Y-%m-%d") if len(df) else None,
        },
    }


@app.get("/api/timeseries")
def timeseries(
    store: Optional[int] = Query(None),
    family: Optional[str] = Query(None),
) -> dict:
    df = _filtered(store, family)
    grouped = (
        df.groupby("date")[["actual_sales", "forecasted_sales"]]
        .sum()
        .sort_index()
    )
    return {
        "points": [
            {
                "date": idx.strftime("%Y-%m-%d"),
                "actual": _safe(row["actual_sales"]),
                "forecast": _safe(row["forecasted_sales"]),
            }
            for idx, row in grouped.iterrows()
        ]
    }


@app.get("/api/families")
def families(
    store: Optional[int] = Query(None),
    limit: int = Query(33, ge=1, le=100),
) -> dict:
    df = _filtered(store, None)
    grouped = df.groupby("family").agg(
        actual=("actual_sales", "sum"),
        forecast=("forecasted_sales", "sum"),
        abs_error=("abs_error", "mean"),
    )
    grouped = grouped.sort_values("actual", ascending=False).head(limit)
    return {
        "items": [
            {
                "family": idx,
                "actual": _safe(row["actual"]),
                "forecast": _safe(row["forecast"]),
                "mae": _safe(row["abs_error"]),
            }
            for idx, row in grouped.iterrows()
        ]
    }


@app.get("/api/stores")
def stores(
    family: Optional[str] = Query(None),
    limit: int = Query(54, ge=1, le=100),
) -> dict:
    df = _filtered(None, family)
    grouped = df.groupby("store_nbr").agg(
        actual=("actual_sales", "sum"),
        forecast=("forecasted_sales", "sum"),
    )
    grouped = grouped.sort_values("actual", ascending=False).head(limit)
    return {
        "items": [
            {
                "store": int(idx),
                "actual": _safe(row["actual"]),
                "forecast": _safe(row["forecast"]),
            }
            for idx, row in grouped.iterrows()
        ]
    }


@app.get("/api/scatter")
def scatter(
    store: Optional[int] = Query(None),
    family: Optional[str] = Query(None),
    sample: int = Query(600, ge=50, le=5000),
) -> dict:
    """Daily store/family actual-vs-forecast pairs for the accuracy scatter."""
    df = _filtered(store, family)
    if len(df) > sample:
        df = df.sample(sample, random_state=42)
    return {
        "points": [
            {"actual": _safe(a), "forecast": _safe(f)}
            for a, f in zip(df["actual_sales"], df["forecasted_sales"])
        ]
    }


# Serve the built frontend (single-page app) when present.
if FRONTEND_DIST.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_DIST / "assets"),
        name="assets",
    )

    @app.get("/")
    def index() -> FileResponse:
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/{full_path:path}")
    def spa(full_path: str) -> FileResponse:
        candidate = FRONTEND_DIST / full_path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")
