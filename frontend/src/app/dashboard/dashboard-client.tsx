"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Download,
  FileBarChart2,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ForecastChart } from "@/components/dashboard/forecast-chart";
import { ForecastTable } from "@/components/dashboard/forecast-table";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { ResultsSkeleton } from "@/components/dashboard/results-skeleton";
import { ServerStatusBanner } from "@/components/dashboard/server-status-banner";
import { UploadPanel, type SelectedFile } from "@/components/dashboard/upload-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  downloadUrl,
  getForecast,
  startForecast,
  createSampleDataset,
  uploadDataset,
  type UploadResponse,
} from "@/lib/api";
import { saveHistoryEntry } from "@/lib/history";
import { formatNumber } from "@/lib/utils";

export function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // The dataset id lives in the URL (?dataset=...) so runs are shareable and
  // survive refreshes; without one the page prompts for an upload.
  const datasetId = searchParams.get("dataset");

  const [selected, setSelected] = useState<SelectedFile | null>(null);
  const [upload, setUpload] = useState<UploadResponse | null>(null);
  const savedToHistory = useRef<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDataset(file),
    onSuccess: (data) => {
      setUpload(data);
      router.replace(`/dashboard?dataset=${data.dataset_id}`, { scroll: false });
    },
  });

  const sampleMutation = useMutation({
    mutationFn: () => createSampleDataset(),
    onSuccess: (data) => {
      setSelected(null);
      setUpload(data);
      savedToHistory.current = null;
      router.replace(`/dashboard?dataset=${data.dataset_id}`, { scroll: false });
    },
  });

  const runMutation = useMutation({
    mutationFn: (id: string) => startForecast(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["forecast", datasetId] });
    },
  });

  const forecastQuery = useQuery({
    queryKey: ["forecast", datasetId],
    queryFn: () => getForecast(datasetId!),
    enabled: Boolean(datasetId),
    refetchInterval: (query) =>
      query.state.data?.status === "processing" ? 2000 : false,
    retry: (count, error) => !(error instanceof ApiError && error.status === 404) && count < 2,
  });

  const forecast = forecastQuery.data;
  const status = forecast?.status;
  const isRunning = runMutation.isPending || status === "processing";
  const isDone = status === "done" && !!forecast?.metrics;

  // Persist finished runs to localStorage for the /history page.
  useEffect(() => {
    if (isDone && forecast && datasetId && savedToHistory.current !== datasetId) {
      savedToHistory.current = datasetId;
      saveHistoryEntry({
        datasetId,
        filename:
          selected?.file.name ?? (sampleMutation.isSuccess ? "sample_sales_data.csv" : "uploaded dataset"),
        ranAt: new Date().toISOString(),
        rows: forecast.test_rows ?? forecast.predictions?.length ?? 0,
        stores: forecast.stores?.length ?? 0,
        metrics: forecast.metrics!,
      });
    }
  }, [isDone, forecast, datasetId, selected, sampleMutation.isSuccess]);

  const handleFileAccepted = useCallback(
    (selection: SelectedFile) => {
      setSelected(selection);
      setUpload(null);
      savedToHistory.current = null;
      uploadMutation.mutate(selection.file);
    },
    [uploadMutation],
  );

  const handleReset = useCallback(() => {
    setSelected(null);
    setUpload(null);
    uploadMutation.reset();
    runMutation.reset();
    sampleMutation.reset();
    router.replace("/dashboard", { scroll: false });
  }, [router, uploadMutation, runMutation, sampleMutation]);

  const canRun = Boolean(datasetId) && !isRunning && !uploadMutation.isPending;

  return (
    <div className="container py-8 md:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Forecast dashboard</h1>
          <p className="mt-1.5 text-muted-foreground">
            Upload historical sales, train the model, and explore predictions.
          </p>
        </div>
        {datasetId && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="size-4" aria-hidden="true" />
            New dataset
          </Button>
        )}
      </div>

      <ServerStatusBanner />

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        {/* Left column: upload + run controls */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <UploadPanel
            onFileAccepted={handleFileAccepted}
            selected={selected}
            disabled={uploadMutation.isPending || isRunning}
            uploadError={uploadMutation.error?.message ?? null}
          />

          {!datasetId && (
            <div className="animate-fade-up">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => sampleMutation.mutate()}
                disabled={sampleMutation.isPending || uploadMutation.isPending}
                aria-label="Load the built-in sample dataset"
              >
                {sampleMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="size-4 text-accent" aria-hidden="true" />
                )}
                No CSV handy? Try the sample dataset
              </Button>
              {sampleMutation.error && (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {sampleMutation.error.message}
                </p>
              )}
            </div>
          )}

          {(upload || datasetId) && (
            <div className="animate-fade-up rounded-2xl border border-border bg-card p-5 shadow-card">
              {upload && (
                <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Rows</dt>
                    <dd className="font-medium tabular-nums">{formatNumber(upload.rows, 0)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Stores</dt>
                    <dd className="font-medium tabular-nums">{upload.stores}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Date range</dt>
                    <dd className="font-medium">
                      {upload.date_start} → {upload.date_end}
                    </dd>
                  </div>
                </dl>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={!canRun}
                onClick={() => datasetId && runMutation.mutate(datasetId)}
                aria-label={isDone ? "Re-run the forecast" : "Run the forecast"}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Training model…
                  </>
                ) : (
                  <>
                    <Play className="size-4" aria-hidden="true" />
                    {isDone ? "Re-run forecast" : "Run forecast"}
                  </>
                )}
              </Button>

              {isRunning && (
                <p role="status" className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="size-1.5 animate-pulse-dot rounded-full bg-accent" aria-hidden="true" />
                  Random Forest training in progress — larger files can take a minute.
                </p>
              )}
              {runMutation.error && (
                <p role="alert" className="mt-3 text-sm text-danger">
                  {runMutation.error.message}
                </p>
              )}

              {isDone && datasetId && (
                <a
                  href={downloadUrl(datasetId)}
                  download
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download CSV
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right column: results */}
        <div className="min-w-0 space-y-6">
          {!datasetId && (
            <EmptyState
              icon={UploadCloud}
              title="No dataset yet"
              body="Upload a CSV of historical sales on the left to get started — or load the built-in sample dataset to see the full workflow instantly."
              action={
                <Button
                  variant="outline"
                  onClick={() => sampleMutation.mutate()}
                  disabled={sampleMutation.isPending}
                >
                  {sampleMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles className="size-4 text-accent" aria-hidden="true" />
                  )}
                  Load sample data
                </Button>
              }
            />
          )}

          {datasetId && forecastQuery.isLoading && <ResultsSkeleton />}

          {datasetId && forecastQuery.isError && (
            <EmptyState
              icon={AlertTriangle}
              title="Couldn't load this dataset"
              body={
                forecastQuery.error instanceof ApiError && forecastQuery.error.status === 404
                  ? "This dataset id wasn't found on the server — it may have expired. Upload the file again to start a new run."
                  : forecastQuery.error.message
              }
              action={
                <Button variant="outline" onClick={handleReset}>
                  Upload a new dataset
                </Button>
              }
            />
          )}

          {status === "uploaded" && !isRunning && (
            <EmptyState
              icon={FileBarChart2}
              title="Dataset ready"
              body="Your file passed validation and is stored on the server. Hit “Run forecast” to train the Random Forest model and evaluate it on the most recent slice of your data."
            />
          )}

          {isRunning && <ResultsSkeleton />}

          {status === "error" && (
            <EmptyState
              icon={AlertTriangle}
              title="The forecast run failed"
              body={forecast?.error ?? "Something went wrong while training the model."}
              action={
                <Button onClick={() => datasetId && runMutation.mutate(datasetId)}>
                  <Play className="size-4" aria-hidden="true" />
                  Try again
                </Button>
              }
            />
          )}

          {isDone && forecast && (
            <>
              <div className="animate-fade-in flex flex-wrap items-center gap-2">
                <Badge variant="success">Forecast complete</Badge>
                {forecast.split_date && (
                  <Badge>Evaluated on data from {forecast.split_date} onward</Badge>
                )}
                {forecast.stores && <Badge>{forecast.stores.length} stores</Badge>}
              </div>
              <MetricCards metrics={forecast.metrics} />
              {forecast.predictions && forecast.predictions.length > 0 && (
                <>
                  <ForecastChart predictions={forecast.predictions} />
                  <ForecastTable
                    predictions={forecast.predictions}
                    truncated={forecast.predictions_truncated}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
