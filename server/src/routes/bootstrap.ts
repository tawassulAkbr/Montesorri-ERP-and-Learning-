import { Router } from 'express';
import type {
  Student, Notification, TeacherAttendanceRecord, AttendanceRecord,
  TestResult, LeaveRequest, Remark,
} from '@prisma/client';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { notFound } from '../utils/errors';
import { schoolOf } from '../utils/tenant';
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
  const schoolId = schoolOf(req);

  const [teachers, parents, allLessons, allTests, allDailyWork, schedules] = await Promise.all([
    prisma.teacher.findMany({ where: { schoolId }, orderBy: { createdAt: 'asc' } }),
    prisma.parent.findMany({ where: { schoolId }, orderBy: { createdAt: 'asc' }, include: { children: { select: { id: true } } } }),
    prisma.lesson.findMany({ where: { schoolId }, orderBy: { uploadedAt: 'desc' } }),
    prisma.test.findMany({ where: { teacher: { schoolId } }, orderBy: { date: 'desc' } }),
    prisma.dailyWork.findMany({ where: { teacher: { schoolId } }, orderBy: { postedAt: 'desc' } }),
    prisma.scheduleItem.findMany({ where: { schoolId } }),
  ]);

  // LiveClassSession upsert is separate so a FK error (e.g. stale schoolId)
  // doesn't crash the entire bootstrap query.
  let liveClass: Awaited<ReturnType<typeof prisma.liveClassSession.findUnique>>;
  try {
    liveClass = await prisma.liveClassSession.upsert({
      where: { schoolId },
      update: {},
      create: { schoolId },
    });
  } catch {
    liveClass = await prisma.liveClassSession.findUnique({ where: { schoolId } });
  }

  let students: Student[];
  let lessons = allLessons;
  let tests = allTests;
  let dailyWork = allDailyWork;
  let notifications: Notification[];
  let teacherAttendance: TeacherAttendanceRecord[];
  let attendance: AttendanceRecord[];
  let testResults: TestResult[];
  let leaveRequests: LeaveRequest[];
  let remarks: Remark[];

  if (role === 'admin') {
    [students, notifications, teacherAttendance, attendance, testResults, leaveRequests, remarks] = await Promise.all([
      prisma.student.findMany({ where: { schoolId }, orderBy: [{ class: 'asc' }, { rollNo: 'asc' }] }),
      prisma.notification.findMany({ where: { userId, role: 'ADMIN' }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.teacherAttendanceRecord.findMany({ where: { teacher: { schoolId } } }),
      prisma.attendanceRecord.findMany({ where: { student: { schoolId } } }),
      prisma.testResult.findMany({ where: { student: { schoolId } }, orderBy: { date: 'desc' } }),
      prisma.leaveRequest.findMany({ where: { kind: 'TEACHER', teacher: { schoolId } }, orderBy: { submittedAt: 'desc' } }),
      prisma.remark.findMany({ where: { student: { schoolId } }, orderBy: { createdAt: 'desc' } }),
    ]);
  } else if (role === 'teacher') {
    const teacher = await prisma.teacher.findUnique({ where: { id: userId } });
    if (!teacher) throw notFound('Teacher record not found');
    lessons = allLessons.filter(l => l.teacherId === teacher.id);
    tests = allTests.filter(t => t.teacherId === teacher.id);
    dailyWork = allDailyWork.filter(d => d.teacherId === teacher.id);
    [students, notifications, teacherAttendance, attendance, testResults, leaveRequests, remarks] = await Promise.all([
      prisma.student.findMany({
        where: { schoolId, class: { in: teacher.classes } },
        orderBy: [{ class: 'asc' }, { rollNo: 'asc' }],
      }),
      prisma.notification.findMany({ where: { userId, role: 'TEACHER' }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.teacherAttendanceRecord.findMany({ where: { teacher: { schoolId } } }),
      prisma.attendanceRecord.findMany({ where: { markedBy: teacher.id, student: { schoolId, class: { in: teacher.classes } } } }),
      prisma.testResult.findMany({ where: { test: { teacherId: teacher.id }, student: { schoolId, class: { in: teacher.classes } } }, orderBy: { date: 'desc' } }),
      prisma.leaveRequest.findMany({
        where: {
          OR: [
            { kind: 'TEACHER', teacherId: userId },
            { kind: 'STUDENT', student: { schoolId, class: { in: teacher.classes } } },
          ],
        },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.remark.findMany({ where: { student: { schoolId, class: { in: teacher.classes } } }, orderBy: { createdAt: 'desc' } }),
    ]);
  } else if (role === 'student') {
    [students, notifications, attendance, testResults, leaveRequests, remarks] = await Promise.all([
      prisma.student.findMany({ where: { id: userId, schoolId } }),
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
      where: { id: userId, schoolId },
      include: { children: true },
    });
    if (!parent) throw notFound('Parent record not found');
    const childIds = parent.children.map(c => c.id);
    [students, notifications, attendance, testResults, leaveRequests, remarks] = await Promise.all([
      prisma.student.findMany({ where: { parentId: userId, schoolId }, orderBy: [{ class: 'asc' }, { rollNo: 'asc' }] }),
      prisma.notification.findMany({ where: { userId, role: 'PARENT' }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.attendanceRecord.findMany({ where: { studentId: { in: childIds } } }),
      prisma.testResult.findMany({ where: { studentId: { in: childIds } }, orderBy: { date: 'desc' } }),
      prisma.leaveRequest.findMany({ where: { kind: 'STUDENT', studentId: { in: childIds } }, orderBy: { submittedAt: 'desc' } }),
      prisma.remark.findMany({ where: { studentId: { in: childIds } }, orderBy: { createdAt: 'desc' } }),
    ]);
    teacherAttendance = [];
  }

  // Students never see fee amounts; parents pay them, so they get their own child's figure.
  const includeFee = role === 'admin' || role === 'parent';

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
    liveClass: liveClass ? liveClassToFrontend(liveClass) : { isActive: false, isLive: false, topic: '', subject: '', class: '', teacherName: '', startedAt: '', participantsCount: 0 },
  });
});
