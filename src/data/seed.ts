import type {
  Teacher, Student, Parent, Admin, Credential, Notification,
  Lesson, Test, TestResult, AttendanceRecord, LeaveRequest,
  Remark, DailyWork, ScheduleItem, LiveClassSession,
} from '@/types';

export const seedTeachers: Teacher[] = [
  {
    id: 't1', name: 'Maria Montessori', email: 'sarah.mitchell@kinderguide.edu',
    role: 'teacher', subject: 'Phonics & Early Language', employeeId: 'EMP-001',
    classes: ['Junior Montessori (Nursery)', 'Senior Montessori (Prep)'],
    phone: '+92 300 1234567', qualification: 'AMI Montessori Diploma', createdAt: '2023-09-01',
  },
  {
    id: 't2', name: 'James Harrison', email: 'james.harrison@kinderguide.edu',
    role: 'teacher', subject: 'Sensorial & Practical Life (EPL)', employeeId: 'EMP-002',
    classes: ['Montessori Toddler (Playgroup)', 'Junior Montessori (Nursery)'],
    phone: '+92 301 2345678', qualification: 'B.Ed Early Years', createdAt: '2023-09-01',
  },
  {
    id: 't3', name: 'Fatima Al-Rashid', email: 'fatima.alrashid@kinderguide.edu',
    role: 'teacher', subject: 'Early Mathematics & Counting', employeeId: 'EMP-003',
    classes: ['Junior Montessori (Nursery)', 'Senior Montessori (Prep)'],
    phone: '+92 302 3456789', qualification: 'M.Ed Mathematics', createdAt: '2023-09-01',
  },
  {
    id: 't4', name: 'Omar Sheikh', email: 'omar.sheikh@kinderguide.edu',
    role: 'teacher', subject: 'Rhymes, Story Circle & Arabic', employeeId: 'EMP-004',
    classes: ['Junior Montessori (Nursery)', 'Senior Montessori (Prep)'],
    phone: '+92 303 4567890', qualification: 'MA Arabic & Islamic Studies', createdAt: '2023-09-01',
  },
  {
    id: 't5', name: 'Priya Sharma', email: 'priya.sharma@kinderguide.edu',
    role: 'teacher', subject: 'Creative Arts & Motor Skills', employeeId: 'EMP-005',
    classes: ['Montessori Toddler (Playgroup)', 'Junior Montessori (Nursery)'],
    phone: '+92 304 5678901', qualification: 'Diploma in Fine Arts', createdAt: '2023-09-01',
  },
];

