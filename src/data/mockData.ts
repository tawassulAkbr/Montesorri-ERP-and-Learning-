import type {
  Teacher, Student, Parent, Admin,
  Lesson, Test, TestResult, AttendanceRecord,
  LeaveRequest, Remark, DailyWork, Notification,
  AttendanceChartPoint, ScoreChartPoint, ClassPerformancePoint,
} from '../types';

// ─── Teachers ─────────────────────────────────────────────────────────────────
export const teachers: Teacher[] = [
  {
    id: 't1', name: 'Sarah Mitchell', email: 'sarah.mitchell@kinderguide.edu',
    role: 'teacher', subject: 'Mathematics', employeeId: 'EMP-001',
    classes: ['Grade 5A', 'Grade 5B'], phone: '+92 300 1234567', createdAt: '2023-09-01',
  },
  {
    id: 't2', name: 'James Harrison', email: 'james.harrison@kinderguide.edu',
    role: 'teacher', subject: 'English', employeeId: 'EMP-002',
    classes: ['Grade 5A', 'Grade 6A'], phone: '+92 301 2345678', createdAt: '2023-09-01',
  },
  {
    id: 't3', name: 'Fatima Al-Rashid', email: 'fatima.alrashid@kinderguide.edu',
    role: 'teacher', subject: 'Science', employeeId: 'EMP-003',
    classes: ['Grade 5A', 'Grade 5B'], phone: '+92 302 3456789', createdAt: '2023-09-01',
  },
  {
    id: 't4', name: 'Omar Sheikh', email: 'omar.sheikh@kinderguide.edu',
    role: 'teacher', subject: 'Arabic', employeeId: 'EMP-004',
    classes: ['Grade 5A', 'Grade 6A', 'Grade 6B'], phone: '+92 303 4567890', createdAt: '2023-09-01',
  },
  {
    id: 't5', name: 'Priya Sharma', email: 'priya.sharma@kinderguide.edu',
    role: 'teacher', subject: 'Art & Craft', employeeId: 'EMP-005',
    classes: ['Grade 5A', 'Grade 5B', 'Grade 6A'], phone: '+92 304 5678901', createdAt: '2023-09-01',
  },
];

// ─── Students ─────────────────────────────────────────────────────────────────
export const students: Student[] = [
  { id: 's1', name: 'Ali Hassan', email: 'ali.hassan@student.edu', role: 'student', rollNo: '01', class: 'Grade 5A', section: 'A', parentId: 'p1', enrollmentId: 'STU-2024-001', createdAt: '2024-01-10' },
  { id: 's2', name: 'Zara Ahmed', email: 'zara.ahmed@student.edu', role: 'student', rollNo: '02', class: 'Grade 5A', section: 'A', parentId: 'p1', enrollmentId: 'STU-2024-002', createdAt: '2024-01-10' },
  { id: 's3', name: 'Hamza Khan', email: 'hamza.khan@student.edu', role: 'student', rollNo: '03', class: 'Grade 5A', section: 'A', parentId: 'p2', enrollmentId: 'STU-2024-003', createdAt: '2024-01-10' },
  { id: 's4', name: 'Fatima Malik', email: 'fatima.malik@student.edu', role: 'student', rollNo: '04', class: 'Grade 5A', section: 'A', parentId: 'p2', enrollmentId: 'STU-2024-004', createdAt: '2024-01-10' },
  { id: 's5', name: 'Usman Tariq', email: 'usman.tariq@student.edu', role: 'student', rollNo: '05', class: 'Grade 5A', section: 'A', parentId: 'p3', enrollmentId: 'STU-2024-005', createdAt: '2024-01-10' },
  { id: 's6', name: 'Aisha Raza', email: 'aisha.raza@student.edu', role: 'student', rollNo: '06', class: 'Grade 5A', section: 'A', parentId: 'p3', enrollmentId: 'STU-2024-006', createdAt: '2024-01-10' },
  { id: 's7', name: 'Ibrahim Siddiqui', email: 'ibrahim.siddiqui@student.edu', role: 'student', rollNo: '07', class: 'Grade 5A', section: 'A', parentId: 'p4', enrollmentId: 'STU-2024-007', createdAt: '2024-01-10' },
  { id: 's8', name: 'Hina Nawaz', email: 'hina.nawaz@student.edu', role: 'student', rollNo: '08', class: 'Grade 5A', section: 'A', parentId: 'p4', enrollmentId: 'STU-2024-008', createdAt: '2024-01-10' },
  { id: 's9', name: 'Bilal Chaudhry', email: 'bilal.chaudhry@student.edu', role: 'student', rollNo: '09', class: 'Grade 5B', section: 'B', parentId: 'p5', enrollmentId: 'STU-2024-009', createdAt: '2024-01-10' },
  { id: 's10', name: 'Sara Javed', email: 'sara.javed@student.edu', role: 'student', rollNo: '10', class: 'Grade 5B', section: 'B', parentId: 'p5', enrollmentId: 'STU-2024-010', createdAt: '2024-01-10' },
  { id: 's11', name: 'Kamran Ali', email: 'kamran.ali@student.edu', role: 'student', rollNo: '11', class: 'Grade 5B', section: 'B', parentId: 'p6', enrollmentId: 'STU-2024-011', createdAt: '2024-01-10' },
  { id: 's12', name: 'Nadia Farooq', email: 'nadia.farooq@student.edu', role: 'student', rollNo: '12', class: 'Grade 5B', section: 'B', parentId: 'p6', enrollmentId: 'STU-2024-012', createdAt: '2024-01-10' },
];

