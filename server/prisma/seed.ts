// Seeds the KinderGuide database with the single admin (superuser), known demo
// accounts for each portal, and rich Montessori sample data.
// Run: npm run db:seed  (idempotent-ish: wipes demo collections first, then re-creates)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hash = (pw: string) => bcrypt.hash(pw, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const isoNow = () => new Date().toISOString();

const CLASSES = {
  toddler: 'Montessori Toddler (Playgroup)',
  junior: 'Junior Montessori (Nursery)',
  senior: 'Senior Montessori (Prep)',
};

async function main() {
  // Wipe previous demo/test data (FK-safe order) so reseeding is clean.
  await prisma.$transaction([
    prisma.attendanceRecord.deleteMany(),
    prisma.teacherAttendanceRecord.deleteMany(),
    prisma.testResult.deleteMany(),
    prisma.leaveRequest.deleteMany(),
    prisma.remark.deleteMany(),
    prisma.dailyWork.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.lesson.deleteMany(),
    prisma.test.deleteMany(),
    prisma.scheduleItem.deleteMany(),
    prisma.student.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.parent.deleteMany(),
    prisma.admin.deleteMany(),
    prisma.credential.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
  ]);

  // ─── Users ─────────────────────────────────────────────────────────────────
  const admin = await prisma.admin.create({
    data: { name: 'Dr. Khalid Mahmood', email: 'admin@kinderguide.edu', adminCode: 'ADM-001' },
  });

  const teachersData = [
    { name: 'Maria Montessori', email: 'sarah.mitchell@kinderguide.edu', password: 'teacher123', subject: 'Phonics & Early Language', qualification: 'AMI Montessori Diploma', phone: '+92 300 1234567', classes: [CLASSES.junior, CLASSES.senior] },
    { name: 'James Harrison', email: 'james.harrison@kinderguide.edu', password: 'teacher123', subject: 'Sensorial & Practical Life (EPL)', qualification: 'B.Ed Early Years', phone: '+92 301 2345678', classes: [CLASSES.toddler, CLASSES.junior] },
    { name: 'Fatima Al-Rashid', email: 'fatima.alrashid@kinderguide.edu', password: 'teacher123', subject: 'Early Mathematics & Counting', qualification: 'M.Ed Mathematics', phone: '+92 302 3456789', classes: [CLASSES.junior, CLASSES.senior] },
    { name: 'Omar Sheikh', email: 'omar.sheikh@kinderguide.edu', password: 'teacher123', subject: 'Rhymes, Story Circle & Arabic', qualification: 'MA Arabic & Islamic Studies', phone: '+92 303 4567890', classes: [CLASSES.junior, CLASSES.senior] },
    { name: 'Priya Sharma', email: 'priya.sharma@kinderguide.edu', password: 'teacher123', subject: 'Creative Arts & Motor Skills', qualification: 'Diploma in Fine Arts', phone: '+92 304 5678901', classes: [CLASSES.toddler, CLASSES.junior] },
  ];

  const teachers: Record<string, string> = {};
  for (let i = 0; i < teachersData.length; i++) {
    const t = teachersData[i];
    const teacher = await prisma.teacher.create({
      data: {
        name: t.name, email: t.email, subject: t.subject, qualification: t.qualification,
        phone: t.phone, classes: t.classes, employeeId: `EMP-${String(i + 1).padStart(3, '0')}`,
      },
    });
    await prisma.credential.create({
      data: { email: t.email, passwordHash: await hash(t.password), role: 'TEACHER', userId: teacher.id },
    });
    teachers[t.email] = teacher.id;
  }

  const parentsData = [
    { name: 'Mr. Hassan Ahmed', email: 'hassan.ahmed@parent.com', password: 'parent123', phone: '+92 310 1111111' },
    { name: 'Mrs. Sana Khan', email: 'sana.khan@parent.com', password: 'parent123', phone: '+92 310 2222222' },
    { name: 'Mr. Tariq Raza', email: 'tariq.raza@parent.com', password: 'parent123', phone: '+92 310 3333333' },
    { name: 'Mrs. Amna Siddiqui', email: 'amna.siddiqui@parent.com', password: 'parent123', phone: '+92 310 4444444' },
  ];

  const parents: Record<string, string> = {};
  for (const p of parentsData) {
    const parent = await prisma.parent.create({ data: { name: p.name, email: p.email, phone: p.phone } });
    await prisma.credential.create({
      data: { email: p.email, passwordHash: await hash(p.password), role: 'PARENT', userId: parent.id },
    });
    parents[p.email] = parent.id;
  }

  const studentsData = [
    { name: 'Ali Hassan', email: 'ali.hassan@student.edu', password: 'student123', cls: CLASSES.junior, ageGroup: '3-4 Years', parent: 'hassan.ahmed@parent.com', guardian: 'Mr. Hassan Ahmed', phone: '+92 310 1111111', address: '12 Garden Lane, Lahore', fee: 12000, feeDue: true, created: daysAgo(220) },
    { name: 'Zara Ahmed', email: 'zara.ahmed@student.edu', password: 'student123', cls: CLASSES.junior, ageGroup: '3-4 Years', parent: 'hassan.ahmed@parent.com', guardian: 'Mr. Hassan Ahmed', phone: '+92 310 1111111', address: '12 Garden Lane, Lahore', fee: 12000, feeDue: false, created: daysAgo(220) },
    { name: 'Hamza Khan', email: 'hamza.khan@student.edu', password: 'student123', cls: CLASSES.junior, ageGroup: '3-4 Years', parent: 'sana.khan@parent.com', guardian: 'Mrs. Sana Khan', phone: '+92 310 2222222', address: '45 Canal View, Lahore', fee: 12000, feeDue: false, created: daysAgo(200) },
    { name: 'Fatima Malik', email: 'fatima.malik@student.edu', password: 'student123', cls: CLASSES.junior, ageGroup: '3-4 Years', parent: 'sana.khan@parent.com', guardian: 'Mrs. Sana Khan', phone: '+92 310 2222222', address: '45 Canal View, Lahore', fee: 12000, feeDue: true, created: daysAgo(180) },
    { name: 'Usman Tariq', email: 'usman.tariq@student.edu', password: 'student123', cls: CLASSES.senior, ageGroup: '4-5 Years', parent: 'tariq.raza@parent.com', guardian: 'Mr. Tariq Raza', phone: '+92 310 3333333', address: '8 Model Town, Lahore', fee: 14000, feeDue: false, created: daysAgo(160) },
    { name: 'Aisha Raza', email: 'aisha.raza@student.edu', password: 'student123', cls: CLASSES.senior, ageGroup: '4-5 Years', parent: 'tariq.raza@parent.com', guardian: 'Mr. Tariq Raza', phone: '+92 310 3333333', address: '8 Model Town, Lahore', fee: 14000, feeDue: false, created: daysAgo(150) },
    { name: 'Ibrahim Siddiqui', email: 'ibrahim.siddiqui@student.edu', password: 'student123', cls: CLASSES.toddler, ageGroup: '2-3 Years', parent: 'amna.siddiqui@parent.com', guardian: 'Mrs. Amna Siddiqui', phone: '+92 310 4444444', address: '22 DHA Phase 5, Lahore', fee: 10000, feeDue: false, created: daysAgo(5) },
    { name: 'Hina Nawaz', email: 'hina.nawaz@student.edu', password: 'student123', cls: CLASSES.toddler, ageGroup: '2-3 Years', parent: 'amna.siddiqui@parent.com', guardian: 'Mrs. Amna Siddiqui', phone: '+92 310 4444444', address: '22 DHA Phase 5, Lahore', fee: 10000, feeDue: false, created: daysAgo(2) },
  ];

  const students: Record<string, string> = {};
  const rollCounters: Record<string, number> = {};
  for (let i = 0; i < studentsData.length; i++) {
    const s = studentsData[i];
    rollCounters[s.cls] = (rollCounters[s.cls] || 0) + 1;
    const student = await prisma.student.create({
      data: {
        name: s.name, email: s.email, class: s.cls, ageGroup: s.ageGroup,
        rollNo: String(rollCounters[s.cls]).padStart(2, '0'),
        enrollmentId: `MON-2026-${String(i + 1).padStart(3, '0')}`,
        parentId: parents[s.parent], phone: s.phone, address: s.address,
        guardianName: s.guardian, feeAmount: s.fee, feeDue: s.feeDue,
        createdAt: new Date(s.created),
      },
    });
    await prisma.credential.create({
      data: { email: s.email, passwordHash: await hash(s.password), role: 'STUDENT', userId: student.id },
    });
    students[s.email] = student.id;
  }

  await prisma.credential.create({
    data: { email: admin.email, passwordHash: await hash('admin123'), role: 'ADMIN', userId: admin.id },
  });

  const mariaId = teachers['sarah.mitchell@kinderguide.edu'];
  const jamesId = teachers['james.harrison@kinderguide.edu'];
  const fatimaId = teachers['fatima.alrashid@kinderguide.edu'];
  const omarId = teachers['omar.sheikh@kinderguide.edu'];
  const priyaId = teachers['priya.sharma@kinderguide.edu'];
  const aliId = students['ali.hassan@student.edu'];
  const zaraId = students['zara.ahmed@student.edu'];
  const hamzaId = students['hamza.khan@student.edu'];
  const fatimaSId = students['fatima.malik@student.edu'];

  // ─── Lessons ───────────────────────────────────────────────────────────────
  await prisma.lesson.createMany({
    data: [
      { title: 'Phonics Letter Sounds: /s/ /a/ /t/ /p/', subject: 'Phonics & Language', class: CLASSES.junior, teacherId: mariaId, teacherName: 'Maria Montessori', youtubeId: 'BELlZKpi1Zs', description: 'Jolly phonics actions and phonetic sound recognition songs.', duration: '08:45', uploadedAt: daysAgo(3), views: 42 },
      { title: 'Montessori Sensorial: Knobbed Cylinder Blocks', subject: 'Sensorial & Practical Life', class: CLASSES.junior, teacherId: jamesId, teacherName: 'James Harrison', youtubeId: 'B-d3jE2-2XU', description: 'Developing visual discrimination of dimensions (height, diameter, and volume).', duration: '06:30', uploadedAt: daysAgo(4), views: 56 },
      { title: 'Early Math: Number Rods & Sandpaper Numbers', subject: 'Early Mathematics', class: CLASSES.junior, teacherId: fatimaId, teacherName: 'Fatima Al-Rashid', youtubeId: 'DR-cfDsHCGA', description: 'Counting quantities 1 to 10 with tactile sandpaper number tracings.', duration: '07:15', uploadedAt: daysAgo(5), views: 38 },
      { title: 'Practical Life: Pouring Water & Fine Motor Grip', subject: 'Sensorial & Practical Life', class: CLASSES.toddler, teacherId: jamesId, teacherName: 'James Harrison', youtubeId: 'G1Db4j88-7I', description: 'Dry pouring and liquid transfer to build wrist coordination and concentration.', duration: '05:20', uploadedAt: daysAgo(6), views: 65 },
      { title: 'Color Mixing & Sensory Finger Painting', subject: 'Creative Arts & Crafts', class: CLASSES.junior, teacherId: priyaId, teacherName: 'Priya Sharma', youtubeId: 'JkqpWyijGx8', description: 'Exploring primary colors and finger blending to create secondary shades.', duration: '09:10', uploadedAt: daysAgo(8), views: 48 },
      { title: 'Arabic Nursery Rhymes & Animal Sounds', subject: 'Rhymes & Story Circle', class: CLASSES.junior, teacherId: omarId, teacherName: 'Omar Sheikh', youtubeId: 'GgEPKEKkRpk', description: 'Fun interactive singing and vocabulary building through catchy rhymes.', duration: '11:00', uploadedAt: daysAgo(9), views: 35 },
    ],
  });

  // ─── Tests (milestones) + results ──────────────────────────────────────────
  const test1 = await prisma.test.create({
    data: { title: 'Milestone 1: 3-Letter CVC Phonics Reading', subject: 'Phonics & Language', class: CLASSES.junior, teacherId: mariaId, date: daysAgo(-2), maxMarks: 20, instructions: 'Observe sound blending of short vowel words (cat, dog, sun, pin).', status: 'upcoming', createdAt: daysAgo(8) },
  });
  const test2 = await prisma.test.create({
    data: { title: 'Sensorial Evaluation: Pink Tower & Broad Stairs', subject: 'Sensorial & Practical Life', class: CLASSES.junior, teacherId: jamesId, date: daysAgo(-3), maxMarks: 20, instructions: 'Evaluation of size grading from largest to smallest cube.', status: 'upcoming', createdAt: daysAgo(7) },
  });
  const test3 = await prisma.test.create({
    data: { title: 'Counting Quantities & Golden Beads (1-10)', subject: 'Early Mathematics', class: CLASSES.junior, teacherId: fatimaId, date: daysAgo(6), maxMarks: 20, instructions: 'One-to-one correspondence and number symbol association.', status: 'evaluated', createdAt: daysAgo(13) },
  });
  void test1; void test2;

  await prisma.testResult.createMany({
    data: [
      { testId: test3.id, testTitle: test3.title, studentId: aliId, subject: test3.subject, marksObtained: 19, maxMarks: 20, grade: 'A+', milestoneStatus: 'Mastered', date: daysAgo(6), teacherComment: 'Ali accurately matched all spindle box counters with number cards independently!' },
      { testId: test3.id, testTitle: test3.title, studentId: zaraId, subject: test3.subject, marksObtained: 17, maxMarks: 20, grade: 'A', milestoneStatus: 'Mastered', date: daysAgo(6), teacherComment: 'Great concentration and self-correction with the number rods.' },
      { testId: test3.id, testTitle: test3.title, studentId: hamzaId, subject: test3.subject, marksObtained: 18, maxMarks: 20, grade: 'A', milestoneStatus: 'Mastered', date: daysAgo(6), teacherComment: 'Showed enthusiastic counting skills in circle time.' },
      { testId: test3.id, testTitle: test3.title, studentId: fatimaSId, subject: test3.subject, marksObtained: 12, maxMarks: 20, grade: 'C', milestoneStatus: 'Developing', date: daysAgo(6), teacherComment: 'Needs more practice with number-symbol association.' },
    ],
  });

  // ─── Attendance (last 30 days for junior class) ────────────────────────────
  const juniorStudents = [aliId, zaraId, hamzaId, fatimaSId];
  const attOps = [];
  for (let i = 29; i >= 0; i--) {
    const date = daysAgo(i);
    const day = new Date(`${date}T12:00:00`).getDay();
    if (day === 0 || day === 6) continue;
    for (let sIdx = 0; sIdx < juniorStudents.length; sIdx++) {
      const status = (i + sIdx) % 9 === 0 ? 'ABSENT' : 'PRESENT';
      attOps.push(prisma.attendanceRecord.upsert({
        where: { studentId_date: { studentId: juniorStudents[sIdx], date } },
        update: { status: status as any },
        create: { studentId: juniorStudents[sIdx], date, status: status as any, markedBy: mariaId },
      }));
    }
  }
  await prisma.$transaction(attOps);

  // Teacher attendance: yesterday only (today left open so mark-present can be tested)
  await prisma.teacherAttendanceRecord.createMany({
    data: [mariaId, jamesId, fatimaId, omarId, priyaId].map(tid => ({
      teacherId: tid, date: daysAgo(1), status: 'PRESENT' as const,
    })),
  });

  // ─── Leaves ────────────────────────────────────────────────────────────────
  await prisma.leaveRequest.create({
    data: {
      kind: 'STUDENT', studentId: aliId, studentName: 'Ali Hassan',
      parentId: parents['hassan.ahmed@parent.com'], parentName: 'Mr. Hassan Ahmed',
      fromDate: daysAgo(4), toDate: daysAgo(4), reason: 'Pediatric checkup & vaccination.',
      status: 'ACCEPTED', submittedAt: daysAgo(5), respondedAt: daysAgo(5), respondedBy: mariaId,
    },
  });
  await prisma.leaveRequest.create({
    data: {
      kind: 'STUDENT', studentId: zaraId, studentName: 'Zara Ahmed',
      parentId: parents['hassan.ahmed@parent.com'], parentName: 'Mr. Hassan Ahmed',
      fromDate: daysAgo(-1), toDate: daysAgo(-1), reason: 'Family travel out of station.',
      status: 'PENDING', submittedAt: daysAgo(1),
    },
  });

  // ─── Remarks ───────────────────────────────────────────────────────────────
  await prisma.remark.createMany({
    data: [
      { teacherId: mariaId, teacherName: 'Maria Montessori', teacherSubject: 'Phonics & Early Language', studentId: aliId, studentName: 'Ali Hassan', parentId: parents['hassan.ahmed@parent.com'], content: '<p>Ali has shown <strong>wonderful excitement during phonics circle</strong>! He recognized sandpaper letters <em>/s/, /a/, and /t/</em> instantly and helped clean his work mat carefully.</p>', type: 'POSITIVE', createdAt: daysAgo(3) },
      { teacherId: jamesId, teacherName: 'James Harrison', teacherSubject: 'Sensorial & Practical Life', studentId: aliId, studentName: 'Ali Hassan', parentId: parents['hassan.ahmed@parent.com'], content: '<p>Ali is practicing with the wooden cylinder blocks. He occasionally rushes through the sorting; encouraging calm patience and self-correction at home will support him nicely.</p>', type: 'CONSTRUCTIVE', createdAt: daysAgo(5) },
      { teacherId: mariaId, teacherName: 'Maria Montessori', teacherSubject: 'Phonics & Early Language', studentId: zaraId, studentName: 'Zara Ahmed', parentId: parents['hassan.ahmed@parent.com'], content: '<p>Zara is a <strong>shining star</strong> in storytelling! She recited the complete alphabet rhyme and demonstrated beautiful sharing habits with classmates.</p>', type: 'POSITIVE', createdAt: daysAgo(4) },
    ],
  });

  // ─── Daily work ────────────────────────────────────────────────────────────
  await prisma.dailyWork.createMany({
    data: [
      { teacherId: mariaId, teacherName: 'Maria Montessori', teacherSubject: 'Phonics & Early Language', class: CLASSES.junior, content: '<p><strong>Today\'s Montessori Work:</strong></p><ul><li>Introduced sandpaper letter <strong>/m/</strong> with tactile tracing.</li><li>Sound box exploration with miniature objects (mat, mug, moon, mop).</li><li>Phonics action song and rhyme time.</li></ul><p><strong>Home Activity for Parents:</strong> Practice making the /m/ sound together while pointing to items around the house.</p>', attachmentName: 'letter_m_sound_worksheet.pdf', postedAt: isoNow(), visibleTo: ['students', 'parents'], completedByStudentIds: [aliId] },
      { teacherId: jamesId, teacherName: 'James Harrison', teacherSubject: 'Sensorial & Practical Life', class: CLASSES.junior, content: '<p><strong>Sensorial Practical Life Period:</strong></p><ul><li>Tongs transfer exercise using wool pom-poms (fine motor pincer grip).</li><li>Folding napkins & dressing frame with large buttons.</li><li>Walking on the line with harmony and poise.</li></ul>', postedAt: isoNow(), visibleTo: ['students', 'parents'], completedByStudentIds: [] },
      { teacherId: fatimaId, teacherName: 'Fatima Al-Rashid', teacherSubject: 'Early Mathematics', class: CLASSES.junior, content: '<p><strong>Math Sensorial Discovery:</strong></p><ul><li>Worked with Spindle Box (concept of zero and quantities 1-9).</li><li>Number song and hand-clapping rhythm.</li></ul>', attachmentName: 'counting_spindles_guide.pdf', postedAt: new Date(Date.now() - 86400000).toISOString(), visibleTo: ['students', 'parents'], completedByStudentIds: [aliId, zaraId] },
    ],
  });

  // ─── Schedule ──────────────────────────────────────────────────────────────
  await prisma.scheduleItem.createMany({
    data: [
      { title: 'Arrival, Greetings & Morning Circle', category: 'CIRCLE_TIME', startTime: '08:30 AM', endTime: '09:00 AM', class: CLASSES.junior, teacherName: 'Maria Montessori', description: 'Good morning song, calendar check, emotions chart, and weather wheel.' },
      { title: 'Live Online Phonics & Letter Sound Circle', category: 'LIVE_CLASS', startTime: '09:00 AM', endTime: '09:40 AM', class: CLASSES.junior, teacherName: 'Maria Montessori', description: 'Interactive whiteboard session on short vowel phonetic blending.', isLive: true, roomOrLink: '/teacher/live-class' },
      { title: 'Montessori Work Cycle (EPL & Sensorial)', category: 'SENSORIAL', startTime: '09:45 AM', endTime: '10:30 AM', class: CLASSES.junior, teacherName: 'James Harrison', description: 'Individual sensorial exploration with cylinder blocks, pink tower, and pouring sets.' },
      { title: 'Healthy Snack & Grace & Courtesy Table', category: 'SNACK_BREAK', startTime: '10:30 AM', endTime: '11:00 AM', class: CLASSES.junior, teacherName: 'Maria Montessori', description: 'Table setting, hand washing routine, eating fruits together with mindfulness.' },
      { title: 'Story Circle & Nursery Rhymes', category: 'STORYTELLING', startTime: '11:00 AM', endTime: '11:35 AM', class: CLASSES.junior, teacherName: 'Omar Sheikh', description: 'Interactive storybook with puppets and rhymes with musical instruments.' },
      { title: 'Creative Art, Playdough & Gross Motor Outdoor Play', category: 'OUTDOOR_PLAY', startTime: '11:35 AM', endTime: '12:15 PM', class: CLASSES.junior, teacherName: 'Priya Sharma', description: 'Clay modeling, parachute games, balance beams, and farewell song.' },
    ],
  });

  // ─── Notifications ─────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: aliId, role: 'STUDENT', title: 'Fee due', message: 'A fee payment is due. Please contact the school office.', type: 'WARNING', kind: 'FEE_DUE', relatedStudentId: aliId },
      { userId: parents['hassan.ahmed@parent.com'], role: 'PARENT', title: 'Fee due', message: 'A fee payment is due for Ali Hassan. Please contact the school office.', type: 'WARNING', kind: 'FEE_DUE', relatedStudentId: aliId },
      { userId: fatimaSId, role: 'STUDENT', title: 'Fee due', message: 'A fee payment is due. Please contact the school office.', type: 'WARNING', kind: 'FEE_DUE', relatedStudentId: fatimaSId },
      { userId: parents['sana.khan@parent.com'], role: 'PARENT', title: 'Fee due', message: 'A fee payment is due for Fatima Malik. Please contact the school office.', type: 'WARNING', kind: 'FEE_DUE', relatedStudentId: fatimaSId },
      { userId: aliId, role: 'STUDENT', title: 'New Milestone', message: 'A phonics milestone is scheduled this week.', type: 'INFO', kind: 'GENERAL' },
      { userId: parents['hassan.ahmed@parent.com'], role: 'PARENT', title: 'Leave Request Accepted', message: "Ali Hassan's leave request has been accepted.", type: 'SUCCESS', kind: 'GENERAL' },
      { userId: mariaId, role: 'TEACHER', title: 'New enrollment', message: 'Review new children on your class roster.', type: 'INFO', kind: 'GENERAL' },
      { userId: admin.id, role: 'ADMIN', title: 'Attendance reminder', message: 'Faculty who do not mark present are marked absent automatically.', type: 'INFO', kind: 'GENERAL' },
    ],
  });

  // ─── Live class singleton ──────────────────────────────────────────────────
  await prisma.liveClassSession.upsert({
    where: { id: 'singleton' },
    update: { isActive: true, topic: 'Interactive Phonics & Letter Sound Recognition Circle', subject: 'Phonics & Language', class: CLASSES.junior, teacherName: 'Maria Montessori', startedAt: isoNow(), participantsCount: 8 },
    create: { id: 'singleton', isActive: true, topic: 'Interactive Phonics & Letter Sound Recognition Circle', subject: 'Phonics & Language', class: CLASSES.junior, teacherName: 'Maria Montessori', startedAt: isoNow(), participantsCount: 8 },
  });

  console.log('Seed complete.');
  console.log('Demo accounts:');
  console.log('  admin:   admin@kinderguide.edu / admin123');
  console.log('  teacher: sarah.mitchell@kinderguide.edu / teacher123');
  console.log('  student: ali.hassan@student.edu / student123');
  console.log('  parent:  hassan.ahmed@parent.com / parent123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
