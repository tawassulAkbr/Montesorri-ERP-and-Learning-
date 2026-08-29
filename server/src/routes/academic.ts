import { Router } from 'express';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { badRequest, notFound, forbidden } from '../utils/errors';
import {
  lessonToFrontend, testToFrontend, testResultToFrontend,
  remarkToFrontend, dailyWorkToFrontend, scheduleToFrontend, liveClassToFrontend,
} from '../utils/serializers';

const sanitize = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h3', 'h4', 'blockquote'],
    allowedAttributes: {},
  });

const todayISO = () => new Date().toISOString().slice(0, 10);

// ─── Lessons ──────────────────────────────────────────────────────────────────
export const lessonRouter = Router();
lessonRouter.use(requireAuth);

lessonRouter.get('/', async (req, res) => {
  const cls = typeof req.query.class === 'string' ? req.query.class : undefined;
  const lessons = await prisma.lesson.findMany({
    where: cls ? { class: cls } : {},
    orderBy: { uploadedAt: 'desc' },
  });
  res.json({ lessons: lessons.map(lessonToFrontend) });
});

const lessonSchema = z.object({
  title: z.string().min(2),
  subject: z.string().min(2),
  class: z.string().min(2),
  youtubeId: z.string().min(3).optional(),
  videoUrl: z.string().min(3).optional(),
  description: z.string().min(2),
  notes: z.string().optional(),
  duration: z.string().min(3),
}).refine(d => d.youtubeId || d.videoUrl, { message: 'Provide youtubeId or videoUrl' });

lessonRouter.post('/', requireRole('teacher'), async (req, res) => {
  const input = lessonSchema.parse(req.body);
  const teacher = await prisma.teacher.findUnique({ where: { id: req.user!.id } });
  if (!teacher) throw notFound('Teacher record not found');
  const lesson = await prisma.lesson.create({
    data: {
      title: input.title,
      subject: input.subject,
      class: input.class,
      youtubeId: input.youtubeId ?? null,
      videoUrl: input.videoUrl ?? null,
      description: input.description,
      notes: input.notes ?? null,
      duration: input.duration,
      teacherId: teacher.id,
      teacherName: teacher.name,
      uploadedAt: todayISO(),
      views: 0,
    },
  });
  res.json({ lesson: lessonToFrontend(lesson) });
});

lessonRouter.delete('/:id', requireRole('teacher', 'admin'), async (req, res) => {
  const lesson = await prisma.lesson.findUnique({ where: { id: String(req.params.id) } });
  if (!lesson) throw notFound('Lesson not found');
  if (req.user!.role === 'teacher' && lesson.teacherId !== req.user!.id) {
    throw forbidden('You can only delete your own lessons');
  }
  await prisma.lesson.delete({ where: { id: lesson.id } });
  res.json({ ok: true });
});

// ─── Tests (milestones) & results ─────────────────────────────────────────────
export const testRouter = Router();
testRouter.use(requireAuth);

testRouter.get('/', async (req, res) => {
  const cls = typeof req.query.class === 'string' ? req.query.class : undefined;
  const tests = await prisma.test.findMany({
    where: cls ? { class: cls } : {},
    orderBy: { date: 'desc' },
  });
  res.json({ tests: tests.map(testToFrontend) });
});

const testSchema = z.object({
  title: z.string().min(2),
  subject: z.string().min(2),
  class: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maxMarks: z.number().int().positive(),
  instructions: z.string().min(2),
});

testRouter.post('/', requireRole('teacher'), async (req, res) => {
  const input = testSchema.parse(req.body);
  const test = await prisma.test.create({
    data: { ...input, teacherId: req.user!.id, status: 'upcoming', createdAt: todayISO() },
  });
  res.json({ test: testToFrontend(test) });
});

const resultsSchema = z.object({
  results: z.array(z.object({
    studentId: z.string(),
    marksObtained: z.number().int().min(0),
    grade: z.enum(['A+', 'A', 'B', 'C', 'D', 'F']),
    milestoneStatus: z.enum(['Mastered', 'Developing', 'Emerging']).optional(),
    teacherComment: z.string().optional(),
  })).min(1),
});

