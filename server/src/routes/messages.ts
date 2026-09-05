import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { notFound } from '../utils/errors';
import { schoolOf } from '../utils/tenant';

const contentSchema = z.object({ content: z.string().min(1).max(2000) });

const serializeMsg = (m: {
  id: string; parentId: string; parentName: string; teacherId: string; teacherName: string;
  senderRole: 'PARENT' | 'TEACHER' | 'STUDENT' | 'ADMIN'; content: string; createdAt: Date;
  readByParent: boolean; readByTeacher: boolean;
}) => ({
  ...m,
  senderRole: m.senderRole.toLowerCase() as 'parent' | 'teacher',
  createdAt: m.createdAt.toISOString(),
});

// ─── Parent side ──────────────────────────────────────────────────────────────
export const parentMessageRouter = Router();
parentMessageRouter.use(requireAuth, requireRole('parent'));

parentMessageRouter.get('/threads', async (req, res) => {
  const parent = await prisma.parent.findUnique({ where: { id: req.user!.id } });
  if (!parent) throw notFound('Parent record not found');

  const messages = await prisma.message.findMany({
    where: { parentId: parent.id },
    orderBy: { createdAt: 'asc' },
  });

  const byTeacher = new Map<string, typeof messages>();
  for (const m of messages) {
    const list = byTeacher.get(m.teacherId) ?? [];
    list.push(m);
    byTeacher.set(m.teacherId, list);
  }

  const threads = [...byTeacher.entries()].map(([teacherId, msgs]) => {
    const last = msgs[msgs.length - 1];
    return {
      teacherId,
      teacherName: last.teacherName,
      lastMessage: last.content,
      lastAt: last.createdAt.toISOString(),
      unread: msgs.filter(m => m.senderRole === 'TEACHER' && !m.readByParent).length,
    };
  }).sort((a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? ''));

  res.json({ threads });
});

parentMessageRouter.get('/:teacherId', async (req, res) => {
  const teacherId = String(req.params.teacherId);
  const parent = await prisma.parent.findUnique({ where: { id: req.user!.id } });
  if (!parent) throw notFound('Parent record not found');

  const messages = await prisma.message.findMany({
    where: { parentId: parent.id, teacherId },
    orderBy: { createdAt: 'asc' },
  });

  // Mark teacher messages as read by the parent.
  await prisma.message.updateMany({
    where: { parentId: parent.id, teacherId, senderRole: 'TEACHER', readByParent: false },
    data: { readByParent: true },
  });

  res.json({ messages: messages.map(serializeMsg) });
});

parentMessageRouter.post('/:teacherId', async (req, res) => {
  const { content } = contentSchema.parse(req.body);
  const teacherId = String(req.params.teacherId);
  const [parent, teacher] = await Promise.all([
    prisma.parent.findUnique({ where: { id: req.user!.id } }),
    prisma.teacher.findFirst({ where: { id: teacherId, schoolId: schoolOf(req) } }),
  ]);
  if (!parent) throw notFound('Parent record not found');
  if (!teacher) throw notFound('Teacher not found');

  const message = await prisma.message.create({
    data: {
      parentId: parent.id,
      parentName: parent.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      senderRole: 'PARENT',
      content,
      readByParent: true,
      readByTeacher: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: teacher.id, role: 'TEACHER',
      title: 'New message from a parent',
      message: `${parent.name} sent you a message about their child.`,
      type: 'INFO', kind: 'GENERAL',
    },
  });

  res.json({ message: serializeMsg(message) });
});

// ─── Teacher side ─────────────────────────────────────────────────────────────
export const teacherMessageRouter = Router();
teacherMessageRouter.use(requireAuth, requireRole('teacher'));

teacherMessageRouter.get('/threads', async (req, res) => {
  const messages = await prisma.message.findMany({
    where: { teacherId: req.user!.id },
    orderBy: { createdAt: 'asc' },
  });

  const byParent = new Map<string, typeof messages>();
  for (const m of messages) {
    const list = byParent.get(m.parentId) ?? [];
    list.push(m);
    byParent.set(m.parentId, list);
  }

  const threads = [...byParent.entries()].map(([parentId, msgs]) => {
    const last = msgs[msgs.length - 1];
    return {
      parentId,
      parentName: last.parentName,
      lastMessage: last.content,
      lastAt: last.createdAt.toISOString(),
      unread: msgs.filter(m => m.senderRole === 'PARENT' && !m.readByTeacher).length,
    };
  }).sort((a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? ''));

  res.json({ threads });
});

// Parents the teacher can start a NEW conversation with (parents of students in
// the teacher's classes). Must be declared before the /:parentId catch-all.
teacherMessageRouter.get('/contacts', async (req, res) => {
  const teacher = await prisma.teacher.findUnique({ where: { id: req.user!.id } });
  if (!teacher) throw notFound('Teacher record not found');

  const students = await prisma.student.findMany({
    where: { schoolId: teacher.schoolId, class: { in: teacher.classes } },
    include: { parent: true },
  });

  const seen = new Map<string, { parentId: string; parentName: string; studentName: string; className: string }>();
  for (const s of students) {
    if (!seen.has(s.parentId)) {
      seen.set(s.parentId, {
        parentId: s.parentId,
        parentName: s.parent.name,
        studentName: s.name,
        className: s.class,
      });
    }
  }

  res.json({ contacts: [...seen.values()] });
});

teacherMessageRouter.get('/:parentId', async (req, res) => {
  const parentId = String(req.params.parentId);
  const messages = await prisma.message.findMany({
    where: { teacherId: req.user!.id, parentId },
    orderBy: { createdAt: 'asc' },
  });

  await prisma.message.updateMany({
    where: { teacherId: req.user!.id, parentId, senderRole: 'PARENT', readByTeacher: false },
    data: { readByTeacher: true },
  });

  res.json({ messages: messages.map(serializeMsg) });
});

teacherMessageRouter.post('/:parentId', async (req, res) => {
  const { content } = contentSchema.parse(req.body);
  const parentId = String(req.params.parentId);
  const [teacher, parent] = await Promise.all([
    prisma.teacher.findUnique({ where: { id: req.user!.id } }),
    prisma.parent.findFirst({ where: { id: parentId, schoolId: schoolOf(req) } }),
  ]);
  if (!teacher) throw notFound('Teacher record not found');
  if (!parent) throw notFound('Parent not found');

  const message = await prisma.message.create({
    data: {
      parentId: parent.id,
      parentName: parent.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      senderRole: 'TEACHER',
      content,
      readByParent: false,
      readByTeacher: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: parent.id, role: 'PARENT',
      title: `Reply from ${teacher.name}`,
      message: 'Your child\'s teacher replied in your chat.',
      type: 'INFO', kind: 'GENERAL',
    },
  });

  res.json({ message: serializeMsg(message) });
});