export const seedStudents: Student[] = [
  { id: 's1', name: 'Ali Hassan', email: 'ali.hassan@student.edu', role: 'student', rollNo: '01', class: 'Junior Montessori (Nursery)', ageGroup: '3-4 Years', parentId: 'p1', enrollmentId: 'MON-2026-001', createdAt: '2024-01-10', phone: '+92 310 1111111', address: '12 Garden Lane, Lahore', guardianName: 'Mr. Hassan Ahmed', feeAmount: 12000, feeDue: true },
  { id: 's2', name: 'Zara Ahmed', email: 'zara.ahmed@student.edu', role: 'student', rollNo: '02', class: 'Junior Montessori (Nursery)', ageGroup: '3-4 Years', parentId: 'p1', enrollmentId: 'MON-2026-002', createdAt: '2024-01-10', phone: '+92 310 1111111', address: '12 Garden Lane, Lahore', guardianName: 'Mr. Hassan Ahmed', feeAmount: 12000, feeDue: false },
  { id: 's3', name: 'Hamza Khan', email: 'hamza.khan@student.edu', role: 'student', rollNo: '03', class: 'Junior Montessori (Nursery)', ageGroup: '3-4 Years', parentId: 'p2', enrollmentId: 'MON-2026-003', createdAt: '2024-01-10', phone: '+92 310 2222222', address: '45 Canal View, Lahore', guardianName: 'Mrs. Sana Khan', feeAmount: 12000, feeDue: false },
  { id: 's4', name: 'Fatima Malik', email: 'fatima.malik@student.edu', role: 'student', rollNo: '04', class: 'Junior Montessori (Nursery)', ageGroup: '3-4 Years', parentId: 'p2', enrollmentId: 'MON-2026-004', createdAt: '2024-01-10', phone: '+92 310 2222222', address: '45 Canal View, Lahore', guardianName: 'Mrs. Sana Khan', feeAmount: 12000, feeDue: true },
  { id: 's5', name: 'Usman Tariq', email: 'usman.tariq@student.edu', role: 'student', rollNo: '05', class: 'Senior Montessori (Prep)', ageGroup: '4-5 Years', parentId: 'p3', enrollmentId: 'MON-2026-005', createdAt: '2024-01-10', phone: '+92 310 3333333', address: '8 Model Town, Lahore', guardianName: 'Mr. Tariq Raza', feeAmount: 14000, feeDue: false },
  { id: 's6', name: 'Aisha Raza', email: 'aisha.raza@student.edu', role: 'student', rollNo: '06', class: 'Senior Montessori (Prep)', ageGroup: '4-5 Years', parentId: 'p3', enrollmentId: 'MON-2026-006', createdAt: '2024-01-10', phone: '+92 310 3333333', address: '8 Model Town, Lahore', guardianName: 'Mr. Tariq Raza', feeAmount: 14000, feeDue: false },
  { id: 's7', name: 'Ibrahim Siddiqui', email: 'ibrahim.siddiqui@student.edu', role: 'student', rollNo: '07', class: 'Montessori Toddler (Playgroup)', ageGroup: '2-3 Years', parentId: 'p4', enrollmentId: 'MON-2026-007', createdAt: '2024-01-10', phone: '+92 310 4444444', address: '22 DHA Phase 5, Lahore', guardianName: 'Mrs. Amna Siddiqui', feeAmount: 10000, feeDue: false },
  { id: 's8', name: 'Hina Nawaz', email: 'hina.nawaz@student.edu', role: 'student', rollNo: '08', class: 'Montessori Toddler (Playgroup)', ageGroup: '2-3 Years', parentId: 'p4', enrollmentId: 'MON-2026-008', createdAt: '2024-01-10', phone: '+92 310 4444444', address: '22 DHA Phase 5, Lahore', guardianName: 'Mrs. Amna Siddiqui', feeAmount: 10000, feeDue: false },
];

export const seedParents: Parent[] = [
  { id: 'p1', name: 'Mr. Hassan Ahmed', email: 'hassan.ahmed@parent.com', role: 'parent', childrenIds: ['s1', 's2'], phone: '+92 310 1111111', createdAt: '2024-01-05' },
  { id: 'p2', name: 'Mrs. Sana Khan', email: 'sana.khan@parent.com', role: 'parent', childrenIds: ['s3', 's4'], phone: '+92 310 2222222', createdAt: '2024-01-05' },
  { id: 'p3', name: 'Mr. Tariq Raza', email: 'tariq.raza@parent.com', role: 'parent', childrenIds: ['s5', 's6'], phone: '+92 310 3333333', createdAt: '2024-01-05' },
  { id: 'p4', name: 'Mrs. Amna Siddiqui', email: 'amna.siddiqui@parent.com', role: 'parent', childrenIds: ['s7', 's8'], phone: '+92 310 4444444', createdAt: '2024-01-05' },
];

export const seedAdmins: Admin[] = [
  { id: 'a1', name: 'Dr. Khalid Mahmood', email: 'admin@kinderguide.edu', role: 'admin', adminCode: 'ADM-001', createdAt: '2023-01-01' },
];

