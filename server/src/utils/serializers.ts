// Map Prisma rows to the exact response shapes the frontend types expect
// (src/types/index.ts): lowercase roles/enums, 'YYYY-MM-DD' date strings.
import type {
  Admin, Teacher, Student, Parent, Credential, Notification,
  Lesson, Test, TestResult, AttendanceRecord, TeacherAttendanceRecord,
  LeaveRequest, Remark, DailyWork, ScheduleItem, LiveClassSession, Payment,
  InventoryItem, InventoryMovement,
} from '@prisma/client';

export const toRole = (role: string) => role.toLowerCase() as 'teacher' | 'student' | 'parent' | 'admin';
export const toDate = (d: Date | string) => (typeof d === 'string' ? d : d.toISOString().slice(0, 10));

type WithSchool<T> = T & { school?: { name: string } };

export interface FrontendTeacher {
  id: string; name: string; email: string; role: 'teacher'; createdAt: string;
  subject: string; employeeId: string; classes: string[]; phone: string; qualification: string;
  status: 'active' | 'on_leave' | 'resigned'; joinDate?: string;
  avatar?: string; schoolId: string; schoolName?: string;
}

export interface FrontendStudent {
  id: string; name: string; email: string; role: 'student'; createdAt: string;
  rollNo: string; class: string; ageGroup?: string; parentId: string; enrollmentId: string;
  phone: string; address: string; guardianName: string; feeAmount?: number; feeDue: boolean;
  avatar?: string; schoolId: string; schoolName?: string;
}

export interface FrontendParent {
  id: string; name: string; email: string; role: 'parent'; createdAt: string;
  childrenIds: string[]; phone: string; avatar?: string; schoolId: string; schoolName?: string;
}

export function teacherToFrontend(t: WithSchool<Teacher>): FrontendTeacher {
  return {
    id: t.id, name: t.name, email: t.email, role: 'teacher', createdAt: toDate(t.createdAt),
    subject: t.subject, employeeId: t.employeeId, classes: t.classes,
    phone: t.phone, qualification: t.qualification,
    status: t.status.toLowerCase() as 'active' | 'on_leave' | 'resigned',
    joinDate: t.joinDate ?? undefined,
    avatar: t.avatarUrl ?? undefined,
    schoolId: t.schoolId, schoolName: t.school?.name,
  };
}

export function studentToFrontend(s: WithSchool<Student>, opts: { includeFeeAmount: boolean }): FrontendStudent {
  return {
    id: s.id, name: s.name, email: s.email, role: 'student', createdAt: toDate(s.createdAt),
    rollNo: s.rollNo, class: s.class, ageGroup: s.ageGroup ?? undefined, parentId: s.parentId,
    enrollmentId: s.enrollmentId, phone: s.phone, address: s.address, guardianName: s.guardianName,
    feeAmount: opts.includeFeeAmount ? s.feeAmount : undefined, feeDue: s.feeDue,
    avatar: s.avatarUrl ?? undefined,
    schoolId: s.schoolId, schoolName: s.school?.name,
  };
}

export function parentToFrontend(p: WithSchool<Parent>, childrenIds: string[]): FrontendParent {
  return {
    id: p.id, name: p.name, email: p.email, role: 'parent', createdAt: toDate(p.createdAt),
    childrenIds, phone: p.phone,
    avatar: p.avatarUrl ?? undefined,
    schoolId: p.schoolId, schoolName: p.school?.name,
  };
}

export function adminToFrontend(a: WithSchool<Admin>) {
  return {
    id: a.id, name: a.name, email: a.email, role: 'admin' as const, createdAt: toDate(a.createdAt),
    adminCode: a.adminCode,
    avatar: a.avatarUrl ?? undefined,
    schoolId: a.schoolId, schoolName: a.school?.name,
  };
}

export function notificationToFrontend(n: Notification) {
  return {
    id: n.id, userId: n.userId, title: n.title, message: n.message,
    type: n.type.toLowerCase() as 'info' | 'success' | 'warning' | 'error',
    read: n.read, createdAt: n.createdAt.toISOString(),
    kind: n.kind.toLowerCase() as 'fee_due' | 'fee_cleared' | 'absence' | 'general',
    relatedStudentId: n.relatedStudentId ?? undefined,
  };
}

export function lessonToFrontend(l: Lesson) {
  return { ...l, youtubeId: l.youtubeId ?? undefined, videoUrl: l.videoUrl ?? undefined, notes: l.notes ?? undefined };
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
    checkInTime: a.checkInTime ?? undefined,
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
    isLive: s.isActive,
    topic: s.topic,
    subject: s.subject,
    class: s.class,
    teacherName: s.teacherName,
    startedAt: s.startedAt,
    participantsCount: s.participantsCount,
  };
}

type PaymentStudent = {
  name: string; class: string; rollNo: string; enrollmentId: string; guardianName: string;
};
type PaymentSchool = { name: string; city: string; address: string | null; phone: string | null };

export function paymentToFrontend(
  p: Payment & { student?: PaymentStudent; school?: PaymentSchool },
) {
  return {
    id: p.id,
    receiptNo: p.receiptNo,
    studentId: p.studentId,
    amount: p.amount,
    method: p.method.toLowerCase() as 'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa',
    term: p.term,
    note: p.note ?? undefined,
    receivedById: p.receivedById,
    createdAt: p.createdAt.toISOString(),
    schoolId: p.schoolId,
    studentName: p.student?.name,
    studentClass: p.student?.class,
    studentRollNo: p.student?.rollNo,
    studentEnrollmentId: p.student?.enrollmentId,
    guardianName: p.student?.guardianName,
    schoolName: p.school?.name,
    schoolCity: p.school?.city,
    schoolAddress: p.school?.address ?? undefined,
    schoolPhone: p.school?.phone ?? undefined,
  };
}

export type FrontendInventoryCategory = 'stationery' | 'cleaning' | 'sports' | 'furniture' | 'medical' | 'other';
export type FrontendMovementType = 'stock_in' | 'stock_out' | 'adjust';

export function inventoryItemToFrontend(i: InventoryItem) {
  return {
    id: i.id, name: i.name,
    category: i.category.toLowerCase() as FrontendInventoryCategory,
    quantity: i.quantity, minStock: i.minStock,
    unit: i.unit ?? undefined, location: i.location ?? undefined,
    lowStock: i.quantity <= i.minStock,
    updatedAt: i.updatedAt.toISOString(),
  };
}

export function inventoryMovementToFrontend(m: InventoryMovement & { item?: { name: string } }) {
  return {
    id: m.id, itemId: m.itemId, itemName: m.item?.name,
    type: m.type.toLowerCase() as FrontendMovementType,
    quantity: m.quantity, note: m.note ?? undefined,
    byId: m.byId, byName: m.byName, createdAt: m.createdAt.toISOString(),
  };
}
