import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { badRequest, notFound, forbidden } from '../utils/errors';

const isoNow = () => new Date().toISOString();
const todayISO = () => new Date().toISOString().slice(0, 10);

// ─── Teacher side ─────────────────────────────────────────────────────────────
export const teacherAssignmentRouter = Router();
teacherAssignmentRouter.use(requireAuth, requireRole('teacher'));

const assignmentSchema = z.object({
  title: z.string().min(2),
  class: z.string().min(2),
  subject: z.string().min(2),
  instructions: z.string().min(2),
  dueAt: z.string().min(10),
});

teacherAssignmentRouter.post('/', async (req, res) => {
  const input = assignmentSchema.parse(req.body);
  const teacher = await prisma.teacher.findUnique({ where: { id: req.user!.id } });
  if (!teacher) throw notFound('Teacher record not found');
  if (!teacher.classes.includes(input.class)) throw badRequest('You do not teach this class');

  const assignment = await prisma.assignment.create({
    data: {
      teacherId: teacher.id,
      teacherName: teacher.name,
      title: input.title,
      class: input.class,
      subject: input.subject,
      instructions: input.instructions,
      dueAt: input.dueAt,
      createdAt: todayISO(),
    },
  });

  const classStudents = await prisma.student.findMany({ where: { class: input.class } });
  if (classStudents.length > 0) {
    await prisma.$transaction(classStudents.map(s =>
      prisma.notification.create({
        data: {
          userId: s.id, role: 'STUDENT',
          title: 'New assignment',
          message: `"${assignment.title}" is due ${assignment.dueAt.slice(0, 16).replace('T', ' ')}. Open Assignments to submit.`,
          type: 'INFO', kind: 'GENERAL',
        },
      })
    ));
  }

  res.json({ assignment });
});

teacherAssignmentRouter.get('/', async (req, res) => {
  const assignments = await prisma.assignment.findMany({
    where: { teacherId: req.user!.id },
    orderBy: { dueAt: 'asc' },
    include: { submissions: true },
  });
  res.json({ assignments });
});

teacherAssignmentRouter.delete('/:id', async (req, res) => {
  const a = await prisma.assignment.findUnique({ where: { id: String(req.params.id) } });
  if (!a || a.teacherId !== req.user!.id) throw notFound('Assignment not found');
  await prisma.assignment.delete({ where: { id: a.id } });
  res.json({ ok: true });
});

teacherAssignmentRouter.get('/:id/submissions', async (req, res) => {
  const a = await prisma.assignment.findUnique({
    where: { id: String(req.params.id) },
    include: { submissions: { orderBy: { submittedAt: 'asc' } } },
  });
  if (!a || a.teacherId !== req.user!.id) throw notFound('Assignment not found');
  res.json({ assignment: a, submissions: a.submissions });
});

const gradeSchema = z.object({
  grade: z.number().int().min(0).max(100),
  feedback: z.string().optional(),
});

teacherAssignmentRouter.patch('/submissions/:id/grade', async (req, res) => {
  const { grade, feedback } = gradeSchema.parse(req.body);
  const sub = await prisma.submission.findUnique({
    where: { id: String(req.params.id) },
    include: { assignment: true },
  });
  if (!sub) throw notFound('Submission not found');
  if (sub.assignment.teacherId !== req.user!.id) throw forbidden('Not your assignment');

  const updated = await prisma.submission.update({
    where: { id: sub.id },
    data: { grade, feedback: feedback ?? null },
  });

  await prisma.notification.create({
    data: {
      userId: sub.studentId, role: 'STUDENT',
      title: 'Assignment graded',
      message: `Your submission for "${sub.assignment.title}" was graded: ${grade}/100.`,
      type: 'SUCCESS', kind: 'GENERAL',
    },
  });

  res.json({ submission: updated });
});

// ─── Student side ─────────────────────────────────────────────────────────────
export const studentAssignmentRouter = Router();
studentAssignmentRouter.use(requireAuth, requireRole('student'));

studentAssignmentRouter.get('/', async (req, res) => {
  const student = await prisma.student.findUnique({ where: { id: req.user!.id } });
  if (!student) throw notFound('Student record not found');
  const [assignments, submissions] = await Promise.all([
    prisma.assignment.findMany({ where: { class: student.class }, orderBy: { dueAt: 'asc' } }),
    prisma.submission.findMany({ where: { studentId: student.id } }),
  ]);
  res.json({ assignments, submissions });
});

const submitSchema = z.object({
  text: z.string().max(5000).optional(),
  fileName: z.string().optional(),
  filePath: z.string().optional(),
});

studentAssignmentRouter.post('/:id/submit', async (req, res) => {
  const { text, fileName, filePath } = submitSchema.parse(req.body);
  const student = await prisma.student.findUnique({ where: { id: req.user!.id } });
  if (!student) throw notFound('Student record not found');

  const assignment = await prisma.assignment.findUnique({ where: { id: String(req.params.id) } });
  if (!assignment) throw notFound('Assignment not found');
  if (assignment.class !== student.class) throw forbidden('This assignment is not for your class');
  if (!text && !filePath) throw badRequest('Provide either text or an uploaded file');

  const submittedAt = isoNow();
  const isLate = submittedAt > new Date(assignment.dueAt).toISOString();

  const submission = await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: student.id } },
    update: { text: text ?? null, fileName: fileName ?? null, filePath: filePath ?? null, submittedAt, isLate },
    create: {
      assignmentId: assignment.id,
      studentId: student.id,
      studentName: student.name,
      text: text ?? null,
      fileName: fileName ?? null,
      filePath: filePath ?? null,
      submittedAt,
      isLate,
    },
  });

  await prisma.notification.create({
    data: {
      userId: assignment.teacherId, role: 'TEACHER',
      title: 'New submission',
      message: `${student.name} submitted "${assignment.title}" at ${submittedAt.slice(0, 16).replace('T', ' ')}${isLate ? ' (late)' : ''}.`,
      type: 'INFO', kind: 'GENERAL',
    },
  });

  res.json({ submission });
});

// ─── Admin view (all) ─────────────────────────────────────────────────────────
export const adminAssignmentRouter = Router();
adminAssignmentRouter.use(requireAuth, requireRole('admin'));

adminAssignmentRouter.get('/', async (_req, res) => {
  const assignments = await prisma.assignment.findMany({
    orderBy: { dueAt: 'asc' },
    include: { submissions: true },
  });
  res.json({ assignments });
});
