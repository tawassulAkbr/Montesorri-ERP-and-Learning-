// Map Prisma rows to the exact response shapes the frontend types expect
// (src/types/index.ts): lowercase roles/enums, 'YYYY-MM-DD' date strings.
import type {
  Admin, Teacher, Student, Parent, Credential, Notification,
  Lesson, Test, TestResult, AttendanceRecord, TeacherAttendanceRecord,
  LeaveRequest, Remark, DailyWork, ScheduleItem, LiveClassSession,
} from '@prisma/client';

export const toRole = (role: string) => role.toLowerCase() as 'teacher' | 'student' | 'parent' | 'admin';
export const toDate = (d: Date | string) => (typeof d === 'string' ? d : d.toISOString().slice(0, 10));

export interface FrontendTeacher {
  id: string; name: string; email: string; role: 'teacher'; createdAt: string;
  subject: string; employeeId: string; classes: string[]; phone: string; qualification: string;
}

export interface FrontendStudent {
  id: string; name: string; email: string; role: 'student'; createdAt: string;
  rollNo: string; class: string; ageGroup?: string; parentId: string; enrollmentId: string;
  phone: string; address: string; guardianName: string; feeAmount?: number; feeDue: boolean;
}

export interface FrontendParent {
  id: string; name: string; email: string; role: 'parent'; createdAt: string;
  childrenIds: string[]; phone: string;
}

export function teacherToFrontend(t: Teacher): FrontendTeacher {
  return {
    id: t.id, name: t.name, email: t.email, role: 'teacher', createdAt: toDate(t.createdAt),
    subject: t.subject, employeeId: t.employeeId, classes: t.classes,
    phone: t.phone, qualification: t.qualification,
  };
}

export function studentToFrontend(s: Student, opts: { includeFeeAmount: boolean }): FrontendStudent {
  return {
    id: s.id, name: s.name, email: s.email, role: 'student', createdAt: toDate(s.createdAt),
    rollNo: s.rollNo, class: s.class, ageGroup: s.ageGroup ?? undefined, parentId: s.parentId,
    enrollmentId: s.enrollmentId, phone: s.phone, address: s.address, guardianName: s.guardianName,
    feeAmount: opts.includeFeeAmount ? s.feeAmount : undefined, feeDue: s.feeDue,
  };
}

export function parentToFrontend(p: Parent, childrenIds: string[]): FrontendParent {
  return {
    id: p.id, name: p.name, email: p.email, role: 'parent', createdAt: toDate(p.createdAt),
    childrenIds, phone: p.phone,
  };
}

export function adminToFrontend(a: Admin) {
  return {
    id: a.id, name: a.name, email: a.email, role: 'admin' as const, createdAt: toDate(a.createdAt),
    adminCode: a.adminCode,
  };
}

export function notificationToFrontend(n: Notification) {
  return {
    id: n.id, userId: n.userId, title: n.title, message: n.message,
    type: n.type.toLowerCase() as 'info' | 'success' | 'warning' | 'error',
    read: n.read, createdAt: n.createdAt.toISOString(),
    kind: n.kind.toLowerCase() as 'fee_due' | 'fee_cleared' | 'general',
    relatedStudentId: n.relatedStudentId ?? undefined,
  };
}

export function lessonToFrontend(l: Lesson) {
  return { ...l, notes: l.notes ?? undefined };
}

export function testToFrontend(t: Test) {
  return {
    ...t,
    status: t.status as 'upcoming' | 'published' | 'evaluated',
  };
}

export function testResultToFrontend(r: TestResult) {
  return {
    ...r,
    grade: r.grade as 'A+' | 'A' | 'B' | 'C' | 'D' | 'F',
    milestoneStatus: (r.milestoneStatus ?? undefined) as 'Mastered' | 'Developing' | 'Emerging' | undefined,
    teacherComment: r.teacherComment ?? undefined,
  };
}

export function attendanceToFrontend(a: AttendanceRecord) {
  return {
    ...a,
    status: a.status.toLowerCase() as 'present' | 'absent' | 'leave' | 'holiday',
    leaveRequestId: a.leaveRequestId ?? undefined,
  };
}

export function teacherAttendanceToFrontend(a: TeacherAttendanceRecord) {
  return {
    ...a,
    status: a.status.toLowerCase() as 'present' | 'absent' | 'leave' | 'holiday',
    leaveRequestId: a.leaveRequestId ?? undefined,
  };
}

export function leaveToFrontend(l: LeaveRequest) {
  return {
    ...l,
    kind: l.kind.toLowerCase() as 'student' | 'teacher',
    status: l.status.toLowerCase() as 'pending' | 'accepted' | 'rejected',
    studentId: l.studentId ?? undefined,
    studentName: l.studentName ?? undefined,
    parentId: l.parentId ?? undefined,
    parentName: l.parentName ?? undefined,
    teacherId: l.teacherId ?? undefined,
    teacherName: l.teacherName ?? undefined,
    respondedAt: l.respondedAt ?? undefined,
    respondedBy: l.respondedBy ?? undefined,
  };
}

export function remarkToFrontend(r: Remark) {
  return { ...r, type: r.type.toLowerCase() as 'positive' | 'constructive' | 'concern' };
}

export function dailyWorkToFrontend(d: DailyWork) {
  return {
    ...d,
    attachmentName: d.attachmentName ?? undefined,
    visibleTo: d.visibleTo as ('students' | 'parents')[],
  };
}

export function scheduleToFrontend(s: ScheduleItem) {
  return {
    ...s,
    category: s.category.toLowerCase() as
      | 'circle_time' | 'phonics' | 'sensorial' | 'math' | 'snack_break'
      | 'art_craft' | 'outdoor_play' | 'storytelling' | 'live_class',
    roomOrLink: s.roomOrLink ?? undefined,
  };
}

export function liveClassToFrontend(s: LiveClassSession) {
  return {
    isActive: s.isActive,
    topic: s.topic,
    subject: s.subject,
    class: s.class,
    teacherName: s.teacherName,
    startedAt: s.startedAt,
    participantsCount: s.participantsCount,
  };
}