// ─── Parents ──────────────────────────────────────────────────────────────────
export const parents: Parent[] = [
  { id: 'p1', name: 'Mr. Hassan Ahmed', email: 'hassan.ahmed@parent.com', role: 'parent', childrenIds: ['s1', 's2'], phone: '+92 310 1111111', createdAt: '2024-01-05' },
  { id: 'p2', name: 'Mrs. Sana Khan', email: 'sana.khan@parent.com', role: 'parent', childrenIds: ['s3', 's4'], phone: '+92 310 2222222', createdAt: '2024-01-05' },
  { id: 'p3', name: 'Mr. Tariq Raza', email: 'tariq.raza@parent.com', role: 'parent', childrenIds: ['s5', 's6'], phone: '+92 310 3333333', createdAt: '2024-01-05' },
  { id: 'p4', name: 'Mrs. Amna Siddiqui', email: 'amna.siddiqui@parent.com', role: 'parent', childrenIds: ['s7', 's8'], phone: '+92 310 4444444', createdAt: '2024-01-05' },
  { id: 'p5', name: 'Mr. Javed Chaudhry', email: 'javed.chaudhry@parent.com', role: 'parent', childrenIds: ['s9', 's10'], phone: '+92 310 5555555', createdAt: '2024-01-05' },
  { id: 'p6', name: 'Mrs. Farida Ali', email: 'farida.ali@parent.com', role: 'parent', childrenIds: ['s11', 's12'], phone: '+92 310 6666666', createdAt: '2024-01-05' },
];

// ─── Admin ────────────────────────────────────────────────────────────────────
export const admins: Admin[] = [
  { id: 'a1', name: 'Dr. Khalid Mahmood', email: 'admin@kinderguide.edu', role: 'admin', adminCode: 'ADM-001', createdAt: '2023-01-01' },
];