testRouter.post('/:id/results', requireRole('teacher'), async (req, res) => {
  const test = await prisma.test.findUnique({ where: { id: String(req.params.id) } });
  if (!test) throw notFound('Test not found');
  const { results } = resultsSchema.parse(req.body);

  const created = await prisma.$transaction(async tx => {
    const rows = [];
    for (const r of results) {
      if (r.marksObtained > test.maxMarks) throw badRequest('marksObtained exceeds maxMarks');
      const student = await tx.student.findUnique({ where: { id: r.studentId } });
      if (!student) throw badRequest(`Student ${r.studentId} not found`);
      rows.push(await tx.testResult.create({
        data: {
          testId: test.id,
          testTitle: test.title,
          studentId: student.id,
          subject: test.subject,
          marksObtained: r.marksObtained,
          maxMarks: test.maxMarks,
          grade: r.grade,
          milestoneStatus: r.milestoneStatus ?? null,
          date: todayISO(),
          teacherComment: r.teacherComment ?? null,
        },
      }));
    }
    await tx.test.update({ where: { id: test.id }, data: { status: 'evaluated' } });
    return rows;
  });

  res.json({ results: created.map(testResultToFrontend) });
});

testRouter.get('/:id/results', async (req, res) => {
  const results = await prisma.testResult.findMany({ where: { testId: String(req.params.id) } });
  res.json({ results: results.map(testResultToFrontend) });
});

// ─── Remarks ──────────────────────────────────────────────────────────────────
export const remarkRouter = Router();
remarkRouter.use(requireAuth);

remarkRouter.get('/', async (req, res) => {
  const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
  const remarks = await prisma.remark.findMany({
    where: studentId ? { studentId } : {},
    orderBy: { createdAt: 'desc' },
  });
  res.json({ remarks: remarks.map(remarkToFrontend) });
});

const remarkSchema = z.object({
  studentId: z.string(),
  content: z.string().min(3),
  type: z.enum(['positive', 'constructive', 'concern']),
});

