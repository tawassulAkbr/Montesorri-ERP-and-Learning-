import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const hash = (pw: string) => bcrypt.hash(pw, 10);

const CLASSES = {
  toddler: 'Early Childhood / Toddler (Ages 1.5 - 3)',
  primary: 'Primary Montessori / Playgroup & Nursery (Ages 3 - 6)',
  lower: 'Lower Elementary / Prep & Class 1 (Ages 6 - 9)',
  upper: 'Upper Elementary / Class 2 - 5 (Ages 9 - 12)',
};

async function main() {
  await prisma.$transaction([
    prisma.inventoryMovement.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.submission.deleteMany(),
    prisma.assignment.deleteMany(),
    prisma.feedback.deleteMany(),
    prisma.message.deleteMany(),
    prisma.liveClassSession.deleteMany(),
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
    prisma.studentBadge.deleteMany(),
    prisma.badge.deleteMany(),
    prisma.learningSession.deleteMany(),
    prisma.studentStreak.deleteMany(),
    prisma.learningQuestion.deleteMany(),
    prisma.school.deleteMany(),
  ]);

  const school = await prisma.school.create({
    data: { name: 'KinderGuide Montessori School', city: 'Lahore', address: '12 Garden Lane, Lahore', phone: '+92 42 111 546 337' },
  });

  const admin = await prisma.admin.create({
    data: { name: 'Tawassul Akbar', email: 'admin@kinderguide.com', adminCode: 'ADM-001', schoolId: school.id },
  });
  const teacher = await prisma.teacher.create({
    data: {
      name: 'Amina Khan',
      email: 'amina.khan@faculty.kinderguide.com',
      employeeId: 'EMP-001',
      subject: 'Practical Life, Sensorial, Language Arts, Mathematics, Cultural Studies / General Knowledge, Islamiyat',
      qualification: 'AMI Montessori Diploma',
      phone: '+92 300 1234567',
      classes: [CLASSES.primary, CLASSES.upper],
      schoolId: school.id,
      joinDate: '2024-04-01',
    },
  });
  const parent = await prisma.parent.create({
    data: { name: 'Zahra Ahmed', email: 'bilal.ahmed@parent.kinderguide.com', phone: '+92 310 1111111', schoolId: school.id },
  });
  const student = await prisma.student.create({
    data: {
      name: 'Bilal Ahmed',
      email: 'bilal.ahmed@kinderguide.com',
      rollNo: '01',
      enrollmentId: 'KG-2026-001',
      class: CLASSES.primary,
      ageGroup: 'Ages 3 - 6',
      parentId: parent.id,
      schoolId: school.id,
      phone: '+92 310 1111111',
      address: '12 Garden Lane, Lahore',
      guardianName: 'Zahra Ahmed',
      feeAmount: 12000,
      feeDue: true,
    },
  });

  await prisma.credential.createMany({
    data: [
      { email: admin.email, passwordHash: await hash('admin123'), role: 'ADMIN', userId: admin.id },
      { email: teacher.email, passwordHash: await hash('teacher123'), role: 'TEACHER', userId: teacher.id },
      { email: parent.email, passwordHash: await hash('parent123'), role: 'PARENT', userId: parent.id },
      { email: student.email, passwordHash: await hash('student123'), role: 'STUDENT', userId: student.id },
    ],
  });

  await prisma.liveClassSession.create({
    data: { schoolId: school.id, isActive: false, topic: '', subject: '', class: '', teacherName: '', startedAt: '', participantsCount: 0 },
  });

  await prisma.scheduleItem.createMany({
    data: [
      { schoolId: school.id, title: 'Morning Circle & Grace', category: 'CIRCLE_TIME', startTime: '08:30 AM', endTime: '09:00 AM', class: CLASSES.primary, teacherName: teacher.name, description: 'Greeting, duas, calendar, weather, and classroom responsibilities.' },
      { schoolId: school.id, title: 'Sensorial Work Cycle', category: 'SENSORIAL', startTime: '09:00 AM', endTime: '09:45 AM', class: CLASSES.primary, teacherName: teacher.name, description: 'Pink tower, knobbed cylinders, color tablets, and observation notes.' },
      { schoolId: school.id, title: 'Language Arts & Islamiyat', category: 'PHONICS', startTime: '10:00 AM', endTime: '10:45 AM', class: CLASSES.primary, teacherName: teacher.name, description: 'Urdu/English sounds, vocabulary, duas, and basic Islamic manners.' },
    ],
  });

  await prisma.learningQuestion.createMany({
    data: [
      { gradeClass: CLASSES.primary, area: 'Practical Life', emoji: '🥛', question: 'Which activity builds careful hand control?', options: ['Pouring water', 'Running fast', 'Shouting', 'Skipping lunch'], correctIndex: 0 },
      { gradeClass: CLASSES.primary, area: 'Sensorial', emoji: '🟦', question: 'Which material helps compare sizes?', options: ['Pink tower', 'Lunch box', 'School van', 'Pencil case'], correctIndex: 0 },
      { gradeClass: CLASSES.upper, area: 'Cultural Studies / General Knowledge', emoji: '🇵🇰', question: 'What is the capital of Pakistan?', options: ['Islamabad', 'Lahore', 'Karachi', 'Peshawar'], correctIndex: 0 },
      { gradeClass: CLASSES.upper, area: 'Islamiyat', emoji: '🕌', question: 'Muslims pray how many times daily?', options: ['5', '2', '3', '7'], correctIndex: 0 },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: student.id, role: 'STUDENT', title: 'Fee due', message: 'A fee payment is due. Please ask your parent to contact the school office.', type: 'WARNING', kind: 'FEE_DUE', relatedStudentId: student.id },
      { userId: parent.id, role: 'PARENT', title: 'Fee due', message: 'A fee payment is due for Bilal Ahmed. Please contact the school office.', type: 'WARNING', kind: 'FEE_DUE', relatedStudentId: student.id },
    ],
  });

  console.log('Seed complete: Tawassul Akbar, Amina Khan, Bilal Ahmed, Zahra Ahmed.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