// ─── Lessons ──────────────────────────────────────────────────────────────────
export const lessons: Lesson[] = [
  { id: 'l1', title: 'Introduction to Fractions', subject: 'Mathematics', class: 'Grade 5A', teacherId: 't1', teacherName: 'Sarah Mitchell', youtubeId: 'h1pywEpSMQ4', description: 'Understanding fractions and their real-world applications.', duration: '18:24', uploadedAt: '2026-08-20', views: 45 },
  { id: 'l2', title: 'Photosynthesis Explained', subject: 'Science', class: 'Grade 5A', teacherId: 't3', teacherName: 'Fatima Al-Rashid', youtubeId: 'UPBMG5EYydo', description: 'How plants make their food using sunlight, water and CO₂.', duration: '14:10', uploadedAt: '2026-08-19', views: 38 },
  { id: 'l3', title: 'Essay Writing Basics', subject: 'English', class: 'Grade 5A', teacherId: 't2', teacherName: 'James Harrison', youtubeId: 'JrB4jxiHEbs', description: 'Structure and techniques for writing compelling essays.', duration: '22:05', uploadedAt: '2026-08-18', views: 52 },
  { id: 'l4', title: 'Arabic Alphabet & Pronunciation', subject: 'Arabic', class: 'Grade 5A', teacherId: 't4', teacherName: 'Omar Sheikh', youtubeId: 'GgEPKEKkRpk', description: 'Mastering Arabic letters and their correct pronunciation.', duration: '16:45', uploadedAt: '2026-08-17', views: 31 },
  { id: 'l5', title: 'Multiplication Tricks', subject: 'Mathematics', class: 'Grade 5A', teacherId: 't1', teacherName: 'Sarah Mitchell', youtubeId: 'S5A9K5KA-3E', description: 'Fun tricks to multiply numbers quickly in your head.', duration: '12:30', uploadedAt: '2026-08-15', views: 67 },
  { id: 'l6', title: 'The Solar System', subject: 'Science', class: 'Grade 5B', teacherId: 't3', teacherName: 'Fatima Al-Rashid', youtubeId: 'libKVRa01L8', description: 'Exploring the planets and their characteristics.', duration: '20:15', uploadedAt: '2026-08-14', views: 41 },
  { id: 'l7', title: 'Reading Comprehension Tips', subject: 'English', class: 'Grade 5B', teacherId: 't2', teacherName: 'James Harrison', youtubeId: 'CXKR6jbOzGQ', description: 'Strategies to improve reading comprehension speed.', duration: '19:00', uploadedAt: '2026-08-12', views: 29 },
  { id: 'l8', title: 'Watercolor Techniques', subject: 'Art & Craft', class: 'Grade 5A', teacherId: 't5', teacherName: 'Priya Sharma', youtubeId: 'JkqpWyijGx8', description: 'Beginner watercolor painting methods and color blending.', duration: '25:40', uploadedAt: '2026-08-10', views: 58 },
];

// ─── Tests ────────────────────────────────────────────────────────────────────
export const tests: Test[] = [
  { id: 'te1', title: 'Chapter 3: Fractions Quiz', subject: 'Mathematics', class: 'Grade 5A', teacherId: 't1', date: '2026-08-28', maxMarks: 50, instructions: 'Show all working. No calculators allowed.', status: 'upcoming', createdAt: '2026-08-22' },
  { id: 'te2', title: 'Essay Writing Assessment', subject: 'English', class: 'Grade 5A', teacherId: 't2', date: '2026-08-29', maxMarks: 40, instructions: 'Write a 300-word essay on the given topic.', status: 'upcoming', createdAt: '2026-08-22' },
  { id: 'te3', title: 'Photosynthesis Test', subject: 'Science', class: 'Grade 5A', teacherId: 't3', date: '2026-08-22', maxMarks: 60, instructions: 'Label diagrams clearly. Explain in full sentences.', status: 'evaluated', createdAt: '2026-08-15' },
  { id: 'te4', title: 'Arabic Vocabulary Test', subject: 'Arabic', class: 'Grade 5A', teacherId: 't4', date: '2026-08-21', maxMarks: 30, instructions: 'Translate all 15 words to English.', status: 'evaluated', createdAt: '2026-08-14' },
  { id: 'te5', title: 'Term 1 Math Exam', subject: 'Mathematics', class: 'Grade 5A', teacherId: 't1', date: '2026-08-10', maxMarks: 100, instructions: 'Full syllabus. Bring geometry box.', status: 'evaluated', createdAt: '2026-08-01' },
  { id: 'te6', title: 'Science Mid-Term', subject: 'Science', class: 'Grade 5B', teacherId: 't3', date: '2026-08-27', maxMarks: 75, instructions: 'Cover chapters 1-5.', status: 'upcoming', createdAt: '2026-08-23' },
];

