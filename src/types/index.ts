// ─── Roles ───────────────────────────────────────────────────────────────────
export type Role = 'teacher' | 'student' | 'parent' | 'admin';

// ─── Base User ────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  schoolId: string;
  schoolName?: string;
  createdAt: string;
}

// ─── Teacher ─────────────────────────────────────────────────────────────────
export interface Teacher extends User {
  role: 'teacher';
  subject: string;
  employeeId: string;
  classes: string[];
  phone: string;
  qualification: string;
  status?: EmploymentStatus;
  joinDate?: string; // 'YYYY-MM-DD'
}

export type EmploymentStatus = 'active' | 'on_leave' | 'resigned';

// ─── Student ─────────────────────────────────────────────────────────────────
export interface Student extends User {
  role: 'student';
  rollNo: string;
  class: string;
  ageGroup?: string; // e.g. "3-4 Years"
  section?: string;
  parentId: string;
  enrollmentId: string;
  phone: string;
  address: string;
  guardianName: string;
  feeAmount: number;
  feeDue: boolean;
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
  subject: string; // Practical Life, Sensorial, Language Arts, Mathematics, Cultural Studies / General Knowledge, Islamiyat
  class: string;
  teacherId: string;
  teacherName: string;
  youtubeId?: string;
  videoUrl?: string; // uploaded personal recording
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

export interface TeacherAttendanceRecord {
  id: string;
  teacherId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  leaveRequestId?: string;
}

export interface Credential {
  userId: string;
  email: string;
  password: string;
  role: Role;
}

export interface IssuedCredentials {
  role: Role;
  name: string;
  email: string;
  password: string;
}

// ─── Leave Request ────────────────────────────────────────────────────────────
export type LeaveStatus = 'pending' | 'accepted' | 'rejected';
export type LeaveKind = 'student' | 'teacher';

export interface LeaveRequest {
  id: string;
  kind: LeaveKind;
  studentId?: string;
  studentName?: string;
  parentId?: string;
  parentName?: string;
  teacherId?: string;
  teacherName?: string;
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
  isLive: boolean;
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
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  kind?: 'fee_due' | 'fee_cleared' | 'absence' | 'general';
  relatedStudentId?: string;
}

// ─── Anonymous Student Feedback ──────────────────────────────────────────────
export interface FeedbackItem {
  id: string;
  content: string;
  createdAt: string;
  readByTeacher?: boolean;
  studentName?: string; // admin view only
  teacherName?: string; // student + admin views
}

// ─── Assignments & Submissions (GC-style) ────────────────────────────────────
export interface Assignment {
  id: string;
  teacherId: string;
  teacherName: string;
  title: string;
  class: string;
  subject: string;
  instructions: string;
  dueAt: string; // ISO datetime
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  text?: string;
  fileName?: string;
  filePath?: string;
  submittedAt: string;
  isLate: boolean;
  grade?: number;
  feedback?: string;
}

// ─── Parent ↔ Teacher Chat ───────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  parentId: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  senderRole: 'parent' | 'teacher';
  content: string;
  createdAt: string;
  readByParent: boolean;
  readByTeacher: boolean;
}

export interface MessageThread {
  parentId?: string;
  parentName?: string;
  teacherId?: string;
  teacherName?: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

// ─── Finance (fee ledger) ────────────────────────────────────────────────────
export type PaymentMethod = 'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa';

export interface Payment {
  id: string;
  receiptNo: string;
  studentId: string;
  amount: number;
  method: PaymentMethod;
  term: string;
  note?: string;
  receivedById: string;
  receivedByName?: string;
  createdAt: string; // ISO datetime
  schoolId: string;
  studentName?: string;
  studentClass?: string;
  studentRollNo?: string;
  studentEnrollmentId?: string;
  guardianName?: string;
  schoolName?: string;
  schoolCity?: string;
  schoolAddress?: string;
  schoolPhone?: string;
}

export interface IncomeMonthPoint {
  key: string;
  label: string;
  amount: number;
  count: number;
}

export interface FinanceSummary {
  months: IncomeMonthPoint[];
  collectedThisMonth: number;
  collectedTotal: number;
  outstandingCount: number;
  outstandingAmount: number;
  totalStudents: number;
  avgFee: number;
  byMethod: { method: PaymentMethod; amount: number }[];
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

// ─── Gamified Learning / Micro-Learning ──────────────────────────────────────
export interface DailyQuestion {
  id: string;
  area: string;
  emoji?: string;
  question: string;
  options: string[];
}

export interface DailyTask {
  date: string;
  questionSeconds: number;
  todayCompleted: boolean;
  todayResult: { correct: number; total: number; xpEarned: number } | null;
  questions: DailyQuestion[];
}

export interface BadgeInfo {
  id: string;
  code: string;
  name: string;
  emoji: string;
  description: string;
  earnedAt?: string;
}

export interface SubmitResult {
  alreadyCompleted: boolean;
  correct: number;
  total: number;
  perfect?: boolean;
  xpEarned: number;
  currentStreak: number;
  longestStreak?: number;
  totalXp?: number;
  level?: number;
  newBadges: BadgeInfo[];
}

export interface LearningProgress {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  perfectCount: number;
  lastActivityDate: string | null;
  todayCompleted: boolean;
  badges: BadgeInfo[];
  sessions: { date: string; correct: number; total: number; xpEarned: number }[];
}

export interface StudentStreakSummary {
  studentId: string;
  name: string;
  class: string;
  rollNo: string;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  badgeCount: number;
  lastActivityDate: string | null;
  atRisk: boolean;
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export type InventoryCategory =
  | 'stationery' | 'cleaning' | 'sports' | 'furniture' | 'medical' | 'other';

export type MovementType = 'stock_in' | 'stock_out' | 'adjust';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  minStock: number;
  unit?: string;
  location?: string;
  lowStock: boolean;
  updatedAt: string; // ISO datetime
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName?: string;
  type: MovementType;
  quantity: number;
  note?: string;
  byId: string;
  byName: string;
  createdAt: string; // ISO datetime
}

