import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { schoolOf } from '../utils/tenant';

export const teacherReportRouter = Router();
teacherReportRouter.use(requireAuth, requireRole('admin'));

function rangeStart(range: 'daily' | 'weekly' | 'monthly'): string {
  const d = new Date();
  if (range === 'weekly') d.setDate(d.getDate() - 6);
  if (range === 'monthly') d.setDate(d.getDate() - 29);
  return d.toISOString().slice(0, 10);
}

teacherReportRouter.get('/', async (req, res) => {
  const schoolId = schoolOf(req);
  const range = z.enum(['daily', 'weekly', 'monthly']).default('weekly').parse(req.query.range ?? 'weekly');
  const from = rangeStart(range);
  const to = new Date().toISOString().slice(0, 10);

  const teachers = await prisma.teacher.findMany({ where: { schoolId }, orderBy: { createdAt: 'asc' } });

  const [attendance, lessons, tests, remarks, leaves] = await Promise.all([
    prisma.teacherAttendanceRecord.findMany({ where: { teacher: { schoolId }, date: { gte: from, lte: to } } }),
    prisma.lesson.findMany({ where: { schoolId, uploadedAt: { gte: from, lte: to } } }),
    prisma.test.findMany({ where: { teacher: { schoolId }, createdAt: { gte: from, lte: to } } }),
    prisma.remark.findMany({ where: { teacher: { schoolId }, createdAt: { gte: from, lte: to } } }),
    prisma.leaveRequest.findMany({ where: { kind: 'TEACHER', teacher: { schoolId }, fromDate: { lte: to }, toDate: { gte: from } } }),
  ]);

  const reports = teachers.map(t => {
    const records = attendance.filter(a => a.teacherId === t.id);
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const leave = records.filter(r => r.status === 'LEAVE').length;
    const checkIns = records
      .map(r => r.checkInTime)
      .filter((x): x is string => !!x);
    const avgCheckIn = checkIns.length
      ? checkIns.sort()[Math.floor(checkIns.length / 2)]
      : null;

    return {
      teacherId: t.id,
      name: t.name,
      subject: t.subject,
      present,
      absent,
      leave,
      avgCheckIn,
      lessonsUploaded: lessons.filter(l => l.teacherId === t.id).length,
      testsCreated: tests.filter(x => x.teacherId === t.id).length,
      remarksPosted: remarks.filter(r => r.teacherId === t.id).length,
      leavesApplied: leaves.filter(l => l.teacherId === t.id).length,
    };
  });

  res.json({ range, from, to, reports });
});
