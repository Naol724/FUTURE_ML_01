import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import type { ScatterPoint } from '../api';
import { fmtCompact, fmtNumber } from '../api';
import { Card } from './Card';

const axisStyle = { fontFamily: 'Space Mono, monospace', fontSize: 11, fill: '#636980' };

interface DotPayload {
  payload: ScatterPoint;
}

function ScatterTip({ active, payload }: { active?: boolean; payload?: DotPayload[] }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="tt">
      <div className="tt__row">
        <span className="swatch swatch--actual" style={{ width: 10, height: 10 }} />
        <span style={{ color: 'var(--text-dim)' }}>Actual</span>
        <b>{fmtNumber(p.actual)}</b>
      </div>
      <div className="tt__row">
        <span className="swatch swatch--forecast" style={{ width: 10, height: 10 }} />
        <span style={{ color: 'var(--text-dim)' }}>Forecast</span>
        <b>{fmtNumber(p.forecast)}</b>
      </div>
    </div>
  );
}

export function AccuracyScatter({ data }: { data: ScatterPoint[] }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.actual, d.forecast)));
  return (
    <Card
      className="col-4"
      title="CALIBRATION"
      heading="Predicted vs Actual"
      right={<span className="tag tag--violet">y = x ideal</span>}
    >
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 6, right: 14, bottom: 6, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis
              type="number"
              dataKey="actual"
              name="Actual"
              domain={[0, max]}
              tickFormatter={(v) => fmtCompact(Number(v))}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="forecast"
              name="Forecast"
              domain={[0, max]}
              tickFormatter={(v) => fmtCompact(Number(v))}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <ZAxis range={[18, 18]} />
            <ReferenceLine
              segment={[{ x: 0, y: 0 }, { x: max, y: max }]}
              stroke="#c084fc"
              strokeDasharray="5 5"
              strokeOpacity={0.6}
              ifOverflow="extendDomain"
            />
            <Tooltip content={<ScatterTip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data} fill="#5eead4" fillOpacity={0.45} isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
