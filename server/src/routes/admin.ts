import { Router } from 'express';
import { z } from 'zod';
import type { EmploymentStatus, Role, LeaveStatus } from '@prisma/client';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { generatePassword, hashPassword } from '../services/password';
import { sendCredentialsEmail } from '../services/mail';
import { nextEmployeeId, nextEnrollmentId, nextRollNo } from '../services/ids';
import { deriveTeacherStatus, todayISO, eachWeekday } from '../services/attendance';
import { conflict, notFound, badRequest } from '../utils/errors';
import { schoolOf } from '../utils/tenant';
import {
  teacherToFrontend, studentToFrontend, parentToFrontend,
  leaveToFrontend,
} from '../utils/serializers';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('admin'));

// ─── Dashboard ────────────────────────────────────────────────────────────────
adminRouter.get('/dashboard', async (req, res) => {
  const schoolId = schoolOf(req);
  const [teachers, students, parents, pendingLeaves, feeDueCount, inventoryItems] = await Promise.all([
    prisma.teacher.count({ where: { schoolId } }),
    prisma.student.count({ where: { schoolId } }),
    prisma.parent.count({ where: { schoolId } }),
    prisma.leaveRequest.findMany({
      where: { status: 'PENDING', kind: 'TEACHER', teacher: { schoolId } },
      orderBy: { submittedAt: 'desc' },
    }),
    prisma.student.count({ where: { schoolId, feeDue: true } }),
    prisma.inventoryItem.findMany({ where: { schoolId }, select: { quantity: true, minStock: true } }),
  ]);
  res.json({
    totals: {
      teachers, students, parents, feeDueCount,
      inventoryItems: inventoryItems.length,
      lowStockCount: inventoryItems.filter(i => i.quantity <= i.minStock).length,
    },
    pendingLeaves: pendingLeaves.map(leaveToFrontend),
  });
});

// ─── Teachers ─────────────────────────────────────────────────────────────────
const EMPLOYMENT_STATUSES = ['active', 'on_leave', 'resigned'] as const;
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const slugEmail = (name: string, domain: string) =>
  `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '')}@${domain}`;

const createTeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().optional(),
  personalEmail: z.string().email().optional(),
  phone: z.string().min(3),
  qualification: z.string().min(2),
  subject: z.string().min(2),
  classes: z.array(z.string()).min(1),
  status: z.enum(EMPLOYMENT_STATUSES).optional(),
  joinDate: isoDate.optional(),
});

const updateTeacherSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(3).optional(),
  qualification: z.string().min(2).optional(),
  subject: z.string().min(2).optional(),
  classes: z.array(z.string()).min(1).optional(),
  status: z.enum(EMPLOYMENT_STATUSES).optional(),
  joinDate: isoDate.nullable().optional(),
});

const toEmploymentStatus = (s: (typeof EMPLOYMENT_STATUSES)[number]) => s.toUpperCase() as EmploymentStatus;

