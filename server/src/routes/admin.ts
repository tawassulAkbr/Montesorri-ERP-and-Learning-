import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { generatePassword, hashPassword } from '../services/password';
import { sendCredentialsEmail } from '../services/mail';
import { nextEmployeeId, nextEnrollmentId, nextRollNo } from '../services/ids';
import { deriveTeacherStatus, todayISO, eachWeekday } from '../services/attendance';
import { conflict, notFound, badRequest } from '../utils/errors';
import {
  teacherToFrontend, studentToFrontend, parentToFrontend,
  leaveToFrontend, notificationToFrontend,
} from '../utils/serializers';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('admin'));

// ─── Dashboard ────────────────────────────────────────────────────────────────
adminRouter.get('/dashboard', async (_req, res) => {
  const [teachers, students, parents, pendingLeaves, feeDueCount] = await Promise.all([
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.parent.count(),
    prisma.leaveRequest.findMany({ where: { status: 'PENDING', kind: 'TEACHER' }, orderBy: { submittedAt: 'desc' } }),
    prisma.student.count({ where: { feeDue: true } }),
  ]);
  res.json({
    totals: { teachers, students, parents, feeDueCount },
    pendingLeaves: pendingLeaves.map(leaveToFrontend),
  });
});

// ─── Teachers ─────────────────────────────────────────────────────────────────
const createTeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().min(3),
  phone: z.string().min(3),
  qualification: z.string().min(2),
  subject: z.string().min(2),
  classes: z.array(z.string()).min(1),
});

adminRouter.post('/teachers', async (req, res) => {
  const input = createTeacherSchema.parse(req.body);
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.credential.findUnique({ where: { email } });
  if (existing) throw conflict('A user with this email already exists');

  const password = generatePassword();
  const teacher = await prisma.$transaction(async tx => {
    const employeeId = await nextEmployeeId();
    const created = await tx.teacher.create({
      data: {
        name: input.name.trim(),
        email,
        phone: input.phone,
        qualification: input.qualification,
        subject: input.subject,
        classes: input.classes,
        employeeId,
      },
    });
    await tx.credential.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        role: 'TEACHER',
        userId: created.id,
      },
    });
    return created;
  });

  await sendCredentialsEmail({
    to: email,
    name: teacher.name,
    roleLabel: 'Teacher',
    email,
    password,
  });

  res.json({
    teacher: teacherToFrontend(teacher),
    issued: { role: 'teacher', name: teacher.name, email, password },
  });
});

adminRouter.get('/teachers', async (_req, res) => {
  const teachers = await prisma.teacher.findMany({ orderBy: { createdAt: 'asc' } });
  const date = todayISO();
  const withStatus = await Promise.all(
    teachers.map(async t => ({
      ...teacherToFrontend(t),
      todayStatus: await deriveTeacherStatus(t.id, date),
    })),
  );
  res.json({ teachers: withStatus });
});

// ─── Students (with automatic parent account) ────────────────────────────────
const createStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email('Student email is required'),
  phone: z.string().min(3),
  address: z.string().min(3),
  guardianName: z.string().min(2),
  guardianEmail: z.string().email('Guardian email is required'),
  guardianPhone: z.string().optional(),
  class: z.string().min(2),
  feeAmount: z.number().int().positive(),
});

