import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import type { AttendanceChartPoint, ScoreChartPoint, ClassPerformancePoint, IncomeMonthPoint } from '@/types';

// ─── Attendance Area Chart ────────────────────────────────────────────────────
interface AttendanceAreaChartProps {
  data: AttendanceChartPoint[];
  height?: number;
}
export const AttendanceAreaChart: React.FC<AttendanceAreaChartProps> = ({ data, height = 200 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#006B5D" stopOpacity={0.22} />
          <stop offset="95%" stopColor="#006B5D" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
          <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
      <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
      <Tooltip
        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
      />
      <Area type="monotone" dataKey="present" name="Present" stroke="#006B5D" strokeWidth={2.5} fill="url(#presentGrad)" />
      <Area type="monotone" dataKey="absent" name="Absent" stroke="#EF4444" strokeWidth={2} fill="url(#absentGrad)" />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── Test Score Bar Chart ─────────────────────────────────────────────────────
interface TestScoreBarChartProps {
  data: ScoreChartPoint[];
  height?: number;
}
export const TestScoreBarChart: React.FC<TestScoreBarChartProps> = ({ data, height = 220 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
      <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
      <Tooltip
        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
        formatter={(val: any, name: any) => [`${val}%`, name]}
      />
      <Legend wrapperStyle={{ fontSize: 11 }} />
      <Bar dataKey="score" name="My Score" fill="#006B5D" radius={[8, 8, 0, 0]} />
      <Bar dataKey="classAvg" name="Class Avg" fill="#D9EFEB" radius={[8, 8, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

// ─── Monthly Income Bar Chart ─────────────────────────────────────────────────
interface IncomeBarChartProps {
  data: IncomeMonthPoint[];
  height?: number;
}
export const IncomeBarChart: React.FC<IncomeBarChartProps> = ({ data, height = 240 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
      <YAxis
        tick={{ fontSize: 10, fill: '#94A3B8' }}
        tickLine={false}
        axisLine={false}
        tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
      />
      <Tooltip
        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
        formatter={(val: any) => [`Rs ${Number(val).toLocaleString('en-PK')}`, 'Collected']}
      />
      <Bar dataKey="amount" name="Collected" fill="#006B5D" radius={[8, 8, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

// ─── Class Performance Pie Chart ──────────────────────────────────────────────
interface ClassPieChartProps {
  data: ClassPerformancePoint[];
  height?: number;
}
export const ClassPerformancePieChart: React.FC<ClassPieChartProps> = ({ data, height = 220 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          label={({ value, name }: any) => {
            if (!value || total === 0) return '';
            const pct = Math.round((value / total) * 100);
            if (pct < 6) return '';
            return `${name} ${pct}%`;
          }}
          labelLine={false}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
          formatter={(val: any, name: any) => [`${val} students`, name]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
          formatter={(value: string) => <span className="text-[#344054]">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ─── Fee Collection Pie Chart (Donut) ─────────────────────────────────────────
interface FeeCollectionChartProps {
  collected: number;
  outstanding: number;
  height?: number;
}
export const FeeCollectionPieChart: React.FC<FeeCollectionChartProps> = ({ collected, outstanding, height = 140 }) => {
  const data = [
    { name: 'Collected', value: collected, color: '#10B981' },
    { name: 'Outstanding', value: outstanding, color: '#EF4444' },
  ];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={65}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, bottom: -10 }}
          formatter={(value: string) => <span className="text-[#344054]">{value}</span>}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
          formatter={(val: any, name: any) => [`${val} students`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ─── Enrollment Line Chart ────────────────────────────────────────────────────
interface EnrollmentLineChartProps {
  data: { month: string; students: number }[];
  height?: number;
}
export const EnrollmentLineChart: React.FC<EnrollmentLineChartProps> = ({ data, height = 220 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
      <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
      <Tooltip
        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
      />
      <Line type="monotone" dataKey="students" name="Students" stroke="#006B5D" strokeWidth={2.5} dot={{ r: 4, fill: '#006B5D' }} activeDot={{ r: 6 }} />
    </LineChart>
  </ResponsiveContainer>
);

// ─── Radial Progress ──────────────────────────────────────────────────────────
interface RadialProgressProps {
  value: number;
  label?: string;
  color?: string;
  size?: number;
}
export const RadialProgress: React.FC<RadialProgressProps> = ({
  value, label, color = '#006B5D', size = 160,
}) => (
  <div className="relative mx-auto" style={{ width: size, height: size }}>
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        innerRadius="75%"
        outerRadius="100%"
        data={[{ value, fill: color }]}
        startAngle={90}
        endAngle={-270}
      >
        <RadialBar dataKey="value" cornerRadius={20} background={{ fill: '#E6F4F1' }} />
      </RadialBarChart>
    </ResponsiveContainer>
    <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
      <span className="text-4xl font-extrabold tracking-tight text-[#101828]">{value}%</span>
      {label && <span className="text-xs font-semibold text-[#667085] mt-1 max-w-[80%] text-center leading-tight">{label}</span>}
    </div>
  </div>
);