remarkRouter.post('/', requireRole('teacher'), async (req, res) => {
  const input = remarkSchema.parse(req.body);
  const [teacher, student] = await Promise.all([
    prisma.teacher.findUnique({ where: { id: req.user!.id } }),
    prisma.student.findUnique({ where: { id: input.studentId } }),
  ]);
  if (!teacher) throw notFound('Teacher record not found');
  if (!student) throw notFound('Student not found');

  const remark = await prisma.remark.create({
    data: {
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherSubject: teacher.subject,
      studentId: student.id,
      studentName: student.name,
      parentId: student.parentId,
      content: sanitize(input.content),
      type: input.type.toUpperCase() as any,
      createdAt: todayISO(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: student.parentId, role: 'PARENT',
      title: `New remark from ${teacher.name}`,
      message: `A new observation about ${student.name} has been posted.`,
      type: 'INFO', kind: 'GENERAL',
    },
  });

  res.json({ remark: remarkToFrontend(remark) });
});

// ─── Daily work ───────────────────────────────────────────────────────────────
export const dailyWorkRouter = Router();
dailyWorkRouter.use(requireAuth);

dailyWorkRouter.get('/', async (req, res) => {
  const cls = typeof req.query.class === 'string' ? req.query.class : undefined;
  const work = await prisma.dailyWork.findMany({
    where: cls ? { class: cls } : {},
    orderBy: { postedAt: 'desc' },
  });
  res.json({ dailyWork: work.map(dailyWorkToFrontend) });
});

const dailyWorkSchema = z.object({
  class: z.string().min(2),
  content: z.string().min(3),
  attachmentName: z.string().optional(),
  visibleTo: z.array(z.enum(['students', 'parents'])).min(1),
});

dailyWorkRouter.post('/', requireRole('teacher'), async (req, res) => {
  const input = dailyWorkSchema.parse(req.body);
  const teacher = await prisma.teacher.findUnique({ where: { id: req.user!.id } });
  if (!teacher) throw notFound('Teacher record not found');
  const work = await prisma.dailyWork.create({
    data: {
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherSubject: teacher.subject,
      class: input.class,
      content: sanitize(input.content),
      attachmentName: input.attachmentName ?? null,
      postedAt: new Date().toISOString(),
      visibleTo: input.visibleTo,
      completedByStudentIds: [],
    },
  });
  res.json({ dailyWork: dailyWorkToFrontend(work) });
});

dailyWorkRouter.patch('/:id/complete', requireRole('student'), async (req, res) => {
  const work = await prisma.dailyWork.findUnique({ where: { id: String(req.params.id) } });
  if (!work) throw notFound('Daily work not found');
  const studentId = req.user!.id;
  const done = work.completedByStudentIds.includes(studentId);
  const updated = await prisma.dailyWork.update({
    where: { id: work.id },
    data: {
      completedByStudentIds: done
        ? work.completedByStudentIds.filter(id => id !== studentId)
        : [...work.completedByStudentIds, studentId],
    },
  });
  res.json({ dailyWork: dailyWorkToFrontend(updated) });
});

// ─── Schedule & live class ────────────────────────────────────────────────────
export const scheduleRouter = Router();
scheduleRouter.use(requireAuth);

scheduleRouter.get('/', async (req, res) => {
  const cls = typeof req.query.class === 'string' ? req.query.class : undefined;
  const items = await prisma.scheduleItem.findMany({ where: cls ? { class: cls } : {} });
  res.json({ schedules: items.map(scheduleToFrontend) });
});

const scheduleSchema = z.object({
  title: z.string().min(2),
  category: z.enum(['circle_time', 'phonics', 'sensorial', 'math', 'snack_break', 'art_craft', 'outdoor_play', 'storytelling', 'live_class']),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  class: z.string().min(2),
  teacherName: z.string().min(2),
  description: z.string().min(2),
  roomOrLink: z.string().optional(),
  isLive: z.boolean().optional(),
});

scheduleRouter.post('/', requireRole('teacher', 'admin'), async (req, res) => {
  const input = scheduleSchema.parse(req.body);
  const item = await prisma.scheduleItem.create({
    data: {
      ...input,
      category: input.category.toUpperCase() as any,
      roomOrLink: input.roomOrLink ?? null,
      isLive: input.isLive ?? false,
    },
  });
  res.json({ schedule: scheduleToFrontend(item) });
});

scheduleRouter.delete('/:id', requireRole('teacher', 'admin'), async (req, res) => {
  await prisma.scheduleItem.delete({ where: { id: String(req.params.id) } }).catch(() => {
    throw notFound('Schedule item not found');
  });
  res.json({ ok: true });
});

export const liveClassRouter = Router();
liveClassRouter.use(requireAuth);

liveClassRouter.get('/', async (_req, res) => {
  const session = await prisma.liveClassSession.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
  res.json({ liveClass: liveClassToFrontend(session) });
});

const liveClassSchema = z.object({
  topic: z.string().min(2),
  subject: z.string().min(2),
  class: z.string().min(2),
  teacherName: z.string().optional(),
});

liveClassRouter.put('/start', requireRole('teacher', 'admin'), async (req, res) => {
  const input = liveClassSchema.parse(req.body);
  const teacherName = input.teacherName
    ?? (await prisma.teacher.findUnique({ where: { id: req.user!.id } }))?.name
    ?? 'Teacher';
  const session = await prisma.liveClassSession.upsert({
    where: { id: 'singleton' },
    update: { isActive: true, ...input, teacherName, startedAt: new Date().toISOString(), participantsCount: 1 },
    create: { id: 'singleton', isActive: true, ...input, teacherName, startedAt: new Date().toISOString(), participantsCount: 1 },
  });

  // Alert students of the class and their parents that the live class is starting.
  const classStudents = await prisma.student.findMany({ where: { class: input.class } });
  if (classStudents.length > 0) {
    const notifOps = classStudents.flatMap(s => [
      prisma.notification.create({
        data: {
          userId: s.id, role: 'STUDENT',
          title: 'Live class starting',
          message: `${teacherName} is starting "${input.topic}" now. Join the live classroom!`,
          type: 'INFO', kind: 'GENERAL',
        },
      }),
      prisma.notification.create({
        data: {
          userId: s.parentId, role: 'PARENT',
          title: 'Live class starting',
          message: `A live class ("${input.topic}") is starting now for ${s.class}.`,
          type: 'INFO', kind: 'GENERAL',
        },
      }),
    ]);
    await prisma.$transaction(notifOps);
  }

  res.json({ liveClass: liveClassToFrontend(session) });
});

liveClassRouter.put('/end', requireRole('teacher', 'admin'), async (_req, res) => {
  const session = await prisma.liveClassSession.upsert({
    where: { id: 'singleton' },
    update: { isActive: false },
    create: { id: 'singleton', isActive: false },
  });
  res.json({ liveClass: liveClassToFrontend(session) });
});
