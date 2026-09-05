import { prisma } from '../../db';
import { notFound } from '../../utils/errors';
import type { AuthUser } from '../../middleware/auth';
import type { AiChartSpec } from './schema';
import { AI_COLORS, areaChart, barChart, pieChart } from './schema';

// Role-scoped analytics for the AI layer. Every query here applies the exact
// same scoping predicates as the regular routes (teacher.classes for teachers,
// Parent.children for parents), so the assistant can never see data the
// normal application hides.

export interface AiScope {
  role: AuthUser['role'];
  teacherClasses: string[];
  /** Every student this user is authorized to see. */
  studentIds: string[];
}

export interface StudentLite {
  id: string;
  name: string;
  class: string;
  rollNo: string;
  feeDue: boolean;
  feeAmount: number;
}

export async function buildScope(user: AuthUser): Promise<AiScope> {
  if (user.role === 'admin') {
    const students = await prisma.student.findMany({
      where: { schoolId: user.schoolId },
      select: { id: true },
    });
    return { role: 'admin', teacherClasses: [], studentIds: students.map(s => s.id) };
  }
  if (user.role === 'teacher') {
    const teacher = await prisma.teacher.findUnique({ where: { id: user.id } });
    if (!teacher) throw notFound('Teacher record not found');
    const students = await prisma.student.findMany({
      where: { schoolId: user.schoolId, class: { in: teacher.classes } },
      select: { id: true },
    });
    return { role: 'teacher', teacherClasses: teacher.classes, studentIds: students.map(s => s.id) };
  }
  if (user.role === 'parent') {
    const parent = await prisma.parent.findUnique({
      where: { id: user.id },
      include: { children: { select: { id: true } } },
    });
    if (!parent) throw notFound('Parent record not found');
    return { role: 'parent', teacherClasses: [], studentIds: parent.children.map(c => c.id) };
  }
  const student = await prisma.student.findUnique({ where: { id: user.id }, select: { id: true } });
  if (!student) throw notFound('Student record not found');
  return { role: 'student', teacherClasses: [], studentIds: [student.id] };
}

export async function listScopedStudents(user: AuthUser): Promise<StudentLite[]> {
  const includeFeeAmount = user.role === 'admin';
  const scope = await buildScope(user);
  const students = await prisma.student.findMany({
    where: { id: { in: scope.studentIds } },
    orderBy: [{ class: 'asc' }, { rollNo: 'asc' }],
  });
  return students.map(s => ({
    id: s.id,
    name: s.name,
    class: s.class,
    rollNo: s.rollNo,
    feeDue: s.feeDue,
    feeAmount: includeFeeAmount ? s.feeAmount : 0,
  }));
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export function attendanceRate(records: { status: string }[]): number | null {
  const counted = records.filter(r => r.status !== 'HOLIDAY');
  if (counted.length === 0) return null;
  const present = counted.filter(r => r.status === 'PRESENT').length;
  return Math.round((present / counted.length) * 100);
}

export async function overallAttendanceRate(studentIds: string[]): Promise<number | null> {
  if (studentIds.length === 0) return null;
  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: { in: studentIds } },
    select: { status: true },
  });
  return attendanceRate(records);
}

/** Per-date present/absent/leave counts across the given students. */
export async function dailyAttendanceSeries(studentIds: string[]) {
  if (studentIds.length === 0) return [];
  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: { in: studentIds } },
    orderBy: { date: 'asc' },
  });
  const byDate = new Map<string, { present: number; absent: number; leave: number }>();
  for (const r of records) {
    const bucket = byDate.get(r.date) ?? { present: 0, absent: 0, leave: 0 };
    if (r.status === 'PRESENT') bucket.present += 1;
    else if (r.status === 'ABSENT') bucket.absent += 1;
    else if (r.status === 'LEAVE') bucket.leave += 1;
    byDate.set(r.date, bucket);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, counts]) => ({ label: shortDate(date), ...counts }));
}

export function attendanceAreaChart(title: string, data: { label: string; present: number; absent: number; leave: number }[]): AiChartSpec {
  return areaChart(title, 'label', data, [
    { key: 'present', name: 'Present', color: AI_COLORS.green },
    { key: 'absent', name: 'Absent', color: AI_COLORS.red },
    { key: 'leave', name: 'Leave', color: AI_COLORS.amber },
  ]);
}

export interface StudentAttendance {
  rate: number;
  days: number;
}

export async function perStudentAttendanceRates(studentIds: string[]): Promise<Map<string, StudentAttendance>> {
  const out = new Map<string, StudentAttendance>();
  if (studentIds.length === 0) return out;
  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: { in: studentIds } },
    select: { studentId: true, status: true },
  });
  const grouped = new Map<string, { status: string }[]>();
  for (const r of records) {
    const list = grouped.get(r.studentId) ?? [];
    list.push(r);
    grouped.set(r.studentId, list);
  }
  for (const [id, recs] of grouped) {
    const rate = attendanceRate(recs);
    if (rate !== null) out.set(id, { rate, days: recs.filter(r => r.status !== 'HOLIDAY').length });
  }
  return out;
}

