export interface Metrics {
  mae: number;
  rmse: number;
  r2: number;
  wape: number;
  accuracy: number;
  bias: number;
}

export interface Overview {
  metrics: Metrics;
  totals: {
    actual: number;
    forecast: number;
    rows: number;
    stores: number;
    families: number;
    days: number;
    avg_daily_actual: number;
  };
  range: { start: string | null; end: string | null };
}

export interface SeriesPoint {
  date: string;
  actual: number;
  forecast: number;
}

export interface FamilyItem {
  family: string;
  actual: number;
  forecast: number;
  mae: number;
}

export interface StoreItem {
  store: number;
  actual: number;
  forecast: number;
}

export interface ScatterPoint {
  actual: number;
  forecast: number;
}

export interface Filters {
  stores: number[];
  families: string[];
  date_start: string;
  date_end: string;
}

export interface Selection {
  store: number | null;
  family: string | null;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

function qs(sel: Selection, extra: Record<string, string | number> = {}): string {
  const params = new URLSearchParams();
  if (sel.store != null) params.set('store', String(sel.store));
  if (sel.family != null) params.set('family', sel.family);
  for (const [k, v] of Object.entries(extra)) params.set(k, String(v));
  const s = params.toString();
  return s ? `?${s}` : '';
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${path}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  filters: () => get<Filters>('/filters'),
  overview: (sel: Selection) => get<Overview>(`/overview${qs(sel)}`),
  timeseries: (sel: Selection) => get<{ points: SeriesPoint[] }>(`/timeseries${qs(sel)}`),
  families: (sel: Selection) =>
    get<{ items: FamilyItem[] }>(`/families${qs({ store: sel.store, family: null }, )}`),
  stores: (sel: Selection) =>
    get<{ items: StoreItem[] }>(`/stores${qs({ store: null, family: sel.family })}`),
  scatter: (sel: Selection) => get<{ points: ScatterPoint[] }>(`/scatter${qs(sel)}`),
};

export function fmtNumber(n: number, digits = 0): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtCompact(n: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}
