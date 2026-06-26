import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { FamilyItem } from '../api';
import { fmtCompact } from '../api';
import { Card } from './Card';
import { ChartTooltip } from './ChartTooltip';

const axisStyle = { fontFamily: 'Space Mono, monospace', fontSize: 10, fill: '#636980' };

function pretty(name: string): string {
  return name.length > 14 ? `${name.slice(0, 13)}…` : name;
}

export function FamilyBreakdown({ data }: { data: FamilyItem[] }) {
  const top = data.slice(0, 10);
  return (
    <Card
      className="col-7"
      title="PRODUCT FAMILIES"
      heading="Top Families · Actual vs Forecast"
      right={
        <div className="legend">
          <span><i className="swatch swatch--actual" /> Actual</span>
          <span><i className="swatch swatch--forecast" /> Forecast</span>
        </div>
      }
    >
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <BarChart
            data={top}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
            barGap={2}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => fmtCompact(Number(v))}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="family"
              tickFormatter={pretty}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={104}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="actual" name="Actual" fill="#5eead4" radius={[0, 4, 4, 0]} />
            <Bar dataKey="forecast" name="Forecast" fill="#c084fc" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
