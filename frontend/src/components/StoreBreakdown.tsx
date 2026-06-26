import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { StoreItem } from '../api';
import { fmtCompact } from '../api';
import { Card } from './Card';
import { ChartTooltip } from './ChartTooltip';

const axisStyle = { fontFamily: 'Space Mono, monospace', fontSize: 10, fill: '#636980' };

export function StoreBreakdown({ data }: { data: StoreItem[] }) {
  const top = data.slice(0, 12).map((d) => ({ ...d, label: `#${d.store}` }));
  return (
    <Card
      className="col-5"
      title="STORE NETWORK"
      heading="Top Stores by Volume"
      right={<span className="tag tag--cyan">total sales</span>}
    >
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <BarChart data={top} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <defs>
              <linearGradient id="storeBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#5eead4" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tickFormatter={(v) => fmtCompact(Number(v))}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="actual" name="Actual" fill="url(#storeBar)" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
