"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, Cloud, ExternalLink, HardDrive, History, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getServerHistory, type Metrics } from "@/lib/api";
import {
  clearHistory,
  loadHistory,
  removeHistoryEntry,
  type HistoryEntry,
} from "@/lib/history";
import { formatNumber } from "@/lib/utils";

interface DisplayEntry {
  datasetId: string;
  filename: string;
  ranAt: string;
  rows: number;
  stores: number;
  metrics: Metrics;
  /** true when the run is persisted in MongoDB (shared across browsers) */
  fromServer: boolean;
}

export default function HistoryPage() {
  const [localEntries, setLocalEntries] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    setLocalEntries(loadHistory());
  }, []);

  // Runs persisted in MongoDB Atlas by the API (empty when no DB configured).
  const serverQuery = useQuery({
    queryKey: ["server-history"],
    queryFn: getServerHistory,
    retry: 1,
  });

  const entries = useMemo<DisplayEntry[] | null>(() => {
    if (localEntries === null) return null;
    const merged = new Map<string, DisplayEntry>();
    for (const e of localEntries) {
      merged.set(e.datasetId, { ...e, fromServer: false });
    }
    for (const run of serverQuery.data ?? []) {
      merged.set(run.dataset_id, {
        datasetId: run.dataset_id,
        filename: run.filename ?? "uploaded dataset",
        ranAt: run.finished_at,
        rows: run.rows ?? run.test_rows ?? 0,
        stores: run.stores ?? 0,
        metrics: run.metrics,
        fromServer: true,
      });
    }
    return Array.from(merged.values()).sort(
      (a, b) => new Date(b.ranAt).getTime() - new Date(a.ranAt).getTime(),
    );
  }, [localEntries, serverQuery.data]);

  const handleRemove = (datasetId: string) => {
    removeHistoryEntry(datasetId);
    setLocalEntries(loadHistory());
  };

  const handleClear = () => {
    clearHistory();
    setLocalEntries([]);
  };

  return (
    <div className="container py-8 md:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Run history</h1>
          <p className="mt-1.5 text-muted-foreground">
            Past forecast runs — cloud entries come from the database, local ones from this
            browser.
          </p>
        </div>
        {localEntries && localEntries.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="size-4" aria-hidden="true" />
            Clear local history
          </Button>
        )}
      </div>

      {(entries === null || serverQuery.isLoading) && (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {entries !== null && !serverQuery.isLoading && entries.length === 0 && (
        <EmptyState
          icon={History}
          title="No forecast runs yet"
          body="Runs you complete on the dashboard will show up here with their dataset id, timestamp and accuracy metrics — handy for comparing experiments."
          action={
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground transition-all hover:brightness-110"
            >
              Run your first forecast
            </Link>
          }
        />
      )}

      <ul className="space-y-3">
        {entries !== null &&
          !serverQuery.isLoading &&
          entries.map((entry) => (
            <li key={entry.datasetId}>
              <Card className="animate-fade-up hover:shadow-card-hover">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate font-medium">
                      {entry.filename}
                      <Badge variant={entry.fromServer ? "accent" : "default"}>
                        {entry.fromServer ? (
                          <Cloud className="size-3" aria-hidden="true" />
                        ) : (
                          <HardDrive className="size-3" aria-hidden="true" />
                        )}
                        {entry.fromServer ? "cloud" : "local"}
                      </Badge>
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5" aria-hidden="true" />
                        {new Date(entry.ranAt).toLocaleString()}
                      </span>
                      <span>{formatNumber(entry.rows, 0)} rows</span>
                      <span>{entry.stores} stores</span>
                      <span className="font-mono text-xs">{entry.datasetId}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <dl className="hidden gap-4 text-sm sm:flex">
                      <div className="text-right">
                        <dt className="text-xs text-muted-foreground">MAE</dt>
                        <dd className="font-medium tabular-nums">
                          {formatNumber(entry.metrics.mae)}
                        </dd>
                      </div>
                      <div className="text-right">
                        <dt className="text-xs text-muted-foreground">RMSE</dt>
                        <dd className="font-medium tabular-nums">
                          {formatNumber(entry.metrics.rmse)}
                        </dd>
                      </div>
                      <div className="text-right">
                        <dt className="text-xs text-muted-foreground">R²</dt>
                        <dd className="font-medium tabular-nums">
                          {formatNumber(entry.metrics.r2, 4)}
                        </dd>
                      </div>
                    </dl>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard?dataset=${entry.datasetId}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted"
                        aria-label={`Open run ${entry.datasetId} in the dashboard`}
                      >
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        Open
                      </Link>
                      {!entry.fromServer && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-9 p-0 text-muted-foreground hover:text-danger"
                          onClick={() => handleRemove(entry.datasetId)}
                          aria-label={`Remove run ${entry.datasetId} from history`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
      </ul>
    </div>
  );
}