// ─── Test Results ─────────────────────────────────────────────────────────────
export const testResults: TestResult[] = [
  { id: 'tr1', testId: 'te3', testTitle: 'Photosynthesis Test', studentId: 's1', subject: 'Science', marksObtained: 54, maxMarks: 60, grade: 'A', date: '2026-08-22', teacherComment: 'Excellent understanding of the concept.' },
  { id: 'tr2', testId: 'te4', testTitle: 'Arabic Vocabulary Test', studentId: 's1', subject: 'Arabic', marksObtained: 24, maxMarks: 30, grade: 'B', date: '2026-08-21', teacherComment: 'Good effort, needs more revision.' },
  { id: 'tr3', testId: 'te5', testTitle: 'Term 1 Math Exam', studentId: 's1', subject: 'Mathematics', marksObtained: 88, maxMarks: 100, grade: 'A', date: '2026-08-10', teacherComment: 'Outstanding performance!' },
  { id: 'tr4', testId: 'te3', testTitle: 'Photosynthesis Test', studentId: 's2', subject: 'Science', marksObtained: 42, maxMarks: 60, grade: 'B', date: '2026-08-22' },
  { id: 'tr5', testId: 'te4', testTitle: 'Arabic Vocabulary Test', studentId: 's2', subject: 'Arabic', marksObtained: 18, maxMarks: 30, grade: 'C', date: '2026-08-21' },
  { id: 'tr6', testId: 'te5', testTitle: 'Term 1 Math Exam', studentId: 's2', subject: 'Mathematics', marksObtained: 73, maxMarks: 100, grade: 'B', date: '2026-08-10' },
  { id: 'tr7', testId: 'te3', testTitle: 'Photosynthesis Test', studentId: 's3', subject: 'Science', marksObtained: 58, maxMarks: 60, grade: 'A+', date: '2026-08-22' },
  { id: 'tr8', testId: 'te5', testTitle: 'Term 1 Math Exam', studentId: 's3', subject: 'Mathematics', marksObtained: 65, maxMarks: 100, grade: 'C', date: '2026-08-10' },
  { id: 'tr9', testId: 'te3', testTitle: 'Photosynthesis Test', studentId: 's4', subject: 'Science', marksObtained: 30, maxMarks: 60, grade: 'D', date: '2026-08-22' },
  { id: 'tr10', testId: 'te5', testTitle: 'Term 1 Math Exam', studentId: 's4', subject: 'Mathematics', marksObtained: 55, maxMarks: 100, grade: 'C', date: '2026-08-10' },
];

// ─── Attendance Records (last 30 days for s1) ─────────────────────────────────
const today = new Date('2026-08-26');
const statuses: AttendanceRecord['status'][] = ['present', 'present', 'present', 'absent', 'present', 'present', 'leave', 'present', 'present', 'absent', 'present', 'present', 'present', 'present', 'absent', 'present', 'present', 'present', 'leave', 'present', 'present', 'present', 'present', 'present', 'absent', 'present', 'present', 'present', 'present', 'present'];

export const attendanceRecords: AttendanceRecord[] = statuses.map((status, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - (29 - i));
  return {
    id: `att-s1-${i}`,
    studentId: 's1',
    date: d.toISOString().split('T')[0],
    status,
    markedBy: 't1',
    ...(status === 'leave' ? { leaveRequestId: `lr${i}` } : {}),
  };
});

// Additional attendance for other students
export const allAttendance: AttendanceRecord[] = [
  ...attendanceRecords,
  ...['s2', 's3', 's4', 's5'].flatMap(sid =>
    statuses.map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const statusVariants: AttendanceRecord['status'][] = ['present', 'present', 'absent', 'present', 'present', 'present', 'present', 'absent', 'present', 'present', 'present', 'present', 'present', 'absent', 'present', 'present', 'present', 'present', 'present', 'present', 'absent', 'present', 'present', 'leave', 'present', 'present', 'present', 'absent', 'present', 'present'];
      return {
        id: `att-${sid}-${i}`,
        studentId: sid,
        date: d.toISOString().split('T')[0],
        status: statusVariants[i],
        markedBy: 't1',
      };
    })
  ),
];

