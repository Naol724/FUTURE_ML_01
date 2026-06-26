import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SeriesPoint } from '../api';
import { fmtCompact } from '../api';
import { Card } from './Card';
import { ChartTooltip } from './ChartTooltip';

const axisStyle = { fontFamily: 'Space Mono, monospace', fontSize: 11, fill: '#636980' };

function fmtDate(d: string | number): string {
  const date = new Date(String(d));
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ForecastTrend({ data }: { data: SeriesPoint[] }) {
  return (
    <Card
      className="col-8"
      title="TIME SERIES"
      heading="Forecast vs Actual Demand"
      right={
        <div className="legend">
          <span><i className="swatch swatch--actual" /> Actual</span>
          <span><i className="swatch swatch--forecast" /> Forecast</span>
        </div>
      }
    >
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5eead4" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#5eead4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              tickFormatter={(v) => fmtCompact(Number(v))}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              content={<ChartTooltip labelFormatter={fmtDate} />}
              cursor={{ stroke: 'rgba(255,255,255,0.18)' }}
            />
            <Area
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#5eead4"
              strokeWidth={2.4}
              fill="url(#actualFill)"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke="#c084fc"
              strokeWidth={2.4}
              strokeDasharray="6 5"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
