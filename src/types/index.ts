// ─── Roles ───────────────────────────────────────────────────────────────────
export type Role = 'teacher' | 'student' | 'parent' | 'admin';

// ─── Base User ────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

// ─── Teacher ─────────────────────────────────────────────────────────────────
export interface Teacher extends User {
  role: 'teacher';
  subject: string;
  employeeId: string;
  classes: string[];
  phone: string;
}

// ─── Student ─────────────────────────────────────────────────────────────────
export interface Student extends User {
  role: 'student';
  rollNo: string;
  class: string; // e.g. "Junior Montessori (Nursery)", "Senior Montessori (Prep)"
  ageGroup?: string; // e.g. "3-4 Years"
  section?: string;
  parentId: string;
  enrollmentId: string;
}

// ─── Parent ───────────────────────────────────────────────────────────────────
export interface Parent extends User {
  role: 'parent';
  childrenIds: string[];
  phone: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export interface Admin extends User {
  role: 'admin';
  adminCode: string;
}

// ─── Lesson / Video ──────────────────────────────────────────────────────────
export interface Lesson {
  id: string;
  title: string;
  subject: string; // Phonics & Language, Sensorial & Practical Life, Early Math, Rhymes, Creative Art
  class: string;
  teacherId: string;
  teacherName: string;
  youtubeId: string;
  description: string;
  notes?: string;
  duration: string;
  uploadedAt: string;
  views: number;
}

// ─── Montessori Developmental Milestone / Test ──────────────────────────────
export interface Test {
  id: string;
  title: string;
  subject: string;
  class: string;
  teacherId: string;
  date: string;
  maxMarks: number;
  instructions: string;
  status: 'upcoming' | 'published' | 'evaluated';
  createdAt: string;
}

// ─── Milestone Evaluation Result ─────────────────────────────────────────────
export interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  milestoneStatus?: 'Mastered' | 'Developing' | 'Emerging';
  date: string;
  teacherComment?: string;
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'holiday';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  leaveRequestId?: string;
}

// ─── Leave Request ────────────────────────────────────────────────────────────
export type LeaveStatus = 'pending' | 'accepted' | 'rejected';

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  submittedAt: string;
  respondedAt?: string;
  respondedBy?: string;
}

// ─── Remark ───────────────────────────────────────────────────────────────────
export type RemarkType = 'positive' | 'constructive' | 'concern';

export interface Remark {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherSubject: string;
  studentId: string;
  studentName: string;
  parentId: string;
  content: string; // Rich HTML from Quill
  type: RemarkType;
  createdAt: string;
  updatedAt?: string;
}

// ─── Daily Work & Activities ─────────────────────────────────────────────────
export interface DailyWork {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherSubject: string;
  class: string;
  content: string; // Rich HTML from Quill
  attachmentName?: string;
  postedAt: string;
  visibleTo: ('students' | 'parents')[];
  completedByStudentIds?: string[];
}

// ─── Daily Timetable / Schedule Item ─────────────────────────────────────────
export type ScheduleCategory = 'circle_time' | 'phonics' | 'sensorial' | 'math' | 'snack_break' | 'art_craft' | 'outdoor_play' | 'storytelling' | 'live_class';

export interface ScheduleItem {
  id: string;
  title: string;
  category: ScheduleCategory;
  startTime: string; // e.g. "08:30 AM"
  endTime: string;   // e.g. "09:15 AM"
  class: string;
  teacherName: string;
  description: string;
  roomOrLink?: string;
  isLive?: boolean;
}

// ─── Live Virtual Classroom State ─────────────────────────────────────────────
export interface LiveClassSession {
  isActive: boolean;
  topic: string;
  subject: string;
  class: string;
  teacherName: string;
  startedAt: string;
  whiteboardData?: string; // serialized drawings
  participantsCount: number;
}

// ─── Subject Teacher (for parents) ───────────────────────────────────────────
export interface SubjectTeacher {
  teacherId: string;
  teacherName: string;
  subject: string;
  email: string;
  phone: string;
  avatar?: string;
  initials: string;
  avatarColor: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// ─── Chart Data ───────────────────────────────────────────────────────────────
export interface AttendanceChartPoint {
  date: string;
  present: number;
  absent: number;
  leave: number;
}

export interface ScoreChartPoint {
  subject: string;
  score: number;
  classAvg: number;
  maxMarks: number;
}

export interface ClassPerformancePoint {
  name: string;
  value: number;
  color: string;
}
