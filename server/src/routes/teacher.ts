import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { deriveTeacherStatus, todayISO, eachWeekday } from '../services/attendance';
import { badRequest, notFound } from '../utils/errors';
import { schoolOf } from '../utils/tenant';
import {
  leaveToFrontend, studentToFrontend, attendanceToFrontend,
} from '../utils/serializers';

export const teacherRouter = Router();
teacherRouter.use(requireAuth, requireRole('teacher'));

async function getTeacher(userId: string) {
  const teacher = await prisma.teacher.findUnique({ where: { id: userId } });
  if (!teacher) throw notFound('Teacher record not found');
  return teacher;
}

function rec_date(records: { studentId: string; date: string }[], studentId: string): string {
  return records.find(r => r.studentId === studentId)?.date ?? todayISO();
}

// ─── Self attendance ──────────────────────────────────────────────────────────
teacherRouter.get('/today-status', async (req, res) => {
  await getTeacher(req.user!.id);
  const date = todayISO();
  const record = await prisma.teacherAttendanceRecord.findUnique({
    where: { teacherId_date: { teacherId: req.user!.id, date } },
  });
  res.json({
    date,
    status: await deriveTeacherStatus(req.user!.id, date),
    checkInTime: record?.checkInTime ?? null,
  });
});

teacherRouter.post('/mark-present', async (req, res) => {
  const teacherId = req.user!.id;
  await getTeacher(teacherId);
  const date = todayISO();
  const now = new Date();
  const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const record = await prisma.teacherAttendanceRecord.upsert({
    where: { teacherId_date: { teacherId, date } },
    update: { status: 'PRESENT', leaveRequestId: null, checkInTime },
    create: { teacherId, date, status: 'PRESENT', checkInTime },
  });
  res.json({ attendance: { ...record, status: 'present' } });
});

// ─── Teacher leave ────────────────────────────────────────────────────────────
const leaveSchema = z.object({
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(3),
});

teacherRouter.post('/apply-leave', async (req, res) => {
  const teacher = await getTeacher(req.user!.id);
  const { fromDate, toDate, reason } = leaveSchema.parse(req.body);
  if (toDate < fromDate) throw badRequest('toDate must be on or after fromDate');
  const leave = await prisma.leaveRequest.create({
    data: {
      kind: 'TEACHER',
      teacherId: teacher.id,
      teacherName: teacher.name,
      fromDate, toDate, reason,
      status: 'PENDING',
      submittedAt: todayISO(),
    },
  });
  res.json({ leave: leaveToFrontend(leave) });
});

teacherRouter.get('/my-leaves', async (req, res) => {
  const leaves = await prisma.leaveRequest.findMany({
    where: { kind: 'TEACHER', teacherId: req.user!.id },
    orderBy: { submittedAt: 'desc' },
  });
  res.json({ leaves: leaves.map(leaveToFrontend) });
});

// ─── Class roster (guardian names + fee flag, NEVER fee amounts) ─────────────
teacherRouter.get('/students', async (req, res) => {
  const teacher = await getTeacher(req.user!.id);
  const schoolId = schoolOf(req);
  const classFilter = typeof req.query.class === 'string' ? req.query.class : undefined;
  if (classFilter && !teacher.classes.includes(classFilter)) {
    throw badRequest('You do not teach this class');
  }
  const students = await prisma.student.findMany({
    where: {
      schoolId,
      ...(classFilter ? { class: classFilter } : { class: { in: teacher.classes } }),
    },
    orderBy: [{ class: 'asc' }, { rollNo: 'asc' }],
  });
  res.json({
    students: students.map(s => studentToFrontend(s, { includeFeeAmount: false })),
  });
});

// ─── Daily roll call (batch student attendance) ──────────────────────────────
const rollCallSchema = z.object({
  records: z.array(z.object({
    studentId: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(['present', 'absent', 'leave', 'holiday']),
  })).min(1),
});

