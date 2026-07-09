"""Optional MongoDB Atlas integration.

When the MONGODB_URI environment variable is set (e.g. in a root .env file or
Render env vars), completed forecast runs are persisted to the `forecastly`
database so run history survives server restarts. When it is not set, the API
works exactly as before — history simply comes back empty.
"""

import os
from typing import Any, Optional

from dotenv import load_dotenv

load_dotenv()  # reads .env at the repo root when running locally

_client: Optional[Any] = None
_checked = False


def get_runs_collection():
    """Returns the `runs` collection, or None if Mongo is not configured/reachable."""
    global _client, _checked
    uri = os.environ.get("MONGODB_URI")
    if not uri:
        return None
    if _client is None and not _checked:
        _checked = True
        try:
            from pymongo import MongoClient

            _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            _client.admin.command("ping")
        except Exception as exc:
            print(f"[db] MongoDB unavailable, falling back to no-op history: {exc}")
            _client = None
    if _client is None:
        return None
    return _client["forecastly"]["runs"]


def save_run(doc: dict) -> None:
    """Upserts a completed run document; never raises (history is best-effort)."""
    runs = get_runs_collection()
    if runs is None:
        return
    try:
        runs.update_one({"dataset_id": doc["dataset_id"]}, {"$set": doc}, upsert=True)
    except Exception as exc:
        print(f"[db] Failed to save run: {exc}")


def list_runs(limit: int = 50) -> list[dict]:
    """Returns recent runs, newest first. Empty list when Mongo is not configured."""
    runs = get_runs_collection()
    if runs is None:
        return []
    try:
        cursor = runs.find({}, {"_id": 0}).sort("finished_at", -1).limit(limit)
        return list(cursor)
    except Exception as exc:
        print(f"[db] Failed to list runs: {exc}")
        return []