// ─── Leave Requests ────────────────────────────────────────────────────────────
export const leaveRequests: LeaveRequest[] = [
  { id: 'lr1', studentId: 's1', studentName: 'Ali Hassan', parentId: 'p1', parentName: 'Mr. Hassan Ahmed', fromDate: '2026-08-05', toDate: '2026-08-05', reason: 'Doctor appointment for routine check-up.', status: 'accepted', submittedAt: '2026-08-04', respondedAt: '2026-08-04', respondedBy: 't1' },
  { id: 'lr2', studentId: 's2', studentName: 'Zara Ahmed', parentId: 'p1', parentName: 'Mr. Hassan Ahmed', fromDate: '2026-08-12', toDate: '2026-08-13', reason: 'Family event out of city.', status: 'accepted', submittedAt: '2026-08-11', respondedAt: '2026-08-11', respondedBy: 't1' },
  { id: 'lr3', studentId: 's3', studentName: 'Hamza Khan', parentId: 'p2', parentName: 'Mrs. Sana Khan', fromDate: '2026-08-19', toDate: '2026-08-19', reason: 'Feeling unwell, running fever.', status: 'accepted', submittedAt: '2026-08-18', respondedAt: '2026-08-19', respondedBy: 't1' },
  { id: 'lr4', studentId: 's4', studentName: 'Fatima Malik', parentId: 'p2', parentName: 'Mrs. Sana Khan', fromDate: '2026-08-25', toDate: '2026-08-26', reason: 'Eye check-up and prescription collection.', status: 'pending', submittedAt: '2026-08-24' },
  { id: 'lr5', studentId: 's5', studentName: 'Usman Tariq', parentId: 'p3', parentName: 'Mr. Tariq Raza', fromDate: '2026-08-27', toDate: '2026-08-27', reason: 'Dental appointment.', status: 'pending', submittedAt: '2026-08-25' },
  { id: 'lr6', studentId: 's1', studentName: 'Ali Hassan', parentId: 'p1', parentName: 'Mr. Hassan Ahmed', fromDate: '2026-08-08', toDate: '2026-08-08', reason: 'National competition participation.', status: 'rejected', submittedAt: '2026-08-07', respondedAt: '2026-08-07', respondedBy: 't1' },
];

// ─── Remarks ──────────────────────────────────────────────────────────────────
export const remarks: Remark[] = [
  { id: 'rem1', teacherId: 't1', teacherName: 'Sarah Mitchell', teacherSubject: 'Mathematics', studentId: 's1', studentName: 'Ali Hassan', parentId: 'p1', content: '<p>Ali has shown <strong>exceptional progress</strong> in this term. His understanding of fractions is remarkable and he actively participates in class discussions. Keep up the great work!</p>', type: 'positive', createdAt: '2026-08-22' },
  { id: 'rem2', teacherId: 't2', teacherName: 'James Harrison', teacherSubject: 'English', studentId: 's1', studentName: 'Ali Hassan', parentId: 'p1', content: '<p>Ali\'s written work is improving but he needs to <em>focus more on grammar</em> during compositions. I recommend 15 minutes of grammar exercises daily at home.</p>', type: 'constructive', createdAt: '2026-08-20' },
  { id: 'rem3', teacherId: 't3', teacherName: 'Fatima Al-Rashid', teacherSubject: 'Science', studentId: 's2', studentName: 'Zara Ahmed', parentId: 'p1', content: '<p>Zara is a <strong>curious and enthusiastic</strong> student. She scored the highest in the photosynthesis test. Her lab work is meticulous and her reports are very well-structured.</p>', type: 'positive', createdAt: '2026-08-21' },
  { id: 'rem4', teacherId: 't1', teacherName: 'Sarah Mitchell', teacherSubject: 'Mathematics', studentId: 's4', studentName: 'Fatima Malik', parentId: 'p2', content: '<p>Fatima is <strong>struggling with basic multiplication</strong> and division. I strongly recommend arranging extra tutoring sessions. Please ensure she completes her homework daily.</p>', type: 'concern', createdAt: '2026-08-23' },
  { id: 'rem5', teacherId: 't4', teacherName: 'Omar Sheikh', teacherSubject: 'Arabic', studentId: 's3', studentName: 'Hamza Khan', parentId: 'p2', content: '<p>Hamza has demonstrated excellent memorization skills. His Arabic recitation has improved significantly. Encourage him to practice conversation at home as well.</p>', type: 'positive', createdAt: '2026-08-19' },
  { id: 'rem6', teacherId: 't3', teacherName: 'Fatima Al-Rashid', teacherSubject: 'Science', studentId: 's1', studentName: 'Ali Hassan', parentId: 'p1', content: '<p>Ali scored full marks in the photosynthesis practical. His lab notebook is the best in class. Very proud of his dedication!</p>', type: 'positive', createdAt: '2026-08-18' },
];

