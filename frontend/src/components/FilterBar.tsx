import type { Filters, Selection } from '../api';

interface FilterBarProps {
  filters: Filters;
  selection: Selection;
  onChange: (next: Selection) => void;
}

export function FilterBar({ filters, selection, onChange }: FilterBarProps) {
  const hasFilter = selection.store != null || selection.family != null;
  return (
    <div className="filters">
      <div className="field">
        <label htmlFor="store">Store</label>
        <select
          id="store"
          value={selection.store ?? ''}
          onChange={(e) =>
            onChange({ ...selection, store: e.target.value ? Number(e.target.value) : null })
          }
        >
          <option value="">All stores ({filters.stores.length})</option>
          {filters.stores.map((s) => (
            <option key={s} value={s}>
              Store #{s}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="family">Product family</label>
        <select
          id="family"
          value={selection.family ?? ''}
          onChange={(e) =>
            onChange({ ...selection, family: e.target.value || null })
          }
        >
          <option value="">All families ({filters.families.length})</option>
          {filters.families.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {hasFilter && (
        <button className="btn-reset" onClick={() => onChange({ store: null, family: null })}>
          Reset ✕
        </button>
      )}
    </div>
  );
}
