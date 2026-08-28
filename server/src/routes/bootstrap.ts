import { Router } from 'express';
import type {
  Student, Notification, TeacherAttendanceRecord, AttendanceRecord,
  TestResult, LeaveRequest, Remark,
} from '@prisma/client';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { notFound } from '../utils/errors';
import {
  teacherToFrontend, studentToFrontend, parentToFrontend, adminToFrontend,
  notificationToFrontend, teacherAttendanceToFrontend, attendanceToFrontend,
  leaveToFrontend, lessonToFrontend, testToFrontend, testResultToFrontend,
  remarkToFrontend, dailyWorkToFrontend, scheduleToFrontend, liveClassToFrontend,
} from '../utils/serializers';

export const bootstrapRouter = Router();

// Single role-aware hydration endpoint for the frontend's DataContext.
bootstrapRouter.get('/', requireAuth, async (req, res) => {
  const { id: userId, role } = req.user!;

  const [teachers, parents, lessons, tests, dailyWork, schedules, liveClass] = await Promise.all([
    prisma.teacher.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.parent.findMany({ orderBy: { createdAt: 'asc' }, include: { children: { select: { id: true } } } }),
    prisma.lesson.findMany({ orderBy: { uploadedAt: 'desc' } }),
    prisma.test.findMany({ orderBy: { date: 'desc' } }),
    prisma.dailyWork.findMany({ orderBy: { postedAt: 'desc' } }),
    prisma.scheduleItem.findMany(),
    prisma.liveClassSession.upsert({ where: { id: 'singleton' }, update: {}, create: { id: 'singleton' } }),
  ]);

  let students: Student[];
  let notifications: Notification[];
  let teacherAttendance: TeacherAttendanceRecord[];
  let attendance: AttendanceRecord[];
  let testResults: TestResult[];
  let leaveRequests: LeaveRequest[];
  let remarks: Remark[];

  if (role === 'admin') {
    [students, notifications, teacherAttendance, attendance, testResults, leaveRequests, remarks] = await Promise.all([
      prisma.student.findMany({ orderBy: [{ class: 'asc' }, { rollNo: 'asc' }] }),
      prisma.notification.findMany({ where: { userId, role: 'ADMIN' }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.teacherAttendanceRecord.findMany(),
      prisma.attendanceRecord.findMany(),
      prisma.testResult.findMany({ orderBy: { date: 'desc' } }),
      prisma.leaveRequest.findMany({ orderBy: { submittedAt: 'desc' } }),
      prisma.remark.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);
  } else if (role === 'teacher') {
    const teacher = await prisma.teacher.findUnique({ where: { id: userId } });
    if (!teacher) throw notFound('Teacher record not found');
    [students, notifications, teacherAttendance, attendance, testResults, leaveRequests, remarks] = await Promise.all([
      prisma.student.findMany({
        where: { class: { in: teacher.classes } },
        orderBy: [{ class: 'asc' }, { rollNo: 'asc' }],
      }),
      prisma.notification.findMany({ where: { userId, role: 'TEACHER' }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.teacherAttendanceRecord.findMany(),
      prisma.attendanceRecord.findMany({ where: { student: { class: { in: teacher.classes } } } }),
      prisma.testResult.findMany({ where: { student: { class: { in: teacher.classes } } }, orderBy: { date: 'desc' } }),
      prisma.leaveRequest.findMany({
        where: {
          OR: [
            { kind: 'TEACHER', teacherId: userId },
            { kind: 'STUDENT', student: { class: { in: teacher.classes } } },
          ],
        },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.remark.findMany({ where: { student: { class: { in: teacher.classes } } }, orderBy: { createdAt: 'desc' } }),
    ]);
  } else if (role === 'student') {
    [students, notifications, attendance, testResults, leaveRequests, remarks] = await Promise.all([
      prisma.student.findMany({ where: { id: userId } }),
      prisma.notification.findMany({ where: { userId, role: 'STUDENT' }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.attendanceRecord.findMany({ where: { studentId: userId } }),
      prisma.testResult.findMany({ where: { studentId: userId }, orderBy: { date: 'desc' } }),
      prisma.leaveRequest.findMany({ where: { kind: 'STUDENT', studentId: userId }, orderBy: { submittedAt: 'desc' } }),
      prisma.remark.findMany({ where: { studentId: userId }, orderBy: { createdAt: 'desc' } }),
    ]);
    teacherAttendance = [];
  } else {
    // parent — child-scoped views
    const parent = await prisma.parent.findUnique({
      where: { id: userId },
      include: { children: true },
    });
    if (!parent) throw notFound('Parent record not found');
    const childIds = parent.children.map(c => c.id);
    [students, notifications, attendance, testResults, leaveRequests, remarks] = await Promise.all([
      prisma.student.findMany({ where: { parentId: userId }, orderBy: [{ class: 'asc' }, { rollNo: 'asc' }] }),
      prisma.notification.findMany({ where: { userId, role: 'PARENT' }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.attendanceRecord.findMany({ where: { studentId: { in: childIds } } }),
      prisma.testResult.findMany({ where: { studentId: { in: childIds } }, orderBy: { date: 'desc' } }),
      prisma.leaveRequest.findMany({ where: { kind: 'STUDENT', studentId: { in: childIds } }, orderBy: { submittedAt: 'desc' } }),
      prisma.remark.findMany({ where: { studentId: { in: childIds } }, orderBy: { createdAt: 'desc' } }),
    ]);
    teacherAttendance = [];
  }

  const includeFee = role === 'admin';

  res.json({
    admins: role === 'admin' ? [adminToFrontend(await prisma.admin.findUniqueOrThrow({ where: { id: userId } }))] : [],
    teachers: teachers.map(teacherToFrontend),
    students: students.map(s => studentToFrontend(s, { includeFeeAmount: includeFee })),
    parents: role === 'admin' || role === 'parent' || role === 'teacher'
      ? parents.map(p => parentToFrontend(p, p.children.map(c => c.id)))
      : [],
    notifications: notifications.map(notificationToFrontend),
    teacherAttendance: teacherAttendance.map(teacherAttendanceToFrontend),
    lessons: lessons.map(lessonToFrontend),
    tests: tests.map(testToFrontend),
    testResults: testResults.map(testResultToFrontend),
    attendance: attendance.map(attendanceToFrontend),
    leaveRequests: leaveRequests.map(leaveToFrontend),
    remarks: remarks.map(remarkToFrontend),
    dailyWork: dailyWork.map(dailyWorkToFrontend),
    schedules: schedules.map(scheduleToFrontend),
    liveClass: liveClassToFrontend(liveClass),
  });
});