teacherRouter.post('/attendance', async (req, res) => {
  const { records } = rollCallSchema.parse(req.body);
  const ops = records.map(rec =>
    prisma.attendanceRecord.upsert({
      where: { studentId_date: { studentId: rec.studentId, date: rec.date } },
      update: { status: rec.status.toUpperCase() as any, markedBy: req.user!.id },
      create: {
        studentId: rec.studentId,
        date: rec.date,
        status: rec.status.toUpperCase() as any,
        markedBy: req.user!.id,
      },
    }),
  );
  await prisma.$transaction(ops);

  // Absence alerts to the student and their parent
  const absentIds = records.filter(r => r.status === 'absent').map(r => r.studentId);
  if (absentIds.length > 0) {
    const absentStudents = await prisma.student.findMany({ where: { id: { in: absentIds } } });
    const notifOps = absentStudents.flatMap(s => [
      prisma.notification.create({
        data: {
          userId: s.id, role: 'STUDENT',
          title: 'Marked absent',
          message: `You were marked absent on ${rec_date(records, s.id)}. If this is a mistake, talk to your teacher.`,
          type: 'WARNING', kind: 'ABSENCE', relatedStudentId: s.id,
        },
      }),
      prisma.notification.create({
        data: {
          userId: s.parentId, role: 'PARENT',
          title: 'Absence alert',
          message: `${s.name} was marked absent on ${rec_date(records, s.id)}.`,
          type: 'WARNING', kind: 'ABSENCE', relatedStudentId: s.id,
        },
      }),
    ]);
    await prisma.$transaction(notifOps);
  }

  res.json({ ok: true, count: records.length });
});

teacherRouter.get('/attendance', async (req, res) => {
  const schoolId = schoolOf(req);
  const classFilter = typeof req.query.class === 'string' ? req.query.class : undefined;
  const date = typeof req.query.date === 'string' ? req.query.date : todayISO();
  const teacher = await getTeacher(req.user!.id);
  const records = await prisma.attendanceRecord.findMany({
    where: {
      date,
      student: {
        schoolId,
        ...(classFilter ? { class: classFilter } : { class: { in: teacher.classes } }),
      },
    },
  });
  res.json({ attendance: records.map(attendanceToFrontend) });
});

// ─── Student leave review (teacher) ──────────────────────────────────────────
teacherRouter.get('/student-leaves', async (req, res) => {
  const teacher = await getTeacher(req.user!.id);
  const schoolId = schoolOf(req);
  const status = z.enum(['pending', 'accepted', 'rejected', 'all']).default('pending').parse(req.query.status ?? 'pending');
  const leaves = await prisma.leaveRequest.findMany({
    where: {
      kind: 'STUDENT',
      ...(status === 'all' ? {} : { status: status.toUpperCase() as any }),
      student: { schoolId, class: { in: teacher.classes } },
    },
    orderBy: { submittedAt: 'desc' },
  });
  res.json({ leaves: leaves.map(leaveToFrontend) });
});

teacherRouter.patch('/student-leaves/:id', async (req, res) => {
  const { status } = z.object({ status: z.enum(['accepted', 'rejected']) }).parse(req.body);
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: String(req.params.id) },
    include: { student: true },
  });
  if (!leave || leave.kind !== 'STUDENT') throw notFound('Student leave request not found');
  if (leave.status !== 'PENDING') throw badRequest('Leave request already reviewed');

  const ops: any[] = [
    prisma.leaveRequest.update({
      where: { id: leave.id },
      data: { status: status.toUpperCase() as any, respondedAt: todayISO(), respondedBy: req.user!.id },
    }),
  ];

  if (status === 'accepted' && leave.studentId) {
    for (const date of eachWeekday(leave.fromDate, leave.toDate)) {
      ops.push(prisma.attendanceRecord.upsert({
        where: { studentId_date: { studentId: leave.studentId, date } },
        update: { status: 'LEAVE', leaveRequestId: leave.id, markedBy: req.user!.id },
        create: { studentId: leave.studentId, date, status: 'LEAVE', leaveRequestId: leave.id, markedBy: req.user!.id },
      }));
    }
  }

  await prisma.$transaction(ops);
  const updated = await prisma.leaveRequest.findUniqueOrThrow({ where: { id: leave.id } });
  res.json({ leave: leaveToFrontend(updated) });
});