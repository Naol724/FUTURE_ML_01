import type { Metrics } from "./api";

/** Lightweight localStorage store for past forecast runs (no database needed). */

export interface HistoryEntry {
  datasetId: string;
  filename: string;
  ranAt: string; // ISO timestamp
  rows: number;
  stores: number;
  metrics: Metrics;
}

const KEY = "forecastly.history.v1";
const MAX_ENTRIES = 25;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: HistoryEntry): void {
  const entries = loadHistory().filter((e) => e.datasetId !== entry.datasetId);
  entries.unshift(entry);
  window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function removeHistoryEntry(datasetId: string): void {
  const entries = loadHistory().filter((e) => e.datasetId !== datasetId);
  window.localStorage.setItem(KEY, JSON.stringify(entries));
}

export function clearHistory(): void {
  window.localStorage.removeItem(KEY);
}
