import { useEffect, useMemo, useState } from 'react';
import {
  api,
  fmtCompact,
  fmtNumber,
  type FamilyItem,
  type Filters,
  type Overview,
  type ScatterPoint,
  type Selection,
  type SeriesPoint,
  type StoreItem,
} from './api';
import { AccuracyScatter } from './components/AccuracyScatter';
import { FamilyBreakdown } from './components/FamilyBreakdown';
import { FilterBar } from './components/FilterBar';
import { ForecastTrend } from './components/ForecastTrend';
import { KpiCard } from './components/KpiCard';
import { StoreBreakdown } from './components/StoreBreakdown';

interface DashboardData {
  overview: Overview;
  series: SeriesPoint[];
  families: FamilyItem[];
  stores: StoreItem[];
  scatter: ScatterPoint[];
}

function accuracyTag(acc: number): { text: string; cls: string } {
  if (acc >= 70) return { text: 'STRONG', cls: 'tag--good' };
  if (acc >= 45) return { text: 'FAIR', cls: 'tag--warn' };
  return { text: 'WEAK', cls: 'tag--bad' };
}

export default function App() {
  const [filters, setFilters] = useState<Filters | null>(null);
  const [selection, setSelection] = useState<Selection>({ store: null, family: null });
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.filters().then(setFilters).catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!filters) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [overview, ts, fam, st, sc] = await Promise.all([
          api.overview(selection),
          api.timeseries(selection),
          api.families(selection),
          api.stores(selection),
          api.scatter(selection),
        ]);
        if (cancelled) return;
        setData({
          overview,
          series: ts.points,
          families: fam.items,
          stores: st.items,
          scatter: sc.points,
        });
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [filters, selection]);

  const sparks = useMemo(() => {
    const s = data?.series ?? [];
    return {
      actual: s.map((p) => p.actual),
      forecast: s.map((p) => p.forecast),
    };
  }, [data]);

  if (error) {
    return (
      <div className="center-screen">
        <div className="error-box">
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 10 }}>
            Can&apos;t reach the forecast engine
          </h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: 12 }}>
            The dashboard couldn&apos;t load data from the API. Make sure the backend is running
            and the pipeline output exists.
          </p>
          <code>{error}</code>
        </div>
      </div>
    );
  }

  if (!filters || !data) {
    return (
      <div className="center-screen">
        <div>
          <div className="spinner" />
          <p style={{ color: 'var(--text-dim)', marginTop: 16, fontFamily: 'var(--font-mono)' }}>
            Loading forecast intelligence…
          </p>
        </div>
      </div>
    );
  }

  const { overview } = data;
  const m = overview.metrics;
  const t = overview.totals;
  const accTag = accuracyTag(m.accuracy);
  const scope =
    selection.store || selection.family
      ? [selection.family, selection.store ? `Store #${selection.store}` : null]
          .filter(Boolean)
          .join(' · ')
      : 'All stores & families';

  return (
    <div className="app" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
      <header className="topbar">
        <div className="brand">
          <div className="brand__mark">
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
              <polyline
                points="8,46 24,30 34,38 56,14"
                stroke="url(#bg)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#5eead4" />
                  <stop offset="1" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div className="brand__name">
              Forecast<span>r</span>
            </div>
            <div className="brand__sub">Sales · Demand · Intelligence</div>
          </div>
        </div>
        <div className="pill">
          <span className="dot" /> Random Forest engine · {t.rows.toLocaleString()} predictions
        </div>
      </header>

      <section className="hero">
        <h1>
          Turn historical sales into <em>confident demand forecasts.</em>
        </h1>
        <p>
          A production ML pipeline trained on Kaggle store-sales data, surfaced as a live analytics
          cockpit. Validation window {overview.range.start} → {overview.range.end} across{' '}
          {t.stores} stores and {t.families} product families.
        </p>
      </section>

      <FilterBar filters={filters} selection={selection} onChange={setSelection} />

      <div className="bento">
        <KpiCard
          title="Forecast accuracy"
          value={`${m.accuracy.toFixed(1)}`}
          unit="%"
          foot={`WAPE ${m.wape.toFixed(1)}%`}
          tag={accTag}
        />
        <KpiCard
          title="Total actual sales"
          value={fmtCompact(t.actual)}
          unit="units"
          foot={`${scope}`}
          spark={sparks.actual}
          sparkColor="#5eead4"
        />
        <KpiCard
          title="Total forecast"
          value={fmtCompact(t.forecast)}
          unit="units"
          foot={`Bias ${m.bias >= 0 ? '+' : ''}${fmtNumber(m.bias)} / row`}
          tag={{
            text: m.bias >= 0 ? 'OVER' : 'UNDER',
            cls: Math.abs(m.bias) < 50 ? 'tag--good' : 'tag--warn',
          }}
          spark={sparks.forecast}
          sparkColor="#c084fc"
        />
        <KpiCard
          title="R² goodness of fit"
          value={m.r2.toFixed(3)}
          foot={`MAE ${fmtNumber(m.mae)} · RMSE ${fmtNumber(m.rmse)}`}
          tag={accuracyTag(Math.max(0, m.r2) * 100)}
        />

        <ForecastTrend data={data.series} />
        <AccuracyScatter data={data.scatter} />

        <FamilyBreakdown data={data.families} />
        <StoreBreakdown data={data.stores} />
      </div>

      <footer className="footer">
        <span>
          FUTURE_ML_01 · Sales &amp; Demand Forecasting · Random Forest Regressor
        </span>
        <span>
          Built by{' '}
          <a href="https://github.com/Naol724" target="_blank" rel="noreferrer">
            Naol Gonfa
          </a>{' '}
          · Future Interns ML Task 01
        </span>
      </footer>
    </div>
  );
}
