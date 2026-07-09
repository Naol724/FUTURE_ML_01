"use client";

import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { PredictionRow } from "@/lib/api";
import { cn, formatNumber } from "@/lib/utils";

type SortKey = "date" | "store_nbr" | "actual" | "predicted" | "delta";
type SortDir = "asc" | "desc";

const PAGE_SIZES = [10, 25, 50];

interface TableRow extends PredictionRow {
  delta: number;
}

export function ForecastTable({
  predictions,
  truncated,
}: {
  predictions: PredictionRow[];
  truncated?: boolean;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const rows = useMemo<TableRow[]>(
    () => predictions.map((p) => ({ ...p, delta: p.predicted - p.actual })),
    [predictions],
  );

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const headers: Array<{ key: SortKey; label: string; numeric?: boolean }> = [
    { key: "date", label: "Date" },
    { key: "store_nbr", label: "Store", numeric: true },
    { key: "actual", label: "Actual", numeric: true },
    { key: "predicted", label: "Predicted", numeric: true },
    { key: "delta", label: "Delta", numeric: true },
  ];

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle>Forecast rows</CardTitle>
        <CardDescription>
          {formatNumber(sorted.length, 0)} evaluation rows
          {truncated ? " (large dataset — table shows the first 20,000 rows; the CSV download contains everything)" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="sticky-first-col w-full min-w-[560px] text-sm">
            <caption className="sr-only">
              Forecast results: date, store, actual sales, predicted sales, and delta
            </caption>
            <thead>
              <tr className="border-b border-border bg-surface text-left">
                {headers.map((h) => (
                  <th key={h.key} scope="col" className={cn("p-0", h.numeric && "text-right")}>
                    <button
                      type="button"
                      onClick={() => toggleSort(h.key)}
                      aria-label={`Sort by ${h.label}`}
                      aria-sort={
                        sortKey === h.key ? (sortDir === "asc" ? "ascending" : "descending") : undefined
                      }
                      className={cn(
                        "flex w-full items-center gap-1 px-4 py-3 font-medium text-muted-foreground transition-colors hover:text-foreground",
                        h.numeric && "justify-end",
                      )}
                    >
                      {h.label}
                      <ArrowUpDown
                        className={cn("size-3.5", sortKey === h.key ? "text-accent" : "opacity-40")}
                        aria-hidden="true"
                      />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr
                  key={`${row.date}-${row.store_nbr}-${i}`}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 font-medium">{row.date}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{row.store_nbr}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{formatNumber(row.actual)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {formatNumber(row.predicted)}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right tabular-nums",
                      row.delta > 0 ? "text-success" : row.delta < 0 ? "text-danger" : "",
                    )}
                  >
                    {row.delta > 0 ? "+" : ""}
                    {formatNumber(row.delta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <label htmlFor="page-size">Rows per page</label>
            <Select
              id="page-size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="w-20"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <span className="text-sm tabular-nums text-muted-foreground">
              Page {currentPage + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={currentPage >= pageCount - 1}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
