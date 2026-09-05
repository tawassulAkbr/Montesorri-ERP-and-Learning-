import { prisma } from '../db';

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function isWeekend(dateStr: string): boolean {
  const day = new Date(`${dateStr}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

export function eachWeekday(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10);
    if (!isWeekend(iso)) dates.push(iso);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export type DerivedStatus = 'present' | 'absent' | 'leave' | null;

/** Derive a teacher's status for a date: present record > accepted leave > absent (weekdays) > null (weekend). */
export async function deriveTeacherStatus(teacherId: string, date: string): Promise<DerivedStatus> {
  if (isWeekend(date)) return null;
  const record = await prisma.teacherAttendanceRecord.findUnique({
    where: { teacherId_date: { teacherId, date } },
  });
  if (record?.status === 'PRESENT') return 'present';
  if (record?.status === 'LEAVE') return 'leave';
  const acceptedLeave = await prisma.leaveRequest.findFirst({
    where: {
      kind: 'TEACHER',
      teacherId,
      status: 'ACCEPTED',
      fromDate: { lte: date },
      toDate: { gte: date },
    },
    select: { id: true },
  });
  if (acceptedLeave) return 'leave';
  return 'absent';
}