export const seedCredentials: Credential[] = [
  { userId: 't1', email: 'sarah.mitchell@kinderguide.edu', password: 'teacher123', role: 'teacher' },
  { userId: 't2', email: 'james.harrison@kinderguide.edu', password: 'teacher123', role: 'teacher' },
  { userId: 't3', email: 'fatima.alrashid@kinderguide.edu', password: 'teacher123', role: 'teacher' },
  { userId: 't4', email: 'omar.sheikh@kinderguide.edu', password: 'teacher123', role: 'teacher' },
  { userId: 't5', email: 'priya.sharma@kinderguide.edu', password: 'teacher123', role: 'teacher' },
  { userId: 's1', email: 'ali.hassan@student.edu', password: 'student123', role: 'student' },
  { userId: 's2', email: 'zara.ahmed@student.edu', password: 'student123', role: 'student' },
  { userId: 's3', email: 'hamza.khan@student.edu', password: 'student123', role: 'student' },
  { userId: 's4', email: 'fatima.malik@student.edu', password: 'student123', role: 'student' },
  { userId: 's5', email: 'usman.tariq@student.edu', password: 'student123', role: 'student' },
  { userId: 's6', email: 'aisha.raza@student.edu', password: 'student123', role: 'student' },
  { userId: 's7', email: 'ibrahim.siddiqui@student.edu', password: 'student123', role: 'student' },
  { userId: 's8', email: 'hina.nawaz@student.edu', password: 'student123', role: 'student' },
  { userId: 'p1', email: 'hassan.ahmed@parent.com', password: 'parent123', role: 'parent' },
  { userId: 'p2', email: 'sana.khan@parent.com', password: 'parent123', role: 'parent' },
  { userId: 'p3', email: 'tariq.raza@parent.com', password: 'parent123', role: 'parent' },
  { userId: 'p4', email: 'amna.siddiqui@parent.com', password: 'parent123', role: 'parent' },
  { userId: 'a1', email: 'admin@kinderguide.edu', password: 'admin123', role: 'admin' },
];

export const seedNotifications: Notification[] = [
  { id: 'n-fee-s1', userId: 's1', title: 'Fee due', message: 'A fee payment is due. Please contact the school office.', type: 'warning', read: false, createdAt: '2026-08-26T09:00:00', kind: 'fee_due', relatedStudentId: 's1' },
  { id: 'n-fee-p1-s1', userId: 'p1', title: 'Fee due', message: 'A fee payment is due for Ali Hassan. Please contact the school office.', type: 'warning', read: false, createdAt: '2026-08-26T09:00:00', kind: 'fee_due', relatedStudentId: 's1' },
  { id: 'n-fee-s4', userId: 's4', title: 'Fee due', message: 'A fee payment is due. Please contact the school office.', type: 'warning', read: false, createdAt: '2026-08-26T09:00:00', kind: 'fee_due', relatedStudentId: 's4' },
  { id: 'n-fee-p2-s4', userId: 'p2', title: 'Fee due', message: 'A fee payment is due for Fatima Malik. Please contact the school office.', type: 'warning', read: false, createdAt: '2026-08-26T09:00:00', kind: 'fee_due', relatedStudentId: 's4' },
  { id: 'n1', userId: 's1', title: 'New Milestone', message: 'A phonics milestone is scheduled this week.', type: 'info', read: false, createdAt: '2026-08-22T10:00:00', kind: 'general' },
  { id: 'n2', userId: 'p1', title: 'Leave Request Accepted', message: "Ali Hassan's leave request has been accepted.", type: 'success', read: false, createdAt: '2026-08-23T14:00:00', kind: 'general' },
  { id: 'n3', userId: 't1', title: 'New enrollment', message: 'Review new children on your class roster.', type: 'info', read: true, createdAt: '2026-08-22T16:00:00', kind: 'general' },
  { id: 'n4', userId: 'a1', title: 'Attendance reminder', message: 'Faculty who do not mark present are marked absent automatically.', type: 'info', read: false, createdAt: '2026-08-21T09:00:00', kind: 'general' },
];

