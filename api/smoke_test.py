"""Quick end-to-end smoke test for the API wrapper (run: python -m api.smoke_test)."""

import io
import time

import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)

# Build a small synthetic dataset matching the train.csv schema.
rng = np.random.default_rng(42)
dates = pd.date_range("2024-01-01", periods=120, freq="D")
rows = []
for store in [1, 2, 3]:
    base = 100 * store
    for i, d in enumerate(dates):
        promo = int(rng.integers(0, 10))
        rows.append(
            {
                "date": d.strftime("%Y-%m-%d"),
                "store_nbr": store,
                "onpromotion": promo,
                "sales": base + 10 * np.sin(i / 7) + 5 * promo + rng.normal(0, 5),
            }
        )
df = pd.DataFrame(rows)
csv_bytes = df.to_csv(index=False).encode()

print("health:", client.get("/api/health").json())

r = client.post("/api/upload", files={"file": ("train.csv", io.BytesIO(csv_bytes), "text/csv")})
print("upload:", r.status_code, r.json())
assert r.status_code == 200
dataset_id = r.json()["dataset_id"]

r = client.post(f"/api/forecast/{dataset_id}")
print("start:", r.status_code, r.json())

for _ in range(60):
    r = client.get(f"/api/forecast/{dataset_id}")
    body = r.json()
    if body["status"] in ("done", "error"):
        break
    time.sleep(0.5)

print("status:", body["status"], "error:", body.get("error"))
assert body["status"] == "done", body
print("metrics:", body["metrics"])
print("predictions:", len(body["predictions"]), "rows, truncated:", body["predictions_truncated"])
print("stores:", body["stores"], "split_date:", body["split_date"])

r = client.get(f"/api/forecast/{dataset_id}/chart")
print("chart json points:", len(r.json()))

r = client.get(f"/api/forecast/{dataset_id}/chart?format=png")
print("chart png:", r.status_code, r.headers["content-type"], len(r.content), "bytes")

r = client.get(f"/api/forecast/{dataset_id}/download")
print("download:", r.status_code, r.headers["content-type"], len(r.content), "bytes")

# Sample dataset endpoint
r = client.post("/api/sample")
print("sample:", r.status_code, r.json())
assert r.status_code == 200
sample_id = r.json()["dataset_id"]
client.post(f"/api/forecast/{sample_id}")
for _ in range(120):
    body = client.get(f"/api/forecast/{sample_id}").json()
    if body["status"] in ("done", "error"):
        break
    time.sleep(0.5)
assert body["status"] == "done", body
print("sample metrics:", body["metrics"])

# History endpoint (MongoDB-backed; empty list when no DB configured)
r = client.get("/api/history")
print("history:", r.status_code, len(r.json()), "runs")
assert r.status_code == 200

# Error cases
r = client.post("/api/upload", files={"file": ("bad.csv", io.BytesIO(b"a,b\n1,2"), "text/csv")})
print("bad schema:", r.status_code, r.json()["detail"])
r = client.get("/api/forecast/nonexistent")
print("unknown id:", r.status_code)

print("\nALL SMOKE TESTS PASSED")