// ─── Daily Work ───────────────────────────────────────────────────────────────
export const dailyWork: DailyWork[] = [
  { id: 'dw1', teacherId: 't1', teacherName: 'Sarah Mitchell', teacherSubject: 'Mathematics', class: 'Grade 5A', content: '<p><strong>Today\'s Work:</strong></p><ul><li>Completed exercises 3.1 to 3.5 from the textbook</li><li>Practiced finding LCM and HCF of 3-digit numbers</li><li>Group activity: Fraction War card game</li></ul><p><strong>Homework:</strong> Exercise 3.6 (Q1-Q10) due tomorrow.</p>', postedAt: '2026-08-26T08:30:00', visibleTo: ['students', 'parents'] },
  { id: 'dw2', teacherId: 't2', teacherName: 'James Harrison', teacherSubject: 'English', class: 'Grade 5A', content: '<p><strong>Today\'s Activities:</strong></p><ul><li>Reading: Chapter 5 of "Charlotte\'s Web"</li><li>Vocabulary: 10 new words with meanings</li><li>Grammar: Identifying adjectives in sentences</li></ul><p><strong>Homework:</strong> Write 5 sentences using today\'s vocabulary words.</p>', postedAt: '2026-08-26T09:15:00', visibleTo: ['students', 'parents'] },
  { id: 'dw3', teacherId: 't3', teacherName: 'Fatima Al-Rashid', teacherSubject: 'Science', class: 'Grade 5A', content: '<p><strong>Lab Session — Plant Cells:</strong></p><ul><li>Prepared microscope slides of onion cells</li><li>Drew and labeled cell diagrams</li><li>Compared plant and animal cells</li></ul><p><strong>Note:</strong> Test on Thursday. Chapters 3 and 4 will be covered.</p>', attachmentName: 'cell_diagram_worksheet.pdf', postedAt: '2026-08-25T10:00:00', visibleTo: ['students', 'parents'] },
  { id: 'dw4', teacherId: 't1', teacherName: 'Sarah Mitchell', teacherSubject: 'Mathematics', class: 'Grade 5A', content: '<p><strong>Monday Work:</strong></p><ul><li>Revision of Chapter 2: Decimals</li><li>Quiz on decimal addition and subtraction</li><li>Introduction to fractions (new chapter)</li></ul>', postedAt: '2026-08-25T08:30:00', visibleTo: ['students', 'parents'] },
  { id: 'dw5', teacherId: 't4', teacherName: 'Omar Sheikh', teacherSubject: 'Arabic', class: 'Grade 5A', content: '<p><strong>Arabic Class — Conversation Practice:</strong></p><ul><li>Reviewed alphabet and short vowels</li><li>Practiced classroom phrases in Arabic</li><li>Story time: short Arabic text comprehension</li></ul><p><strong>Homework:</strong> Memorize the vocabulary list (page 34).</p>', postedAt: '2026-08-24T11:00:00', visibleTo: ['students', 'parents'] },
  { id: 'dw6', teacherId: 't5', teacherName: 'Priya Sharma', teacherSubject: 'Art & Craft', class: 'Grade 5A', content: '<p><strong>Art Project — Watercolors:</strong></p><ul><li>Practiced wet-on-wet watercolor technique</li><li>Created a nature scene painting</li><li>Discussed color theory basics (warm vs cool colors)</li></ul><p><strong>Bring:</strong> Your watercolor set next class. We continue the project.</p>', attachmentName: 'art_project_rubric.pdf', postedAt: '2026-08-23T13:00:00', visibleTo: ['students', 'parents'] },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications: Notification[] = [
  { id: 'n1', title: 'New Test Scheduled', message: 'Mathematics quiz scheduled for Aug 28.', type: 'info', read: false, createdAt: '2026-08-22T10:00:00' },
  { id: 'n2', title: 'Leave Request Accepted', message: 'Ali Hassan\'s leave request for Aug 5 has been accepted.', type: 'success', read: false, createdAt: '2026-08-04T14:00:00' },
  { id: 'n3', title: 'New Remark from Ms. Mitchell', message: 'A new remark has been added about Ali\'s performance.', type: 'info', read: true, createdAt: '2026-08-22T16:00:00' },
  { id: 'n4', title: 'Attendance Alert', message: 'Zara Ahmed was marked absent today.', type: 'warning', read: false, createdAt: '2026-08-21T09:00:00' },
  { id: 'n5', title: 'Results Published', message: 'Science test results have been published.', type: 'success', read: true, createdAt: '2026-08-22T17:00:00' },
];

// ─── Chart Data ───────────────────────────────────────────────────────────────
export const attendanceChartData: AttendanceChartPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - (29 - i));
  const total = 22; // total students
  const absent = Math.floor(Math.random() * 5);
  const leave = Math.floor(Math.random() * 2);
  return {
    date: d.toISOString().split('T')[0].slice(5),
    present: total - absent - leave,
    absent,
    leave,
  };
});

