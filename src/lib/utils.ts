import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  AttendanceRecord, TestResult,
  AttendanceChartPoint, ScoreChartPoint, ClassPerformancePoint, PaymentMethod,
  InventoryCategory, MovementType, EmploymentStatus,
} from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  return `Rs ${amount.toLocaleString('en-PK')}`;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
};

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
  stationery: 'Stationery',
  cleaning: 'Cleaning',
  sports: 'Sports',
  furniture: 'Furniture',
  medical: 'Medical',
  other: 'Other',
};

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  stock_in: 'Stock In',
  stock_out: 'Stock Out',
  adjust: 'Adjust',
};

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  active: 'Active',
  on_leave: 'On Leave',
  resigned: 'Resigned',
};

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A+': return 'text-emerald-600 bg-emerald-50';
    case 'A': return 'text-emerald-600 bg-emerald-50';
    case 'B': return 'text-[#006B5D] bg-[#E6F4F1]';
    case 'C': return 'text-amber-600 bg-amber-50';
    case 'D': return 'text-orange-600 bg-orange-50';
    case 'F': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export function getScorePercent(obtained: number, max: number): number {
  return Math.round((obtained / max) * 100);
}

export function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function todayISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isWeekend(dateStr: string): boolean {
  const day = new Date(`${dateStr}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

export function dateInRange(dateStr: string, from: string, to: string): boolean {
  return dateStr >= from && dateStr <= to;
}

export function eachDateInclusive(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  while (cur <= end) {
    dates.push(todayISO(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function isNewEnrollment(createdAt: string, withinDays = 7): boolean {
  const created = new Date(`${createdAt}T12:00:00`).getTime();
  const now = Date.now();
  return now - created <= withinDays * 24 * 60 * 60 * 1000;
}

export function slugEmail(name: string, domain: string): string {
  const local = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return `${local}@${domain}`;
}

export const MONTESSORI_CLASSES = [
  'Early Childhood / Toddler (Ages 1.5 - 3)',
  'Primary Montessori / Playgroup & Nursery (Ages 3 - 6)',
  'Lower Elementary / Prep & Class 1 (Ages 6 - 9)',
  'Upper Elementary / Class 2 - 5 (Ages 9 - 12)',
] as const;

export const TEACHER_SUBJECTS = [
  'Practical Life',
  'Sensorial',
  'Language Arts',
  'Mathematics',
  'Cultural Studies / General Knowledge',
  'Islamiyat',
] as const;

export function avatarColors(name: string): string {
  const colors = [
    'bg-[#E6F4F1] text-[#006B5D]',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
    'bg-fuchsia-100 text-fuchsia-700',
    'bg-teal-100 text-teal-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─── Chart data builders (derived from live records) ─────────────────────────

export function buildAttendanceChartData(records: AttendanceRecord[], days = 30): AttendanceChartPoint[] {
  const points: AttendanceChartPoint[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = todayISO(d);
    const day = records.filter(r => r.date === dateStr);
    points.push({
      date: dateStr.slice(5),
      present: day.filter(r => r.status === 'present').length,
      absent: day.filter(r => r.status === 'absent').length,
      leave: day.filter(r => r.status === 'leave').length,
    });
  }
  return points;
}

function shortSubject(subject: string): string {
  return subject.split(' & ')[0].split(' (')[0];
}

export function buildScoreChartData(results: TestResult[], studentId?: string): ScoreChartPoint[] {
  const subjects = [...new Set(results.map(r => r.subject))];
  const pct = (r: TestResult) => (r.marksObtained / r.maxMarks) * 100;
  return subjects.map(subject => {
    const subjectResults = results.filter(r => r.subject === subject);
    const own = studentId ? subjectResults.filter(r => r.studentId === studentId) : subjectResults;
    const score = own.length ? Math.round(own.reduce((s, r) => s + pct(r), 0) / own.length) : 0;
    const classAvg = subjectResults.length
      ? Math.round(subjectResults.reduce((s, r) => s + pct(r), 0) / subjectResults.length)
      : 0;
    return { subject: shortSubject(subject), score, classAvg, maxMarks: 100 };
  });
}

export function buildClassPerformanceData(results: TestResult[]): ClassPerformancePoint[] {
  const buckets: { name: string; short: string; color: string; grades: string[] }[] = [
    { name: 'Excellent (A+/A)', short: 'Excellent', color: '#10B981', grades: ['A+', 'A'] },
    { name: 'Good (B)', short: 'Good', color: '#006B5D', grades: ['B'] },
    { name: 'Average (C)', short: 'Average', color: '#F59E0B', grades: ['C'] },
    { name: 'Below Avg (D/F)', short: 'Below Avg', color: '#EF4444', grades: ['D', 'F'] },
  ];
  return buckets.map(b => ({
    name: b.short,
    color: b.color,
    value: results.filter(r => b.grades.includes(r.grade)).length,
  }));
}
