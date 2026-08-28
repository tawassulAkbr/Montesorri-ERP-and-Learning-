import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { todayISO } from '../services/attendance';
import { badRequest, notFound } from '../utils/errors';
import {
  studentToFrontend, parentToFrontend, attendanceToFrontend,
  testResultToFrontend, leaveToFrontend,
} from '../utils/serializers';

export const studentRouter = Router();
studentRouter.use(requireAuth, requireRole('student'));

async function getStudent(userId: string) {
  const student = await prisma.student.findUnique({ where: { id: userId } });
  if (!student) throw notFound('Student record not found');
  return student;
}

studentRouter.get('/me', async (req, res) => {
  const student = await getStudent(req.user!.id);
  res.json({ student: studentToFrontend(student, { includeFeeAmount: false }) });
});

studentRouter.get('/my-attendance', async (req, res) => {
  await getStudent(req.user!.id);
  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: req.user!.id },
    orderBy: { date: 'asc' },
  });
  res.json({ attendance: records.map(attendanceToFrontend) });
});

studentRouter.get('/my-results', async (req, res) => {
  await getStudent(req.user!.id);
  const results = await prisma.testResult.findMany({
    where: { studentId: req.user!.id },
    orderBy: { date: 'desc' },
  });
  res.json({ results: results.map(testResultToFrontend) });
});

studentRouter.get('/my-leaves', async (req, res) => {
  await getStudent(req.user!.id);
  const leaves = await prisma.leaveRequest.findMany({
    where: { kind: 'STUDENT', studentId: req.user!.id },
    orderBy: { submittedAt: 'desc' },
  });
  res.json({ leaves: leaves.map(leaveToFrontend) });
});

// ─── Parent portal ────────────────────────────────────────────────────────────
export const parentRouter = Router();
parentRouter.use(requireAuth, requireRole('parent'));

async function getParent(userId: string) {
  const parent = await prisma.parent.findUnique({
    where: { id: userId },
    include: { children: true },
  });
  if (!parent) throw notFound('Parent record not found');
  return parent;
}

parentRouter.get('/me', async (req, res) => {
  const parent = await getParent(req.user!.id);
  res.json({ parent: parentToFrontend(parent, parent.children.map(c => c.id)) });
});

parentRouter.get('/children', async (req, res) => {
  const parent = await getParent(req.user!.id);
  res.json({
    children: parent.children.map(c => studentToFrontend(c, { includeFeeAmount: false })),
  });
});

const childLeaveSchema = z.object({
  studentId: z.string(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(3),
});

parentRouter.post('/apply-leave', async (req, res) => {
  const parent = await getParent(req.user!.id);
  const { studentId, fromDate, toDate, reason } = childLeaveSchema.parse(req.body);
  const child = parent.children.find(c => c.id === studentId);
  if (!child) throw badRequest('This student is not linked to your account');
  if (toDate < fromDate) throw badRequest('toDate must be on or after fromDate');

  const leave = await prisma.leaveRequest.create({
    data: {
      kind: 'STUDENT',
      studentId: child.id,
      studentName: child.name,
      parentId: parent.id,
      parentName: parent.name,
      fromDate, toDate, reason,
      status: 'PENDING',
      submittedAt: todayISO(),
    },
  });
  res.json({ leave: leaveToFrontend(leave) });
});

parentRouter.get('/children/:id/attendance', async (req, res) => {
  const parent = await getParent(req.user!.id);
  if (!parent.children.some(c => c.id === String(req.params.id))) {
    throw badRequest('This student is not linked to your account');
  }
  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: String(req.params.id) },
    orderBy: { date: 'asc' },
  });
  res.json({ attendance: records.map(attendanceToFrontend) });
});

parentRouter.get('/children/:id/results', async (req, res) => {
  const parent = await getParent(req.user!.id);
  if (!parent.children.some(c => c.id === String(req.params.id))) {
    throw badRequest('This student is not linked to your account');
  }
  const results = await prisma.testResult.findMany({
    where: { studentId: String(req.params.id) },
    orderBy: { date: 'desc' },
  });
  res.json({ results: results.map(testResultToFrontend) });
});

parentRouter.get('/children/:id/leaves', async (req, res) => {
  const parent = await getParent(req.user!.id);
  if (!parent.children.some(c => c.id === String(req.params.id))) {
    throw badRequest('This student is not linked to your account');
  }
  const leaves = await prisma.leaveRequest.findMany({
    where: { kind: 'STUDENT', studentId: String(req.params.id) },
    orderBy: { submittedAt: 'desc' },
  });
  res.json({ leaves: leaves.map(leaveToFrontend) });
});
