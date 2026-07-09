"use client";

import { ImageDown } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { PredictionRow } from "@/lib/api";
import { formatCompact, formatNumber } from "@/lib/utils";

const ALL_STORES = "all";

function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-card-hover">
      <p className="mb-1.5 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 tabular-nums">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{formatNumber(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function ForecastChart({ predictions }: { predictions: PredictionRow[] }) {
  const [store, setStore] = useState<string>(ALL_STORES);
  const chartRef = useRef<HTMLDivElement>(null);

  const stores = useMemo(
    () => Array.from(new Set(predictions.map((p) => p.store_nbr))).sort((a, b) => a - b),
    [predictions],
  );

  const data = useMemo(() => {
    const filtered =
      store === ALL_STORES ? predictions : predictions.filter((p) => p.store_nbr === Number(store));
    const byDate = new Map<string, { actual: number; predicted: number }>();
    for (const row of filtered) {
      const agg = byDate.get(row.date) ?? { actual: 0, predicted: 0 };
      agg.actual += row.actual;
      agg.predicted += row.predicted;
      byDate.set(row.date, agg);
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date,
        Actual: Number(v.actual.toFixed(2)),
        Predicted: Number(v.predicted.toFixed(2)),
      }));
  }, [predictions, store]);

  const exportPng = useCallback(() => {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const { width, height } = svg.getBoundingClientRect();
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));

    const blob = new Blob([new XMLSerializer().serializeToString(clone)], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const scale = 2; // export at 2x for crisp slides
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.download = `forecast_${store === ALL_STORES ? "all_stores" : `store_${store}`}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  }, [store]);

  return (
    <Card className="animate-fade-up">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Actual vs. predicted sales</CardTitle>
          <CardDescription>
            Daily totals over the evaluation window
            {store !== ALL_STORES ? ` — store ${store}` : " — all stores"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="store-filter" className="sr-only">
            Filter by store
          </label>
          <Select
            id="store-filter"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            className="w-40"
            aria-label="Filter chart by store number"
          >
            <option value={ALL_STORES}>All stores</option>
            {stores.map((s) => (
              <option key={s} value={s}>
                Store {s}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={exportPng}
            aria-label="Export chart as PNG image"
          >
            <ImageDown className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">PNG</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-[340px] w-full" role="img" aria-label="Line chart comparing actual and predicted daily sales">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-actual))" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="hsl(var(--chart-actual))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-predicted))" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="hsl(var(--chart-predicted))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                minTickGap={40}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatCompact(v)}
                width={56}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend
                iconType="circle"
                iconSize={9}
                formatter={(value: string) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="Actual"
                stroke="hsl(var(--chart-actual))"
                strokeWidth={2}
                fill="url(#fillActual)"
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={700}
              />
              <Area
                type="monotone"
                dataKey="Predicted"
                stroke="hsl(var(--chart-predicted))"
                strokeWidth={2}
                strokeDasharray="6 3"
                fill="url(#fillPredicted)"
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={700}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