// ─── Academic performance ─────────────────────────────────────────────────────

export interface SubjectAverage {
  subject: string;
  avgPct: number;
  results: number;
}

export async function subjectAverages(studentIds: string[]): Promise<SubjectAverage[]> {
  if (studentIds.length === 0) return [];
  const results = await prisma.testResult.findMany({
    where: { studentId: { in: studentIds } },
    select: { subject: true, marksObtained: true, maxMarks: true },
  });
  const bySubject = new Map<string, { total: number; count: number }>();
  for (const r of results) {
    if (r.maxMarks <= 0) continue;
    const bucket = bySubject.get(r.subject) ?? { total: 0, count: 0 };
    bucket.total += (r.marksObtained / r.maxMarks) * 100;
    bucket.count += 1;
    bySubject.set(r.subject, bucket);
  }
  return [...bySubject.entries()]
    .map(([subject, { total, count }]) => ({ subject, avgPct: Math.round(total / count), results: count }))
    .sort((a, b) => b.avgPct - a.avgPct);
}

export interface StudentSubjectDetail extends SubjectAverage {
  grade: string | null;
  milestoneStatus: string | null;
}

export async function studentSubjectDetails(studentId: string): Promise<StudentSubjectDetail[]> {
  const results = await prisma.testResult.findMany({
    where: { studentId },
    orderBy: { date: 'desc' },
  });
  const bySubject = new Map<string, StudentSubjectDetail & { total: number; count: number }>();
  for (const r of results) {
    if (r.maxMarks <= 0) continue;
    const existing = bySubject.get(r.subject);
    if (existing) {
      existing.total += (r.marksObtained / r.maxMarks) * 100;
      existing.count += 1;
    } else {
      bySubject.set(r.subject, {
        subject: r.subject,
        avgPct: 0,
        results: 1,
        grade: r.grade,
        milestoneStatus: r.milestoneStatus,
        total: (r.marksObtained / r.maxMarks) * 100,
        count: 1,
      });
    }
  }
  return [...bySubject.values()].map(d => ({
    subject: d.subject,
    avgPct: Math.round(d.total / d.count),
    results: d.count,
    grade: d.grade,
    milestoneStatus: d.milestoneStatus,
  }));
}

export interface StrugglingEntry {
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  avgPct: number;
  milestoneStatus: string | null;
}

const STRUGGLE_THRESHOLD = 65;

/** Students with a subject average below 65% or a 'Developing' milestone. */
export async function strugglingStudents(studentIds: string[]): Promise<StrugglingEntry[]> {
  if (studentIds.length === 0) return [];
  const [students, results] = await Promise.all([
    prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, name: true, class: true },
    }),
    prisma.testResult.findMany({ where: { studentId: { in: studentIds } } }),
  ]);
  const studentById = new Map(students.map(s => [s.id, s]));

  interface Acc { total: number; count: number; developing: boolean }
  const perStudentSubject = new Map<string, Map<string, Acc>>();
  for (const r of results) {
    if (r.maxMarks <= 0) continue;
    const subjMap = perStudentSubject.get(r.studentId) ?? new Map<string, Acc>();
    const acc = subjMap.get(r.subject) ?? { total: 0, count: 0, developing: false };
    acc.total += (r.marksObtained / r.maxMarks) * 100;
    acc.count += 1;
    if (r.milestoneStatus === 'Developing') acc.developing = true;
    subjMap.set(r.subject, acc);
    perStudentSubject.set(r.studentId, subjMap);
  }

  const flagged: StrugglingEntry[] = [];
  for (const [studentId, subjMap] of perStudentSubject) {
    const student = studentById.get(studentId);
    if (!student) continue;
    for (const [subject, acc] of subjMap) {
      const avgPct = Math.round(acc.total / acc.count);
      if (avgPct < STRUGGLE_THRESHOLD || acc.developing) {
        flagged.push({
          studentId,
          studentName: student.name,
          class: student.class,
          subject,
          avgPct,
          milestoneStatus: acc.developing ? 'Developing' : null,
        });
      }
    }
  }
  return flagged.sort((a, b) => a.avgPct - b.avgPct);
}

export function strugglingBarChart(entries: StrugglingEntry[]): AiChartSpec {
  return barChart(
    'Students needing support',
    'name',
    entries.map(e => ({ name: e.studentName, score: e.avgPct })),
    [{ key: 'score', name: 'Avg % (flagged subject)', color: AI_COLORS.amber }],
  );
}

// ─── Fees (amounts only ever exposed to admins) ───────────────────────────────