adminRouter.post('/students', async (req, res) => {
  const input = createStudentSchema.parse(req.body);
  const studentEmail = input.email.trim().toLowerCase();
  const guardianEmail = input.guardianEmail.trim().toLowerCase();
  const guardianPhone = input.guardianPhone || input.phone;

  if (await prisma.credential.findUnique({ where: { email: studentEmail } })) {
    throw conflict('A user with the student email already exists');
  }

  const studentPassword = generatePassword();
  const ageGroup = input.class.includes('Toddler') ? '2-3 Years'
    : input.class.includes('Senior') ? '4-5 Years' : '3-4 Years';

  const result = await prisma.$transaction(async tx => {
    // Find or create the parent account
    const existingParent = await tx.parent.findFirst({
      where: { OR: [{ email: guardianEmail }, { phone: guardianPhone }] },
    });

    let parentId: string;
    let parentName: string;
    let parentPassword: string | undefined;

    if (existingParent) {
      parentId = existingParent.id;
      parentName = existingParent.name;
    } else {
      parentPassword = generatePassword();
      const createdParent = await tx.parent.create({
        data: { name: input.guardianName.trim(), email: guardianEmail, phone: guardianPhone },
      });
      parentId = createdParent.id;
      parentName = createdParent.name;
      await tx.credential.create({
        data: {
          email: guardianEmail,
          passwordHash: await hashPassword(parentPassword),
          role: 'PARENT',
          userId: createdParent.id,
        },
      });
    }

    const enrollmentId = await nextEnrollmentId();
    const rollNo = await nextRollNo(input.class);
    const student = await tx.student.create({
      data: {
        name: input.name.trim(),
        email: studentEmail,
        rollNo,
        enrollmentId,
        class: input.class,
        ageGroup,
        parentId,
        phone: input.phone,
        address: input.address,
        guardianName: input.guardianName.trim(),
        feeAmount: input.feeAmount,
        feeDue: false,
      },
    });

    await tx.credential.create({
      data: {
        email: studentEmail,
        passwordHash: await hashPassword(studentPassword),
        role: 'STUDENT',
        userId: student.id,
      },
    });

    return { student, parentName, parentPassword };
  });

  // Email credentials. The student's login goes to the student email, and is
  // ALSO forwarded to the parent/guardian so they can help the child sign in.
  await sendCredentialsEmail({
    to: studentEmail,
    name: result.student.name,
    roleLabel: 'Student',
    email: studentEmail,
    password: studentPassword,
  });
  if (guardianEmail !== studentEmail) {
    await sendCredentialsEmail({
      to: guardianEmail,
      name: result.student.name,
      roleLabel: 'Student',
      email: studentEmail,
      password: studentPassword,
    });
  }
  if (result.parentPassword) {
    await sendCredentialsEmail({
      to: guardianEmail,
      name: result.parentName,
      roleLabel: 'Parent',
      email: guardianEmail,
      password: result.parentPassword,
    });
  }

  const issued = [
    { role: 'student', name: result.student.name, email: studentEmail, password: studentPassword },
    result.parentPassword
      ? { role: 'parent', name: result.parentName, email: guardianEmail, password: result.parentPassword }
      : { role: 'parent', name: result.parentName, email: guardianEmail, password: '(existing account — password unchanged)' },
  ];

  res.json({
    student: studentToFrontend(result.student, { includeFeeAmount: true }),
    issued,
  });
});

adminRouter.get('/students', async (_req, res) => {
  const students = await prisma.student.findMany({ orderBy: [{ class: 'asc' }, { rollNo: 'asc' }] });
  res.json({ students: students.map(s => studentToFrontend(s, { includeFeeAmount: true })) });
});

adminRouter.get('/parents', async (_req, res) => {
  const parents = await prisma.parent.findMany({
    orderBy: { createdAt: 'asc' },
    include: { children: { select: { id: true } } },
  });
  res.json({ parents: parents.map(p => parentToFrontend(p, p.children.map(c => c.id))) });
});

// ─── Fee toggle (admin marks student red) ────────────────────────────────────
adminRouter.patch('/students/:id/fee-due', async (req, res) => {
  const due = z.object({ due: z.boolean() }).parse(req.body).due;
  const student = await prisma.student.findUnique({ where: { id: String(req.params.id) } });
  if (!student) throw notFound('Student not found');

  const now = new Date().toISOString();
  await prisma.$transaction([
    prisma.student.update({ where: { id: student.id }, data: { feeDue: due } }),
    prisma.notification.create({
      data: {
        userId: student.id, role: 'STUDENT',
        title: due ? 'Fee due' : 'Fee cleared',
        message: due
          ? 'A fee payment is due. Please contact the school office.'
          : 'Your fee record is now up to date.',
        type: due ? 'WARNING' : 'SUCCESS',
        kind: due ? 'FEE_DUE' : 'FEE_CLEARED',
        relatedStudentId: student.id,
      },
    }),
    prisma.notification.create({
      data: {
        userId: student.parentId, role: 'PARENT',
        title: due ? 'Fee due' : 'Fee cleared',
        message: due
          ? `A fee payment is due for ${student.name}. Please contact the school office.`
          : `The fee record for ${student.name} is now up to date.`,
        type: due ? 'WARNING' : 'SUCCESS',
        kind: due ? 'FEE_DUE' : 'FEE_CLEARED',
        relatedStudentId: student.id,
      },
    }),
  ]);
  res.json({ ok: true, feeDue: due });
});