export const seedLessons: Lesson[] = [
  { id: 'l1', title: 'Phonics Letter Sounds: /s/ /a/ /t/ /p/', subject: 'Phonics & Language', class: 'Junior Montessori (Nursery)', teacherId: 't1', teacherName: 'Maria Montessori', youtubeId: 'BELlZKpi1Zs', description: 'Jolly phonics actions and phonetic sound recognition songs.', duration: '08:45', uploadedAt: '2026-08-25', views: 42 },
  { id: 'l2', title: 'Montessori Sensorial: Knobbed Cylinder Blocks', subject: 'Sensorial & Practical Life', class: 'Junior Montessori (Nursery)', teacherId: 't2', teacherName: 'James Harrison', youtubeId: 'B-d3jE2-2XU', description: 'Developing visual discrimination of dimensions (height, diameter, and volume).', duration: '06:30', uploadedAt: '2026-08-24', views: 56 },
  { id: 'l3', title: 'Early Math: Number Rods & Sandpaper Numbers', subject: 'Early Mathematics', class: 'Junior Montessori (Nursery)', teacherId: 't3', teacherName: 'Fatima Al-Rashid', youtubeId: 'DR-cfDsHCGA', description: 'Counting quantities 1 to 10 with tactile sandpaper number tracings.', duration: '07:15', uploadedAt: '2026-08-23', views: 38 },
  { id: 'l4', title: 'Practical Life: Pouring Water & Fine Motor Grip', subject: 'Sensorial & Practical Life', class: 'Montessori Toddler (Playgroup)', teacherId: 't2', teacherName: 'James Harrison', youtubeId: 'G1Db4j88-7I', description: 'Dry pouring and liquid transfer to build wrist coordination and concentration.', duration: '05:20', uploadedAt: '2026-08-22', views: 65 },
  { id: 'l5', title: 'Color Mixing & Sensory Finger Painting', subject: 'Creative Arts & Crafts', class: 'Junior Montessori (Nursery)', teacherId: 't5', teacherName: 'Priya Sharma', youtubeId: 'JkqpWyijGx8', description: 'Exploring primary colors and finger blending to create secondary shades.', duration: '09:10', uploadedAt: '2026-08-20', views: 48 },
  { id: 'l6', title: 'Arabic Nursery Rhymes & Animal Sounds', subject: 'Rhymes & Story Circle', class: 'Junior Montessori (Nursery)', teacherId: 't4', teacherName: 'Omar Sheikh', youtubeId: 'GgEPKEKkRpk', description: 'Fun interactive singing and vocabulary building through catchy rhymes.', duration: '11:00', uploadedAt: '2026-08-19', views: 35 },
];

export const seedTests: Test[] = [
  { id: 'te1', title: 'Milestone 1: 3-Letter CVC Phonics Reading', subject: 'Phonics & Language', class: 'Junior Montessori (Nursery)', teacherId: 't1', date: '2026-08-28', maxMarks: 20, instructions: 'Observe sound blending of short vowel words (cat, dog, sun, pin).', status: 'upcoming', createdAt: '2026-08-20' },
  { id: 'te2', title: 'Sensorial Evaluation: Pink Tower & Broad Stairs', subject: 'Sensorial & Practical Life', class: 'Junior Montessori (Nursery)', teacherId: 't2', date: '2026-08-29', maxMarks: 20, instructions: 'Evaluation of size grading from largest to smallest cube.', status: 'upcoming', createdAt: '2026-08-21' },
  { id: 'te3', title: 'Counting Quantities & Golden Beads (1-10)', subject: 'Early Mathematics', class: 'Junior Montessori (Nursery)', teacherId: 't3', date: '2026-08-22', maxMarks: 20, instructions: 'One-to-one correspondence and number symbol association.', status: 'evaluated', createdAt: '2026-08-15' },
];

