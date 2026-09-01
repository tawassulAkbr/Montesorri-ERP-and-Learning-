import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import type { AiChartSpec } from '@/lib/ai';

// Renders a server-validated chart spec. Recharts primitives only — the spec
// carries data and colors, never markup.
interface AiChartProps {
  spec: AiChartSpec;
  height?: number;
  compact?: boolean;
}

const tooltipStyle = {
  borderRadius: 8,
  border: 'none',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  fontSize: 12,
};

export const AiChart: React.FC<AiChartProps> = ({ spec, height = 220, compact = false }) => {
  const tick = { fontSize: compact ? 9 : 10, fill: '#94A3B8' };
  const margin = { top: 5, right: 10, left: -18, bottom: 0 };

  if (spec.type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={spec.data}
            cx="50%"
            cy="50%"
            innerRadius={compact ? 40 : 55}
            outerRadius={compact ? 62 : 85}
            paddingAngle={3}
            dataKey="value"
          >
            {spec.data.map((entry, i) => (
              <Cell key={i} fill={String(entry.color ?? '#4F46E5')} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: compact ? 10 : 11 }}
            formatter={(value: string) => <span className="text-slate-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  const series = spec.series.filter(s => spec.data.some(row => typeof row[s.key] === 'number'));
  if (series.length === 0) {
    return <p className="text-xs text-slate-400 py-6 text-center">No data to chart yet.</p>;
  }

  if (spec.type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={spec.data} margin={margin}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`ai-grad-${i}-${s.color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey={spec.xKey} tick={tick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={tick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {series.map((s, i) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#ai-grad-${i}-${s.color.replace('#', '')})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (spec.type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={spec.data} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey={spec.xKey} tick={tick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={tick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {series.map(s => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: s.color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // bar
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={spec.data} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey={spec.xKey} tick={tick} tickLine={false} axisLine={false} interval={0} />
        <YAxis tick={tick} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {series.map(s => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
