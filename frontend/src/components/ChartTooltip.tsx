import { fmtNumber } from '../api';

interface TooltipItem {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipItem[];
  labelFormatter?: (label: string | number) => string;
}

export function ChartTooltip({ active, label, payload, labelFormatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="tt">
      {label != null && (
        <div className="tt__label">{labelFormatter ? labelFormatter(label) : label}</div>
      )}
      {payload.map((item, i) => (
        <div className="tt__row" key={i}>
          <span className="swatch" style={{ background: item.color, width: 10, height: 10 }} />
          <span style={{ textTransform: 'capitalize', color: 'var(--text-dim)' }}>
            {item.name}
          </span>
          <b>{typeof item.value === 'number' ? fmtNumber(item.value) : item.value}</b>
        </div>
      ))}
    </div>
  );
}