export const seedTestResults: TestResult[] = [
  { id: 'tr1', testId: 'te3', testTitle: 'Counting Quantities & Golden Beads (1-10)', studentId: 's1', subject: 'Early Mathematics', marksObtained: 19, maxMarks: 20, grade: 'A+', milestoneStatus: 'Mastered', date: '2026-08-22', teacherComment: 'Ali accurately matched all spindle box counters with number cards independently!' },
  { id: 'tr2', testId: 'te3', testTitle: 'Counting Quantities & Golden Beads (1-10)', studentId: 's2', subject: 'Early Mathematics', marksObtained: 17, maxMarks: 20, grade: 'A', milestoneStatus: 'Mastered', date: '2026-08-22', teacherComment: 'Great concentration and self-correction with the number rods.' },
  { id: 'tr3', testId: 'te3', testTitle: 'Counting Quantities & Golden Beads (1-10)', studentId: 's3', subject: 'Early Mathematics', marksObtained: 18, maxMarks: 20, grade: 'A', milestoneStatus: 'Mastered', date: '2026-08-22', teacherComment: 'Showed enthusiastic counting skills in circle time.' },
];

export const seedDailyWork: DailyWork[] = [
  {
    id: 'dw1', teacherId: 't1', teacherName: 'Maria Montessori', teacherSubject: 'Phonics & Early Language', class: 'Junior Montessori (Nursery)',
    content: '<p><strong>Today\'s Montessori Work:</strong></p><ul><li>Introduced sandpaper letter <strong>/m/</strong> with tactile tracing.</li><li>Sound box exploration with miniature objects (mat, mug, moon, mop).</li><li>Phonics action song and rhyme time.</li></ul><p><strong>Home Activity for Parents:</strong> Practice making the /m/ sound together while pointing to items around the house.</p>',
    attachmentName: 'letter_m_sound_worksheet.pdf', postedAt: '2026-08-26T08:45:00', visibleTo: ['students', 'parents'], completedByStudentIds: ['s1'],
  },
  {
    id: 'dw2', teacherId: 't2', teacherName: 'James Harrison', teacherSubject: 'Sensorial & Practical Life', class: 'Junior Montessori (Nursery)',
    content: '<p><strong>Sensorial Practical Life Period:</strong></p><ul><li>Tongs transfer exercise using wool pom-poms (fine motor pincer grip).</li><li>Folding napkins & dressing frame with large buttons.</li><li>Walking on the line with harmony and poise.</li></ul><p><strong>Note:</strong> Ali showed wonderful care and focus during the buttoning activity!</p>',
    postedAt: '2026-08-26T10:15:00', visibleTo: ['students', 'parents'], completedByStudentIds: [],
  },
  {
    id: 'dw3', teacherId: 't3', teacherName: 'Fatima Al-Rashid', teacherSubject: 'Early Mathematics', class: 'Junior Montessori (Nursery)',
    content: '<p><strong>Math Sensorial Discovery:</strong></p><ul><li>Worked with Spindle Box (concept of zero and quantities 1-9).</li><li>Number song and hand-clapping rhythm.</li></ul>',
    attachmentName: 'counting_spindles_guide.pdf', postedAt: '2026-08-25T11:00:00', visibleTo: ['students', 'parents'], completedByStudentIds: ['s1', 's2'],
  },
];

export const seedSchedules: ScheduleItem[] = [
  { id: 'sch1', title: 'Arrival, Greetings & Morning Circle', category: 'circle_time', startTime: '08:30 AM', endTime: '09:00 AM', class: 'Junior Montessori (Nursery)', teacherName: 'Maria Montessori', description: 'Good morning song, calendar check, emotions chart, and weather wheel.' },
  { id: 'sch2', title: 'Live Online Phonics & Letter Sound Circle', category: 'live_class', startTime: '09:00 AM', endTime: '09:40 AM', class: 'Junior Montessori (Nursery)', teacherName: 'Maria Montessori', description: 'Interactive whiteboard session on short vowel phonetic blending.', isLive: true, roomOrLink: '/teacher/live-class' },
  { id: 'sch3', title: 'Montessori Work Cycle (EPL & Sensorial)', category: 'sensorial', startTime: '09:45 AM', endTime: '10:30 AM', class: 'Junior Montessori (Nursery)', teacherName: 'James Harrison', description: 'Individual sensorial exploration with cylinder blocks, pink tower, and pouring sets.' },
  { id: 'sch4', title: 'Healthy Snack & Grace & Courtesy Table', category: 'snack_break', startTime: '10:30 AM', endTime: '11:00 AM', class: 'Junior Montessori (Nursery)', teacherName: 'Maria Montessori', description: 'Table setting, hand washing routine, eating fruits together with mindfulness.' },
  { id: 'sch5', title: 'Story Circle & Nursery Rhymes', category: 'storytelling', startTime: '11:00 AM', endTime: '11:35 AM', class: 'Junior Montessori (Nursery)', teacherName: 'Omar Sheikh', description: 'Interactive storybook with puppets and rhymes with musical instruments.' },
  { id: 'sch6', title: 'Creative Art, Playdough & Gross Motor Outdoor Play', category: 'outdoor_play', startTime: '11:35 AM', endTime: '12:15 PM', class: 'Junior Montessori (Nursery)', teacherName: 'Priya Sharma', description: 'Clay modeling, parachute games, balance beams, and farewell song.' },
];

