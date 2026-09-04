import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { notFound } from '../utils/errors';
import { schoolOf } from '../utils/tenant';

// ─── Student submits feedback (identity stored, hidden from teacher) ─────────
export const studentFeedbackRouter = Router();
studentFeedbackRouter.use(requireAuth, requireRole('student'));

const feedbackSchema = z.object({
  teacherId: z.string(),
  content: z.string().min(3).max(2000),
});

studentFeedbackRouter.post('/', async (req, res) => {
  const { teacherId, content } = feedbackSchema.parse(req.body);
  const student = await prisma.student.findUnique({ where: { id: req.user!.id } });
  if (!student) throw notFound('Student record not found');
  const teacher = await prisma.teacher.findFirst({
    where: { id: teacherId, schoolId: student.schoolId },
  });
  if (!teacher) throw notFound('Teacher not found');

  const feedback = await prisma.feedback.create({
    data: {
      studentId: student.id,
      studentName: student.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      content,
    },
  });

  await prisma.notification.create({
    data: {
      userId: teacher.id, role: 'TEACHER',
      title: 'New anonymous feedback',
      message: 'A student shared feedback with you. Open the Feedback page to read it.',
      type: 'INFO', kind: 'GENERAL',
    },
  });

  res.json({ feedback });
});

studentFeedbackRouter.get('/mine', async (req, res) => {
  const feedbacks = await prisma.feedback.findMany({
    where: { studentId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ feedbacks });
});

// ─── Teacher reads feedback anonymously ───────────────────────────────────────
export const teacherFeedbackRouter = Router();
teacherFeedbackRouter.use(requireAuth, requireRole('teacher'));

teacherFeedbackRouter.get('/', async (req, res) => {
  const feedbacks = await prisma.feedback.findMany({
    where: { teacherId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  // Identity is never exposed to the teacher.
  res.json({
    feedbacks: feedbacks.map(f => ({
      id: f.id,
      content: f.content,
      readByTeacher: f.readByTeacher,
      createdAt: f.createdAt.toISOString(),
    })),
  });
});

teacherFeedbackRouter.patch('/:id/read', async (req, res) => {
  const f = await prisma.feedback.findUnique({ where: { id: String(req.params.id) } });
  if (!f || f.teacherId !== req.user!.id) throw notFound('Feedback not found');
  const updated = await prisma.feedback.update({
    where: { id: f.id },
    data: { readByTeacher: true },
  });
  res.json({
    feedback: {
      id: updated.id,
      content: updated.content,
      readByTeacher: updated.readByTeacher,
      createdAt: updated.createdAt.toISOString(),
    },
  });
});

// ─── Admin sees all feedback with identities ──────────────────────────────────
export const adminFeedbackRouter = Router();
adminFeedbackRouter.use(requireAuth, requireRole('admin'));

adminFeedbackRouter.get('/', async (req, res) => {
  const schoolId = schoolOf(req);
  const feedbacks = await prisma.feedback.findMany({
    where: { teacher: { schoolId } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({
    feedbacks: feedbacks.map(f => ({
      id: f.id,
      studentId: f.studentId,
      studentName: f.studentName,
      teacherId: f.teacherId,
      teacherName: f.teacherName,
      content: f.content,
      readByTeacher: f.readByTeacher,
      createdAt: f.createdAt.toISOString(),
    })),
  });
});