export const scoreChartData: ScoreChartPoint[] = [
  { subject: 'Math', score: 88, classAvg: 74, maxMarks: 100 },
  { subject: 'English', score: 76, classAvg: 71, maxMarks: 100 },
  { subject: 'Science', score: 90, classAvg: 78, maxMarks: 100 },
  { subject: 'Arabic', score: 80, classAvg: 68, maxMarks: 100 },
  { subject: 'Art', score: 95, classAvg: 85, maxMarks: 100 },
];

export const classPerformanceData: ClassPerformancePoint[] = [
  { name: 'Excellent (A+/A)', value: 7, color: '#10B981' },
  { name: 'Good (B)', value: 8, color: '#4F46E5' },
  { name: 'Average (C)', value: 5, color: '#F59E0B' },
  { name: 'Below Avg (D/F)', value: 2, color: '#EF4444' },
];

export const enrollmentChartData = [
  { month: 'Sep', students: 210 },
  { month: 'Oct', students: 218 },
  { month: 'Nov', students: 225 },
  { month: 'Dec', students: 222 },
  { month: 'Jan', students: 230 },
  { month: 'Feb', students: 235 },
  { month: 'Mar', students: 240 },
  { month: 'Apr', students: 238 },
  { month: 'May', students: 245 },
  { month: 'Jun', students: 248 },
  { month: 'Jul', students: 244 },
  { month: 'Aug', students: 252 },
];

// ─── Mock Credentials ─────────────────────────────────────────────────────────
export const mockCredentials = {
  teacher: { email: 'sarah.mitchell@kinderguide.edu', password: 'teacher123', userId: 't1' },
  student: { email: 'ali.hassan@student.edu', password: 'student123', userId: 's1' },
  parent: { email: 'hassan.ahmed@parent.com', password: 'parent123', userId: 'p1' },
  admin: { email: 'admin@kinderguide.edu', password: 'admin123', userId: 'a1' },
};
