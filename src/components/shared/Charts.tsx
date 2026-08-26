import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import type { AttendanceChartPoint, ScoreChartPoint, ClassPerformancePoint } from '@/types';

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
          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
      <Area type="monotone" dataKey="present" name="Present" stroke="#10B981" strokeWidth={2} fill="url(#presentGrad)" />
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
      <Bar dataKey="score" name="My Score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
      <Bar dataKey="classAvg" name="Class Avg" fill="#E0E7FF" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

// ─── Class Performance Pie Chart ──────────────────────────────────────────────
interface ClassPieChartProps {
  data: ClassPerformancePoint[];
  height?: number;
}
export const ClassPerformancePieChart: React.FC<ClassPieChartProps> = ({ data, height = 220 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={55}
        outerRadius={85}
        paddingAngle={3}
        dataKey="value"
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
        wrapperStyle={{ fontSize: 11 }}
        formatter={(value: string) => <span className="text-slate-600">{value}</span>}
      />
    </PieChart>
  </ResponsiveContainer>
);

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
      <Line type="monotone" dataKey="students" name="Students" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 4, fill: '#4F46E5' }} activeDot={{ r: 6 }} />
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
  value, label, color = '#4F46E5', size = 140,
}) => (
  <div className="relative" style={{ width: size, height: size }}>
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        innerRadius="70%"
        outerRadius="100%"
        data={[{ value, fill: color }]}
        startAngle={90}
        endAngle={-270}
      >
        <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#EEF2FF' }} />
      </RadialBarChart>
    </ResponsiveContainer>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-2xl font-bold text-slate-800">{value}%</span>
      {label && <span className="text-xs text-slate-400 mt-0.5">{label}</span>}
    </div>
  </div>
);
