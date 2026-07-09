"use client";

import { HelpCircle, Ruler, Sigma, Target } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import type { Metrics } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

const metricDefs = [
  {
    key: "mae" as const,
    label: "MAE",
    name: "Mean Absolute Error",
    icon: Ruler,
    decimals: 2,
    explain: (v: number) =>
      `On average, predictions are off by ${formatNumber(v, 1)} sales units per row. Lower is better.`,
  },
  {
    key: "rmse" as const,
    label: "RMSE",
    name: "Root Mean Squared Error",
    icon: Sigma,
    decimals: 2,
    explain: () =>
      "Like MAE, but penalizes large misses more heavily. Useful for spotting occasional big errors. Lower is better.",
  },
  {
    key: "r2" as const,
    label: "R²",
    name: "Coefficient of Determination",
    icon: Target,
    decimals: 4,
    explain: (v: number) =>
      `The model explains ${formatNumber(v * 100, 1)}% of the variation in sales. 1.0 would be a perfect fit.`,
  },
];

export function MetricCards({ metrics, loading }: { metrics?: Metrics; loading?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {metricDefs.map((def, i) => (
        <Card
          key={def.key}
          className="animate-fade-up hover:shadow-card-hover"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <def.icon className="size-4 text-accent" aria-hidden="true" />
                {def.label}
              </span>
              {metrics && (
                <Tooltip content={def.explain(metrics[def.key])}>
                  <HelpCircle
                    className="size-4 text-muted-foreground/60 hover:text-accent"
                    aria-label={`Explanation of ${def.name}`}
                  />
                </Tooltip>
              )}
            </div>
            {loading || !metrics ? (
              <Skeleton className="h-9 w-28" />
            ) : (
              <p className="font-display text-3xl font-bold tabular-nums">
                <CountUp value={metrics[def.key]} decimals={def.decimals} />
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{def.name}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