// ─── Fee reminder (admin nudges student + parent) ────────────────────────────
adminRouter.post('/students/:id/fee-reminder', async (req, res) => {
  const student = await prisma.student.findUnique({ where: { id: String(req.params.id) } });
  if (!student) throw notFound('Student not found');

  await prisma.$transaction([
    prisma.notification.create({
      data: {
        userId: student.id, role: 'STUDENT',
        title: 'Fee reminder',
        message: 'Reminder: a fee payment is due. Please ask a parent/guardian to contact the school office.',
        type: 'WARNING', kind: 'FEE_DUE', relatedStudentId: student.id,
      },
    }),
    prisma.notification.create({
      data: {
        userId: student.parentId, role: 'PARENT',
        title: 'Fee reminder',
        message: `Reminder: a fee payment is due for ${student.name}. Please contact the school office.`,
        type: 'WARNING', kind: 'FEE_DUE', relatedStudentId: student.id,
      },
    }),
  ]);
  res.json({ ok: true });
});

// ─── Password reset (admin-generated, emailed) ───────────────────────────────
adminRouter.post('/users/:id/reset-password', async (req, res) => {
  const role = z.enum(['teacher', 'student', 'parent']).parse(req.body.role);
  const cred = await prisma.credential.findFirst({
    where: { userId: String(req.params.id), role: role.toUpperCase() as any },
  });
  if (!cred) throw notFound('Credential not found');

  const password = generatePassword();
  await prisma.credential.update({
    where: { id: cred.id },
    data: { passwordHash: await hashPassword(password) },
  });

  const name =
    role === 'teacher' ? (await prisma.teacher.findUnique({ where: { id: cred.userId } }))?.name
    : role === 'student' ? (await prisma.student.findUnique({ where: { id: cred.userId } }))?.name
    : (await prisma.parent.findUnique({ where: { id: cred.userId } }))?.name;

  await sendCredentialsEmail({
    to: cred.email,
    name: name || 'User',
    roleLabel: role.charAt(0).toUpperCase() + role.slice(1),
    email: cred.email,
    password,
  });

  res.json({ issued: { role, name: name || 'User', email: cred.email, password } });
});

// ─── Leave review ─────────────────────────────────────────────────────────────
adminRouter.get('/leaves', async (req, res) => {
  const status = z.enum(['pending', 'accepted', 'rejected', 'all']).default('pending').parse(req.query.status ?? 'pending');
  const where = { kind: 'TEACHER' as const, ...(status === 'all' ? {} : { status: status.toUpperCase() as any }) };
  const leaves = await prisma.leaveRequest.findMany({
    where,
    orderBy: { submittedAt: 'desc' },
  });
  res.json({ leaves: leaves.map(leaveToFrontend) });
});

adminRouter.patch('/leaves/:id', async (req, res) => {
  const { status } = z.object({ status: z.enum(['accepted', 'rejected']) }).parse(req.body);
  const leave = await prisma.leaveRequest.findUnique({ where: { id: String(req.params.id) } });
  if (!leave) throw notFound('Leave request not found');
  if (leave.kind !== 'TEACHER') throw badRequest('Student leave requests are reviewed by the class teacher');
  if (leave.status !== 'PENDING') throw badRequest('Leave request already reviewed');

  const ops: any[] = [
    prisma.leaveRequest.update({
      where: { id: leave.id },
      data: { status: status.toUpperCase() as any, respondedAt: todayISO(), respondedBy: req.user!.id },
    }),
  ];

  if (status === 'accepted') {
    const dates = eachWeekday(leave.fromDate, leave.toDate);
    for (const date of dates) {
      if (leave.kind === 'TEACHER' && leave.teacherId) {
        ops.push(prisma.teacherAttendanceRecord.upsert({
          where: { teacherId_date: { teacherId: leave.teacherId, date } },
          update: { status: 'LEAVE', leaveRequestId: leave.id },
          create: { teacherId: leave.teacherId, date, status: 'LEAVE', leaveRequestId: leave.id },
        }));
      } else if (leave.studentId) {
        ops.push(prisma.attendanceRecord.upsert({
          where: { studentId_date: { studentId: leave.studentId, date } },
          update: { status: 'LEAVE', leaveRequestId: leave.id, markedBy: req.user!.id },
          create: { studentId: leave.studentId, date, status: 'LEAVE', leaveRequestId: leave.id, markedBy: req.user!.id },
        }));
      }
    }
  }

  await prisma.$transaction(ops);
  const updated = await prisma.leaveRequest.findUniqueOrThrow({ where: { id: leave.id } });
  res.json({ leave: leaveToFrontend(updated) });
});
