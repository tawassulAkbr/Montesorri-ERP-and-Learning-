import { Router } from 'express';
import { z } from 'zod';
import type { PaymentMethod } from '@prisma/client';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { nextReceiptNo } from '../services/ids';
import { notFound } from '../utils/errors';
import { schoolOf } from '../utils/tenant';
import { paymentToFrontend } from '../utils/serializers';

export const financeRouter = Router();
financeRouter.use(requireAuth, requireRole('admin'));

const STUDENT_SELECT = {
  name: true, class: true, rollNo: true, enrollmentId: true, guardianName: true,
} as const;
const SCHOOL_SELECT = { name: true, city: true, address: true, phone: true } as const;

const recordPaymentSchema = z.object({
  studentId: z.string().min(1),
  amount: z.number().int().positive().max(1_000_000),
  method: z.enum(['cash', 'bank_transfer', 'jazzcash', 'easypaisa']),
  term: z.string().min(2).max(60),
  note: z.string().max(200).optional(),
});

async function adminNamesFor(receivedByIds: string[]): Promise<Map<string, string>> {
  const ids = [...new Set(receivedByIds)];
  if (!ids.length) return new Map();
  const admins = await prisma.admin.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
  return new Map(admins.map(a => [a.id, a.name]));
}

// ─── Ledger ──────────────────────────────────────────────────────────────────
financeRouter.get('/payments', async (req, res) => {
  const schoolId = schoolOf(req);
  const studentId = typeof req.query.studentId === 'string' && req.query.studentId ? req.query.studentId : undefined;

  const payments = await prisma.payment.findMany({
    where: { schoolId, ...(studentId ? { studentId } : {}) },
    include: { student: { select: STUDENT_SELECT }, school: { select: SCHOOL_SELECT } },
    orderBy: [{ createdAt: 'desc' }, { receiptNo: 'desc' }],
    take: 200,
  });
  const names = await adminNamesFor(payments.map(p => p.receivedById));
  res.json({
    payments: payments.map(p => ({
      ...paymentToFrontend(p),
      receivedByName: names.get(p.receivedById) ?? 'School Office',
    })),
  });
});

// ─── Record a payment ─────────────────────────────────────────────────────────
financeRouter.post('/payments', async (req, res) => {
  const schoolId = schoolOf(req);
  const input = recordPaymentSchema.parse(req.body);

  const student = await prisma.student.findFirst({ where: { id: input.studentId, schoolId } });
  if (!student) throw notFound('Student not found');

  const created = await prisma.$transaction(async tx => {
    const receiptNo = await nextReceiptNo(schoolId);
    const payment = await tx.payment.create({
      data: {
        receiptNo,
        schoolId,
        studentId: student.id,
        amount: input.amount,
        method: input.method.toUpperCase() as PaymentMethod,
        term: input.term.trim(),
        note: input.note?.trim() || null,
        receivedById: req.user!.id,
      },
    });

    await tx.student.update({ where: { id: student.id }, data: { feeDue: false } });

    const amountText = `Rs ${input.amount.toLocaleString('en-PK')}`;
    await tx.notification.createMany({
      data: [
        {
          userId: student.parentId, role: 'PARENT',
          title: 'Fee payment received',
          message: `We received ${amountText} for ${student.name} (${input.term}). Receipt ${receiptNo}.`,
          type: 'SUCCESS', kind: 'FEE_CLEARED', relatedStudentId: student.id,
        },
        {
          userId: student.id, role: 'STUDENT',
          title: 'Fee payment received',
          message: `Your fee for ${input.term} has been paid. Receipt ${receiptNo}.`,
          type: 'SUCCESS', kind: 'FEE_CLEARED', relatedStudentId: student.id,
        },
      ],
    });

    return payment;
  });

  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: created.id },
    include: { student: { select: STUDENT_SELECT }, school: { select: SCHOOL_SELECT } },
  });
  const names = await adminNamesFor([payment.receivedById]);
  res.status(201).json({
    payment: {
      ...paymentToFrontend(payment),
      receivedByName: names.get(payment.receivedById) ?? 'School Office',
    },
    feeDue: false,
  });
});

// ─── Income report ────────────────────────────────────────────────────────────
function monthWindows(count: number) {
  const now = new Date();
  const windows = [];
  for (let i = count - 1; i >= 0; i--) {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const to = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1));
    windows.push({
      key: from.toISOString().slice(0, 7),
      label: from.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
      from, to, amount: 0, count: 0,
    });
  }
  return windows;
}

financeRouter.get('/summary', async (req, res) => {
  const schoolId = schoolOf(req);
  const months = monthWindows(6);

  const [recent, lifetime, students, outstanding, byMethod] = await Promise.all([
    prisma.payment.findMany({
      where: { schoolId, createdAt: { gte: months[0].from } },
      select: { amount: true, createdAt: true },
    }),
    prisma.payment.aggregate({ where: { schoolId }, _sum: { amount: true } }),
    prisma.student.aggregate({
      where: { schoolId }, _count: { _all: true }, _avg: { feeAmount: true },
    }),
    prisma.student.aggregate({
      where: { schoolId, feeDue: true },
      _sum: { feeAmount: true }, _count: { _all: true },
    }),
    prisma.payment.groupBy({
      by: ['method'], where: { schoolId }, _sum: { amount: true },
    }),
  ]);

  for (const p of recent) {
    const key = p.createdAt.toISOString().slice(0, 7);
    const bucket = months.find(m => m.key === key);
    if (bucket) { bucket.amount += p.amount; bucket.count += 1; }
  }

  res.json({
    months: months.map(({ key, label, amount, count }) => ({ key, label, amount, count })),
    collectedThisMonth: months[months.length - 1].amount,
    collectedTotal: lifetime._sum.amount ?? 0,
    outstandingCount: outstanding._count._all,
    outstandingAmount: outstanding._sum.feeAmount ?? 0,
    totalStudents: students._count._all,
    avgFee: Math.round(students._avg.feeAmount ?? 0),
    byMethod: byMethod.map(m => ({
      method: m.method.toLowerCase() as 'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa',
      amount: m._sum.amount ?? 0,
    })),
  });
});
