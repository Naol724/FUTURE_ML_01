import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface KpiCardProps {
  title: string;
  value: string;
  unit?: string;
  foot?: string;
  tag?: { text: string; cls: string };
  spark?: number[];
  sparkColor?: string;
}

export function KpiCard({ title, value, unit, foot, tag, spark, sparkColor = '#5eead4' }: KpiCardProps) {
  const sparkData = (spark ?? []).map((v, i) => ({ i, v }));
  const gradId = `spark-${title.replace(/\W/g, '')}`;
  return (
    <div className="card col-3 kpi">
      <div className="card__title">{title}</div>
      <div>
        <span className="kpi__value">{value}</span>{' '}
        {unit && <span className="kpi__unit">{unit}</span>}
      </div>
      {foot && (
        <div className="kpi__foot">
          {tag && <span className={`tag ${tag.cls}`}>{tag.text}</span>}
          <span>{foot}</span>
        </div>
      )}
      {sparkData.length > 1 && (
        <div className="kpi__spark" style={{ height: 56 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparkColor} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={sparkColor}
                strokeWidth={2}
                fill={`url(#${gradId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
