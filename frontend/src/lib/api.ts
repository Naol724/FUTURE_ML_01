import { z } from "zod";

/**
 * Typed client for the FastAPI forecasting service.
 * Every response is validated with Zod before it reaches the UI.
 */

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);

export const uploadResponseSchema = z.object({
  dataset_id: z.string(),
  rows: z.number(),
  stores: z.number(),
  date_start: z.string(),
  date_end: z.string(),
});
export type UploadResponse = z.infer<typeof uploadResponseSchema>;

export const metricsSchema = z.object({
  mae: z.number(),
  rmse: z.number(),
  r2: z.number(),
});
export type Metrics = z.infer<typeof metricsSchema>;

export const predictionRowSchema = z.object({
  date: z.string(),
  store_nbr: z.number(),
  actual: z.number(),
  predicted: z.number(),
});
export type PredictionRow = z.infer<typeof predictionRowSchema>;

export const forecastStatusSchema = z.object({
  dataset_id: z.string(),
  status: z.enum(["uploaded", "processing", "done", "error"]),
  error: z.string().nullable().optional(),
  rows: z.number().nullable().optional(),
  predictions: z.array(predictionRowSchema).optional(),
  predictions_truncated: z.boolean().optional(),
  metrics: metricsSchema.optional(),
  split_date: z.string().optional(),
  test_rows: z.number().optional(),
  stores: z.array(z.number()).optional(),
});
export type ForecastStatus = z.infer<typeof forecastStatusSchema>;

export const chartPointSchema = z.object({
  date: z.string(),
  actual: z.number(),
  predicted: z.number(),
});
export type ChartPoint = z.infer<typeof chartPointSchema>;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseError(res: Response): Promise<never> {
  let message = `Request failed (${res.status})`;
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") message = body.detail;
  } catch {
    // keep the generic message
  }
  throw new ApiError(message, res.status);
}

export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/health`, { signal, cache: "no-store" });
  return res.ok;
}

export async function uploadDataset(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/upload`, { method: "POST", body: form });
  if (!res.ok) await parseError(res);
  return uploadResponseSchema.parse(await res.json());
}

export async function createSampleDataset(): Promise<UploadResponse> {
  const res = await fetch(`${API_URL}/api/sample`, { method: "POST" });
  if (!res.ok) await parseError(res);
  return uploadResponseSchema.parse(await res.json());
}

export const serverRunSchema = z.object({
  dataset_id: z.string(),
  filename: z.string().nullable().optional(),
  finished_at: z.string(),
  rows: z.number().nullable().optional(),
  test_rows: z.number().optional(),
  stores: z.number().optional(),
  split_date: z.string().optional(),
  metrics: metricsSchema,
});
export type ServerRun = z.infer<typeof serverRunSchema>;

export async function getServerHistory(): Promise<ServerRun[]> {
  const res = await fetch(`${API_URL}/api/history`, { cache: "no-store" });
  if (!res.ok) await parseError(res);
  return z.array(serverRunSchema).parse(await res.json());
}

export async function startForecast(datasetId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/forecast/${datasetId}`, { method: "POST" });
  if (!res.ok) await parseError(res);
}

export async function getForecast(datasetId: string): Promise<ForecastStatus> {
  const res = await fetch(`${API_URL}/api/forecast/${datasetId}`, { cache: "no-store" });
  if (!res.ok) await parseError(res);
  return forecastStatusSchema.parse(await res.json());
}

export async function getChartData(datasetId: string): Promise<ChartPoint[]> {
  const res = await fetch(`${API_URL}/api/forecast/${datasetId}/chart`);
  if (!res.ok) await parseError(res);
  return z.array(chartPointSchema).parse(await res.json());
}

export function downloadUrl(datasetId: string): string {
  return `${API_URL}/api/forecast/${datasetId}/download`;
}