export interface FeeSnapshot {
  totalBilled: number;
  totalDue: number;
  totalCollected: number;
  dueStudents: StudentLite[];
  studentCount: number;
}

export async function feeSnapshot(schoolId: string): Promise<FeeSnapshot> {
  const students = await prisma.student.findMany({
    where: { schoolId },
    select: { id: true, name: true, class: true, rollNo: true, feeAmount: true, feeDue: true },
    orderBy: [{ class: 'asc' }, { rollNo: 'asc' }],
  });
  const totalBilled = students.reduce((sum, s) => sum + s.feeAmount, 0);
  const due = students.filter(s => s.feeDue);
  const totalDue = due.reduce((sum, s) => sum + s.feeAmount, 0);
  return {
    totalBilled,
    totalDue,
    totalCollected: totalBilled - totalDue,
    dueStudents: due.map(s => ({ ...s })),
    studentCount: students.length,
  };
}

export function feePieChart(snapshot: FeeSnapshot): AiChartSpec {
  return pieChart('Fee collection status', [
    { name: 'Collected', value: snapshot.totalCollected, color: AI_COLORS.green },
    { name: 'Outstanding', value: snapshot.totalDue, color: AI_COLORS.red },
  ]);
}

// ─── Class-level comparisons ──────────────────────────────────────────────────

export interface ClassSummary {
  className: string;
  students: number;
  attendanceRate: number | null;
  avgScore: number | null;
}

export async function classSummaries(schoolId: string, onlyClasses?: string[]): Promise<ClassSummary[]> {
  const students = await prisma.student.findMany({
    where: onlyClasses && onlyClasses.length > 0
      ? { schoolId, class: { in: onlyClasses } }
      : { schoolId },
    select: { id: true, class: true },
  });
  const classes = [...new Set(students.map(s => s.class))].sort();
  const summaries: ClassSummary[] = [];
  for (const className of classes) {
    const ids = students.filter(s => s.class === className).map(s => s.id);
    const [rate, subjects] = await Promise.all([
      overallAttendanceRate(ids),
      subjectAverages(ids),
    ]);
    const avgScore = subjects.length > 0
      ? Math.round(subjects.reduce((sum, s) => sum + s.avgPct, 0) / subjects.length)
      : null;
    summaries.push({ className, students: ids.length, attendanceRate: rate, avgScore });
  }
  return summaries;
}

export function classComparisonChart(rows: ClassSummary[]): AiChartSpec {
  return barChart(
    'Class comparison',
    'name',
    rows.map(r => ({
      name: r.className.replace(' Montessori', '').replace(/[()]/g, ''),
      attendance: r.attendanceRate ?? 0,
      score: r.avgScore ?? 0,
    })),
    [
      { key: 'attendance', name: 'Attendance %', color: AI_COLORS.indigo },
      { key: 'score', name: 'Avg Score %', color: AI_COLORS.violet },
    ],
  );
}

export async function enrollmentPie(schoolId: string): Promise<AiChartSpec> {
  const grouped = await prisma.student.groupBy({
    by: ['class'],
    where: { schoolId },
    _count: { _all: true },
  });
  const palette = [AI_COLORS.indigo, AI_COLORS.amber, AI_COLORS.green, AI_COLORS.pink, AI_COLORS.cyan];
  return pieChart(
    'Enrollment by class',
    grouped
      .sort((a, b) => b._count._all - a._count._all)
      .map((g, i) => ({ name: g.class, value: g._count._all, color: palette[i % palette.length] })),
  );
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  badgeCount: number;
  lastActivityDate: string | null;
  sessions: { date: string; xpEarned: number }[];
}

export async function streakSummary(studentId: string): Promise<StreakSummary> {
  const [streak, badgeCount, sessions] = await Promise.all([
    prisma.studentStreak.findUnique({ where: { studentId } }),
    prisma.studentBadge.count({ where: { studentId } }),
    prisma.learningSession.findMany({
      where: { studentId },
      orderBy: { date: 'asc' },
      take: 14,
      select: { date: true, xpEarned: true },
    }),
  ]);
  const totalXp = streak?.totalXp ?? 0;
  return {
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    totalXp,
    level: Math.floor(totalXp / 100) + 1,
    badgeCount,
    lastActivityDate: streak?.lastActivityDate ?? null,
    sessions: sessions.map(s => ({ date: s.date, xpEarned: s.xpEarned })),
  };
}

// ─── Small helpers ────────────────────────────────────────────────────────────

export function shortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const formatRs = (amount: number) => `Rs ${amount.toLocaleString('en-US')}`;

export const groupLabelFor = (role: AuthUser['role']): string => {
  if (role === 'teacher') return 'your classes';
  if (role === 'parent') return 'your children';
  if (role === 'admin') return 'the school';
  return 'your record';
};