adminRouter.post('/teachers', async (req, res) => {
  const schoolId = schoolOf(req);
  const input = createTeacherSchema.parse(req.body);
  const email = slugEmail(input.name, 'faculty.kinderguide.com');

  const existing = await prisma.credential.findUnique({ where: { email } });
  if (existing) throw conflict('A user with this email already exists');
  const existingTeacher = await prisma.teacher.findFirst({ where: { email } });
  if (existingTeacher) throw conflict('A teacher with this email already exists');

  const password = generatePassword();
  const teacher = await prisma.$transaction(async tx => {
    const employeeId = await nextEmployeeId(schoolId);
    const created = await tx.teacher.create({
      data: {
        name: input.name.trim(),
        email,
        phone: input.phone,
        qualification: input.qualification,
        subject: input.subject,
        classes: input.classes,
        employeeId,
        schoolId,
        status: input.status ? toEmploymentStatus(input.status) : 'ACTIVE',
        joinDate: input.joinDate,
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
    to: input.personalEmail || email,
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

adminRouter.get('/teachers', async (req, res) => {
  const schoolId = schoolOf(req);
  const teachers = await prisma.teacher.findMany({ where: { schoolId }, orderBy: { createdAt: 'asc' } });
  const date = todayISO();
  const withStatus = await Promise.all(
    teachers.map(async t => ({
      ...teacherToFrontend(t),
      todayStatus: await deriveTeacherStatus(t.id, date),
    })),
  );
  res.json({ teachers: withStatus });
});

adminRouter.patch('/teachers/:id', async (req, res) => {
  const schoolId = schoolOf(req);
  const input = updateTeacherSchema.parse(req.body);
  const owned = await prisma.teacher.findFirst({ where: { id: req.params.id, schoolId } });
  if (!owned) throw notFound('Teacher not found');

  const teacher = await prisma.teacher.update({
    where: { id: owned.id },
    data: {
      ...(input.name && { name: input.name.trim() }),
      ...(input.phone && { phone: input.phone.trim() }),
      ...(input.qualification && { qualification: input.qualification.trim() }),
      ...(input.subject && { subject: input.subject.trim() }),
      ...(input.classes && { classes: input.classes }),
      ...(input.status && { status: toEmploymentStatus(input.status) }),
      ...(input.joinDate !== undefined && { joinDate: input.joinDate }),
    },
  });
  res.json({ teacher: teacherToFrontend(teacher) });
});

// ─── Students (with automatic parent account) ────────────────────────────────
const createStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  personalEmail: z.string().email().optional(),
  phone: z.string().min(3),
  address: z.string().min(3),
  guardianName: z.string().min(2),
  guardianEmail: z.string().email().optional(),
  guardianPhone: z.string().optional(),
  class: z.string().min(2),
  feeAmount: z.number().int().positive(),
});

adminRouter.post('/students', async (req, res) => {
  const schoolId = schoolOf(req);
  const input = createStudentSchema.parse(req.body);
  const studentEmail = input.email ? input.email.trim().toLowerCase() : slugEmail(input.name, 'kinderguide.com');
  const guardianEmail = input.guardianEmail ? input.guardianEmail.trim().toLowerCase() : slugEmail(input.guardianName, 'parent.kinderguide.com');
  const guardianPhone = input.guardianPhone || input.phone;

  if (await prisma.credential.findUnique({ where: { email: studentEmail } })) {
    throw conflict('A user with the student email already exists');
  }
  if (await prisma.student.findFirst({ where: { email: studentEmail } })) {
    throw conflict('A student with this email already exists');
  }

  const studentPassword = generatePassword();
  const ageGroup = input.class.includes('1.5 - 3') ? 'Ages 1.5 - 3'
    : input.class.includes('3 - 6') ? 'Ages 3 - 6'
      : input.class.includes('6 - 9') ? 'Ages 6 - 9'
        : input.class.includes('9 - 12') ? 'Ages 9 - 12' : undefined;

  const result = await prisma.$transaction(async tx => {
    // Find or create the parent account (scoped to this school)
    const existingParent = await tx.parent.findFirst({
      where: { schoolId, OR: [{ email: guardianEmail }, { phone: guardianPhone }] },
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
        data: { name: input.guardianName.trim(), email: guardianEmail, phone: guardianPhone, schoolId },
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

    const enrollmentId = await nextEnrollmentId(schoolId);
    const rollNo = await nextRollNo(schoolId, input.class);
    const student = await tx.student.create({
      data: {
        name: input.name.trim(),
        email: studentEmail,
        rollNo,
        enrollmentId,
        class: input.class,
        ageGroup,
        parentId,
        schoolId,
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

  const targetEmail = input.personalEmail || guardianEmail;

  // Send Student credentials
  await sendCredentialsEmail({
    to: targetEmail,
    name: result.student.name,
    roleLabel: 'Student',
    email: studentEmail,
    password: studentPassword,
  });

  // Send Parent credentials if a new parent was created
  if (result.parentPassword) {
    await sendCredentialsEmail({
      to: targetEmail,
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

adminRouter.get('/students', async (req, res) => {
  const schoolId = schoolOf(req);
  const students = await prisma.student.findMany({
    where: { schoolId },
    orderBy: [{ class: 'asc' }, { rollNo: 'asc' }],
  });
  res.json({ students: students.map(s => studentToFrontend(s, { includeFeeAmount: true })) });
});

adminRouter.get('/parents', async (req, res) => {
  const schoolId = schoolOf(req);
  const parents = await prisma.parent.findMany({
    where: { schoolId },
    orderBy: { createdAt: 'asc' },
    include: { children: { select: { id: true } } },
  });
  res.json({ parents: parents.map(p => parentToFrontend(p, p.children.map(c => c.id))) });
});

// ─── Fee toggle (admin marks student red) ────────────────────────────────────
adminRouter.patch('/students/:id/fee-due', async (req, res) => {
  const schoolId = schoolOf(req);
  const due = z.object({ due: z.boolean() }).parse(req.body).due;
  const student = await prisma.student.findFirst({ where: { id: String(req.params.id), schoolId } });
  if (!student) throw notFound('Student not found');

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
  const schoolId = schoolOf(req);
  const student = await prisma.student.findFirst({ where: { id: String(req.params.id), schoolId } });
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
  const schoolId = schoolOf(req);
  const role = z.enum(['teacher', 'student', 'parent']).parse(req.body.role);
  const cred = await prisma.credential.findFirst({
    where: { userId: String(req.params.id), role: role.toUpperCase() as Role },
  });
  if (!cred) throw notFound('Credential not found');

  // Verify the user belongs to this school
  const belongsToSchool =
    role === 'teacher' ? await prisma.teacher.findFirst({ where: { id: cred.userId, schoolId } })
    : role === 'student' ? await prisma.student.findFirst({ where: { id: cred.userId, schoolId } })
    : await prisma.parent.findFirst({ where: { id: cred.userId, schoolId } });
  if (!belongsToSchool) throw notFound('User not found in this school');

  const password = generatePassword();
  await prisma.credential.update({
    where: { id: cred.id },
    data: { passwordHash: await hashPassword(password) },
  });

  const name = belongsToSchool.name || 'User';

  await sendCredentialsEmail({
    to: cred.email,
    name,
    roleLabel: role.charAt(0).toUpperCase() + role.slice(1),
    email: cred.email,
    password,
  });

  res.json({ issued: { role, name, email: cred.email, password } });
});

// ─── Leave review ─────────────────────────────────────────────────────────────
adminRouter.get('/leaves', async (req, res) => {
  const schoolId = schoolOf(req);
  const status = z.enum(['pending', 'accepted', 'rejected', 'all']).default('pending').parse(req.query.status ?? 'pending');
  const where = {
    kind: 'TEACHER' as const,
    teacher: { schoolId },
    ...(status === 'all' ? {} : { status: status.toUpperCase() as LeaveStatus }),
  };
  const leaves = await prisma.leaveRequest.findMany({
    where,
    orderBy: { submittedAt: 'desc' },
  });
  res.json({ leaves: leaves.map(leaveToFrontend) });
});

adminRouter.patch('/leaves/:id', async (req, res) => {
  const schoolId = schoolOf(req);
  const { status } = z.object({ status: z.enum(['accepted', 'rejected']) }).parse(req.body);
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: String(req.params.id) },
    include: { teacher: { select: { schoolId: true } } },
  });
  if (!leave) throw notFound('Leave request not found');
  if (leave.kind !== 'TEACHER') throw badRequest('Student leave requests are reviewed by the class teacher');
  if (leave.teacher?.schoolId !== schoolId) throw notFound('Leave request not found');
  if (leave.status !== 'PENDING') throw badRequest('Leave request already reviewed');

  const ops: ReturnType<typeof prisma.leaveRequest.update | typeof prisma.teacherAttendanceRecord.upsert | typeof prisma.attendanceRecord.upsert>[] = [
    prisma.leaveRequest.update({
      where: { id: leave.id },
      data: { status: status.toUpperCase() as LeaveStatus, respondedAt: todayISO(), respondedBy: req.user!.id },
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