export const seedAttendance: AttendanceRecord[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date('2026-08-26');
  d.setDate(d.getDate() - (29 - i));
  const st: AttendanceRecord['status'] = i === 2 ? 'leave' : (i % 9 === 0 ? 'absent' : 'present');
  return { id: `att-s1-${i}`, studentId: 's1', date: d.toISOString().split('T')[0], status: st, markedBy: 't1' };
});

export const seedLeaveRequests: LeaveRequest[] = [
  { id: 'lr1', kind: 'student', studentId: 's1', studentName: 'Ali Hassan', parentId: 'p1', parentName: 'Mr. Hassan Ahmed', fromDate: '2026-08-24', toDate: '2026-08-24', reason: 'Pediatric checkup & vaccination.', status: 'accepted', submittedAt: '2026-08-23', respondedAt: '2026-08-23', respondedBy: 't1' },
  { id: 'lr2', kind: 'student', studentId: 's2', studentName: 'Zara Ahmed', parentId: 'p1', parentName: 'Mr. Hassan Ahmed', fromDate: '2026-08-27', toDate: '2026-08-27', reason: 'Family travel out of station.', status: 'pending', submittedAt: '2026-08-25' },
];

export const seedRemarks: Remark[] = [
  { id: 'rem1', teacherId: 't1', teacherName: 'Maria Montessori', teacherSubject: 'Phonics & Early Language', studentId: 's1', studentName: 'Ali Hassan', parentId: 'p1', content: '<p>Ali has shown <strong>wonderful excitement during phonics circle</strong>! He recognized sandpaper letters <em>/s/, /a/, and /t/</em> instantly and helped clean his work mat carefully.</p>', type: 'positive', createdAt: '2026-08-25' },
  { id: 'rem2', teacherId: 't2', teacherName: 'James Harrison', teacherSubject: 'Sensorial & Practical Life', studentId: 's1', studentName: 'Ali Hassan', parentId: 'p1', content: '<p>Ali is practicing with the wooden cylinder blocks. He occasionally rushes through the sorting; encouraging calm patience and self-correction at home will support him nicely.</p>', type: 'constructive', createdAt: '2026-08-23' },
  { id: 'rem3', teacherId: 't1', teacherName: 'Maria Montessori', teacherSubject: 'Phonics & Early Language', studentId: 's2', studentName: 'Zara Ahmed', parentId: 'p1', content: '<p>Zara is a <strong>shining star</strong> in storytelling! She recited the complete alphabet rhyme and demonstrated beautiful sharing habits with classmates.</p>', type: 'positive', createdAt: '2026-08-24' },
];

export const seedLiveClass: LiveClassSession = {
  isActive: true,
  topic: 'Interactive Phonics & Letter Sound Recognition Circle',
  subject: 'Phonics & Language',
  class: 'Junior Montessori (Nursery)',
  teacherName: 'Maria Montessori',
  startedAt: new Date().toISOString(),
  participantsCount: 8,
};
