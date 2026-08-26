import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Lesson, Test, TestResult, AttendanceRecord,
  LeaveRequest, Remark, DailyWork, ScheduleItem,
  LiveClassSession, Student, Teacher, Parent
} from '@/types';

// ─── Montessori Seed Data ─────────────────────────────────────────────────────

const initialMontessoriTeachers: Teacher[] = [
  {
    id: 't1', name: 'Maria Montessori', email: 'sarah.mitchell@kinderguide.edu',
    role: 'teacher', subject: 'Phonics & Early Language', employeeId: 'EMP-001',
    classes: ['Junior Montessori (Nursery)', 'Senior Montessori (Prep)'], phone: '+92 300 1234567', createdAt: '2023-09-01',
  },
  {
    id: 't2', name: 'James Harrison', email: 'james.harrison@kinderguide.edu',
    role: 'teacher', subject: 'Sensorial & Practical Life (EPL)', employeeId: 'EMP-002',
    classes: ['Montessori Toddler (Playgroup)', 'Junior Montessori (Nursery)'], phone: '+92 301 2345678', createdAt: '2023-09-01',
  },
  {
    id: 't3', name: 'Fatima Al-Rashid', email: 'fatima.alrashid@kinderguide.edu',
    role: 'teacher', subject: 'Early Mathematics & Counting', employeeId: 'EMP-003',
    classes: ['Junior Montessori (Nursery)', 'Senior Montessori (Prep)'], phone: '+92 302 3456789', createdAt: '2023-09-01',
  },
  {
    id: 't4', name: 'Omar Sheikh', email: 'omar.sheikh@kinderguide.edu',
    role: 'teacher', subject: 'Rhymes, Story Circle & Arabic', employeeId: 'EMP-004',
    classes: ['Junior Montessori (Nursery)', 'Senior Montessori (Prep)'], phone: '+92 303 4567890', createdAt: '2023-09-01',
  },
  {
    id: 't5', name: 'Priya Sharma', email: 'priya.sharma@kinderguide.edu',
    role: 'teacher', subject: 'Creative Arts & Motor Skills', employeeId: 'EMP-005',
    classes: ['Montessori Toddler (Playgroup)', 'Junior Montessori (Nursery)'], phone: '+92 304 5678901', createdAt: '2023-09-01',
  },
];

const initialMontessoriStudents: Student[] = [
  { id: 's1', name: 'Ali Hassan', email: 'ali.hassan@student.edu', role: 'student', rollNo: '01', class: 'Junior Montessori (Nursery)', ageGroup: '3-4 Years', parentId: 'p1', enrollmentId: 'MON-2026-001', createdAt: '2024-01-10' },
  { id: 's2', name: 'Zara Ahmed', email: 'zara.ahmed@student.edu', role: 'student', rollNo: '02', class: 'Junior Montessori (Nursery)', ageGroup: '3-4 Years', parentId: 'p1', enrollmentId: 'MON-2026-002', createdAt: '2024-01-10' },
  { id: 's3', name: 'Hamza Khan', email: 'hamza.khan@student.edu', role: 'student', rollNo: '03', class: 'Junior Montessori (Nursery)', ageGroup: '3-4 Years', parentId: 'p2', enrollmentId: 'MON-2026-003', createdAt: '2024-01-10' },
  { id: 's4', name: 'Fatima Malik', email: 'fatima.malik@student.edu', role: 'student', rollNo: '04', class: 'Junior Montessori (Nursery)', ageGroup: '3-4 Years', parentId: 'p2', enrollmentId: 'MON-2026-004', createdAt: '2024-01-10' },
  { id: 's5', name: 'Usman Tariq', email: 'usman.tariq@student.edu', role: 'student', rollNo: '05', class: 'Senior Montessori (Prep)', ageGroup: '4-5 Years', parentId: 'p3', enrollmentId: 'MON-2026-005', createdAt: '2024-01-10' },
  { id: 's6', name: 'Aisha Raza', email: 'aisha.raza@student.edu', role: 'student', rollNo: '06', class: 'Senior Montessori (Prep)', ageGroup: '4-5 Years', parentId: 'p3', enrollmentId: 'MON-2026-006', createdAt: '2024-01-10' },
  { id: 's7', name: 'Ibrahim Siddiqui', email: 'ibrahim.siddiqui@student.edu', role: 'student', rollNo: '07', class: 'Montessori Toddler (Playgroup)', ageGroup: '2-3 Years', parentId: 'p4', enrollmentId: 'MON-2026-007', createdAt: '2024-01-10' },
  { id: 's8', name: 'Hina Nawaz', email: 'hina.nawaz@student.edu', role: 'student', rollNo: '08', class: 'Montessori Toddler (Playgroup)', ageGroup: '2-3 Years', parentId: 'p4', enrollmentId: 'MON-2026-008', createdAt: '2024-01-10' },
];

const initialMontessoriLessons: Lesson[] = [
  { id: 'l1', title: 'Phonics Letter Sounds: /s/ /a/ /t/ /p/', subject: 'Phonics & Language', class: 'Junior Montessori (Nursery)', teacherId: 't1', teacherName: 'Maria Montessori', youtubeId: 'BELlZKpi1Zs', description: 'Jolly phonics actions and phonetic sound recognition songs.', duration: '08:45', uploadedAt: '2026-08-25', views: 42 },
  { id: 'l2', title: 'Montessori Sensorial: Knobbed Cylinder Blocks', subject: 'Sensorial & Practical Life', class: 'Junior Montessori (Nursery)', teacherId: 't2', teacherName: 'James Harrison', youtubeId: 'B-d3jE2-2XU', description: 'Developing visual discrimination of dimensions (height, diameter, and volume).', duration: '06:30', uploadedAt: '2026-08-24', views: 56 },
  { id: 'l3', title: 'Early Math: Number Rods & Sandpaper Numbers', subject: 'Early Mathematics', class: 'Junior Montessori (Nursery)', teacherId: 't3', teacherName: 'Fatima Al-Rashid', youtubeId: 'DR-cfDsHCGA', description: 'Counting quantities 1 to 10 with tactile sandpaper number tracings.', duration: '07:15', uploadedAt: '2026-08-23', views: 38 },
  { id: 'l4', title: 'Practical Life: Pouring Water & Fine Motor Grip', subject: 'Sensorial & Practical Life', class: 'Montessori Toddler (Playgroup)', teacherId: 't2', teacherName: 'James Harrison', youtubeId: 'G1Db4j88-7I', description: 'Dry pouring and liquid transfer to build wrist coordination and concentration.', duration: '05:20', uploadedAt: '2026-08-22', views: 65 },
  { id: 'l5', title: 'Color Mixing & Sensory Finger Painting', subject: 'Creative Arts & Crafts', class: 'Junior Montessori (Nursery)', teacherId: 't5', teacherName: 'Priya Sharma', youtubeId: 'JkqpWyijGx8', description: 'Exploring primary colors and finger blending to create secondary shades.', duration: '09:10', uploadedAt: '2026-08-20', views: 48 },
  { id: 'l6', title: 'Arabic Nursery Rhymes & Animal Sounds', subject: 'Rhymes & Story Circle', class: 'Junior Montessori (Nursery)', teacherId: 't4', teacherName: 'Omar Sheikh', youtubeId: 'GgEPKEKkRpk', description: 'Fun interactive singing and vocabulary building through catchy rhymes.', duration: '11:00', uploadedAt: '2026-08-19', views: 35 },
];

const initialMontessoriMilestones: Test[] = [
  { id: 'te1', title: 'Milestone 1: 3-Letter CVC Phonics Reading', subject: 'Phonics & Language', class: 'Junior Montessori (Nursery)', teacherId: 't1', date: '2026-08-28', maxMarks: 20, instructions: 'Observe sound blending of short vowel words (cat, dog, sun, pin).', status: 'upcoming', createdAt: '2026-08-20' },
  { id: 'te2', title: 'Sensorial Evaluation: Pink Tower & Broad Stairs', subject: 'Sensorial & Practical Life', class: 'Junior Montessori (Nursery)', teacherId: 't2', date: '2026-08-29', maxMarks: 20, instructions: 'Evaluation of size grading from largest to smallest cube.', status: 'upcoming', createdAt: '2026-08-21' },
  { id: 'te3', title: 'Counting Quantities & Golden Beads (1-10)', subject: 'Early Mathematics', class: 'Junior Montessori (Nursery)', teacherId: 't3', date: '2026-08-22', maxMarks: 20, instructions: 'One-to-one correspondence and number symbol association.', status: 'evaluated', createdAt: '2026-08-15' },
];

const initialTestResults: TestResult[] = [
  { id: 'tr1', testId: 'te3', testTitle: 'Counting Quantities & Golden Beads (1-10)', studentId: 's1', subject: 'Early Mathematics', marksObtained: 19, maxMarks: 20, grade: 'A+', milestoneStatus: 'Mastered', date: '2026-08-22', teacherComment: 'Ali accurately matched all spindle box counters with number cards independently!' },
  { id: 'tr2', testId: 'te3', testTitle: 'Counting Quantities & Golden Beads (1-10)', studentId: 's2', subject: 'Early Mathematics', marksObtained: 17, maxMarks: 20, grade: 'A', milestoneStatus: 'Mastered', date: '2026-08-22', teacherComment: 'Great concentration and self-correction with the number rods.' },
  { id: 'tr3', testId: 'te3', testTitle: 'Counting Quantities & Golden Beads (1-10)', studentId: 's3', subject: 'Early Mathematics', marksObtained: 18, maxMarks: 20, grade: 'A', milestoneStatus: 'Mastered', date: '2026-08-22', teacherComment: 'Showed enthusiastic counting skills in circle time.' },
];

const initialMontessoriDailyWork: DailyWork[] = [
  {
    id: 'dw1',
    teacherId: 't1',
    teacherName: 'Maria Montessori',
    teacherSubject: 'Phonics & Early Language',
    class: 'Junior Montessori (Nursery)',
    content: '<p><strong>Today\'s Montessori Work:</strong></p><ul><li>Introduced sandpaper letter <strong>/m/</strong> with tactile tracing.</li><li>Sound box exploration with miniature objects (mat, mug, moon, mop).</li><li>Phonics action song and rhyme time.</li></ul><p><strong>Home Activity for Parents:</strong> Practice making the /m/ sound together while pointing to items around the house.</p>',
    attachmentName: 'letter_m_sound_worksheet.pdf',
    postedAt: '2026-08-26T08:45:00',
    visibleTo: ['students', 'parents'],
    completedByStudentIds: ['s1'],
  },
  {
    id: 'dw2',
    teacherId: 't2',
    teacherName: 'James Harrison',
    teacherSubject: 'Sensorial & Practical Life',
    class: 'Junior Montessori (Nursery)',
    content: '<p><strong>Sensorial Practical Life Period:</strong></p><ul><li>Tongs transfer exercise using wool pom-poms (fine motor pincer grip).</li><li>Folding napkins & dressing frame with large buttons.</li><li>Walking on the line with harmony and poise.</li></ul><p><strong>Note:</strong> Ali showed wonderful care and focus during the buttoning activity!</p>',
    postedAt: '2026-08-26T10:15:00',
    visibleTo: ['students', 'parents'],
    completedByStudentIds: [],
  },
  {
    id: 'dw3',
    teacherId: 't3',
    teacherName: 'Fatima Al-Rashid',
    teacherSubject: 'Early Mathematics',
    class: 'Junior Montessori (Nursery)',
    content: '<p><strong>Math Sensorial Discovery:</strong></p><ul><li>Worked with Spindle Box (concept of zero and quantities 1-9).</li><li>Number song and hand-clapping rhythm.</li></ul>',
    attachmentName: 'counting_spindles_guide.pdf',
    postedAt: '2026-08-25T11:00:00',
    visibleTo: ['students', 'parents'],
    completedByStudentIds: ['s1', 's2'],
  },
];

const initialSchedules: ScheduleItem[] = [
  { id: 'sch1', title: 'Arrival, Greetings & Morning Circle', category: 'circle_time', startTime: '08:30 AM', endTime: '09:00 AM', class: 'Junior Montessori (Nursery)', teacherName: 'Maria Montessori', description: 'Good morning song, calendar check, emotions chart, and weather wheel.' },
  { id: 'sch2', title: 'Live Online Phonics & Letter Sound Circle', category: 'live_class', startTime: '09:00 AM', endTime: '09:40 AM', class: 'Junior Montessori (Nursery)', teacherName: 'Maria Montessori', description: 'Interactive whiteboard session on short vowel phonetic blending.', isLive: true, roomOrLink: '/teacher/live-class' },
  { id: 'sch3', title: 'Montessori Work Cycle (EPL & Sensorial)', category: 'sensorial', startTime: '09:45 AM', endTime: '10:30 AM', class: 'Junior Montessori (Nursery)', teacherName: 'James Harrison', description: 'Individual sensorial exploration with cylinder blocks, pink tower, and pouring sets.' },
  { id: 'sch4', title: 'Healthy Snack & Grace & Courtesy Table', category: 'snack_break', startTime: '10:30 AM', endTime: '11:00 AM', class: 'Junior Montessori (Nursery)', teacherName: 'Maria Montessori', description: 'Table setting, hand washing routine, eating fruits together with mindfulness.' },
  { id: 'sch5', title: 'Story Circle & Nursery Rhymes', category: 'storytelling', startTime: '11:00 AM', endTime: '11:35 AM', class: 'Junior Montessori (Nursery)', teacherName: 'Omar Sheikh', description: 'Interactive storybook with puppets and rhymes with musical instruments.' },
  { id: 'sch6', title: 'Creative Art, Playdough & Gross Motor Outdoor Play', category: 'outdoor_play', startTime: '11:35 AM', endTime: '12:15 PM', class: 'Junior Montessori (Nursery)', teacherName: 'Priya Sharma', description: 'Clay modeling, parachute games, balance beams, and farewell song.' },
];

const initialAttendance: AttendanceRecord[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date('2026-08-26');
  d.setDate(d.getDate() - (29 - i));
  const st: AttendanceRecord['status'] = i === 2 ? 'leave' : (i % 9 === 0 ? 'absent' : 'present');
  return {
    id: `att-s1-${i}`,
    studentId: 's1',
    date: d.toISOString().split('T')[0],
    status: st,
    markedBy: 't1',
  };
});

const initialLeaveRequests: LeaveRequest[] = [
  { id: 'lr1', studentId: 's1', studentName: 'Ali Hassan', parentId: 'p1', parentName: 'Mr. Hassan Ahmed', fromDate: '2026-08-24', toDate: '2026-08-24', reason: 'Pediatric checkup & vaccination.', status: 'accepted', submittedAt: '2026-08-23', respondedAt: '2026-08-23', respondedBy: 't1' },
  { id: 'lr2', studentId: 's2', studentName: 'Zara Ahmed', parentId: 'p1', parentName: 'Mr. Hassan Ahmed', fromDate: '2026-08-27', toDate: '2026-08-27', reason: 'Family travel out of station.', status: 'pending', submittedAt: '2026-08-25' },
];

const initialRemarks: Remark[] = [
  { id: 'rem1', teacherId: 't1', teacherName: 'Maria Montessori', teacherSubject: 'Phonics & Early Language', studentId: 's1', studentName: 'Ali Hassan', parentId: 'p1', content: '<p>Ali has shown <strong>wonderful excitement during phonics circle</strong>! He recognized sandpaper letters <em>/s/, /a/, and /t/</em> instantly and helped clean his work mat carefully.</p>', type: 'positive', createdAt: '2026-08-25' },
  { id: 'rem2', teacherId: 't2', teacherName: 'James Harrison', teacherSubject: 'Sensorial & Practical Life', studentId: 's1', studentName: 'Ali Hassan', parentId: 'p1', content: '<p>Ali is practicing with the wooden cylinder blocks. He occasionally rushes through the sorting; encouraging calm patience and self-correction at home will support him nicely.</p>', type: 'constructive', createdAt: '2026-08-23' },
  { id: 'rem3', teacherId: 't1', teacherName: 'Maria Montessori', teacherSubject: 'Phonics & Early Language', studentId: 's2', studentName: 'Zara Ahmed', parentId: 'p1', content: '<p>Zara is a <strong>shining star</strong> in storytelling! She recited the complete alphabet rhyme and demonstrated beautiful sharing habits with classmates.</p>', type: 'positive', createdAt: '2026-08-24' },
];

// ─── Data Context Interface ───────────────────────────────────────────────────

interface DataContextType {
  // Lists
  students: Student[];
  teachers: Teacher[];
  lessons: Lesson[];
  tests: Test[];
  testResults: TestResult[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  remarks: Remark[];
  dailyWork: DailyWork[];
  schedules: ScheduleItem[];
  liveClass: LiveClassSession;

  // Actions
  addLesson: (lesson: Omit<Lesson, 'id' | 'views' | 'uploadedAt'>) => void;
  deleteLesson: (id: string) => void;
  addTest: (test: Omit<Test, 'id' | 'createdAt' | 'status'>) => void;
  markDailyAttendance: (records: { studentId: string; date: string; status: AttendanceRecord['status'] }[]) => void;
  applyLeave: (leave: { studentId: string; studentName: string; fromDate: string; toDate: string; reason: string }) => void;
  updateLeaveStatus: (leaveId: string, status: 'accepted' | 'rejected') => void;
  addRemark: (remark: Omit<Remark, 'id' | 'createdAt'>) => void;
  addDailyWork: (work: Omit<DailyWork, 'id' | 'postedAt'>) => void;
  toggleDailyWorkDone: (workId: string, studentId: string) => void;
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  deleteScheduleItem: (id: string) => void;
  startLiveClass: (topic: string, subject: string, targetClass: string) => void;
  endLiveClass: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Helper for localStorage with initial fallback
  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`kg_data_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [students, setStudents] = useState<Student[]>(() => getStored('students', initialMontessoriStudents));
  const [teachers, setTeachers] = useState<Teacher[]>(() => getStored('teachers', initialMontessoriTeachers));
  const [lessons, setLessons] = useState<Lesson[]>(() => getStored('lessons', initialMontessoriLessons));
  const [tests, setTests] = useState<Test[]>(() => getStored('tests', initialMontessoriMilestones));
  const [testResults, setTestResults] = useState<TestResult[]>(() => getStored('testResults', initialTestResults));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStored('attendance', initialAttendance));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => getStored('leaves', initialLeaveRequests));
  const [remarks, setRemarks] = useState<Remark[]>(() => getStored('remarks', initialRemarks));
  const [dailyWork, setDailyWork] = useState<DailyWork[]>(() => getStored('dailyWork', initialMontessoriDailyWork));
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => getStored('schedules', initialSchedules));
  const [liveClass, setLiveClass] = useState<LiveClassSession>(() => getStored('liveClass', {
    isActive: true,
    topic: 'Interactive Phonics & Letter Sound Recognition Circle',
    subject: 'Phonics & Language',
    class: 'Junior Montessori (Nursery)',
    teacherName: 'Maria Montessori',
    startedAt: new Date().toISOString(),
    participantsCount: 8,
  }));

  // Auto-sync to localStorage on any state change
  useEffect(() => { localStorage.setItem('kg_data_lessons', JSON.stringify(lessons)); }, [lessons]);
  useEffect(() => { localStorage.setItem('kg_data_tests', JSON.stringify(tests)); }, [tests]);
  useEffect(() => { localStorage.setItem('kg_data_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('kg_data_leaves', JSON.stringify(leaveRequests)); }, [leaveRequests]);
  useEffect(() => { localStorage.setItem('kg_data_remarks', JSON.stringify(remarks)); }, [remarks]);
  useEffect(() => { localStorage.setItem('kg_data_dailyWork', JSON.stringify(dailyWork)); }, [dailyWork]);
  useEffect(() => { localStorage.setItem('kg_data_schedules', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('kg_data_liveClass', JSON.stringify(liveClass)); }, [liveClass]);

  // Action implementations
  const addLesson = (lessonData: Omit<Lesson, 'id' | 'views' | 'uploadedAt'>) => {
    const newLesson: Lesson = {
      ...lessonData,
      id: `lesson-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
      views: 0,
    };
    setLessons(prev => [newLesson, ...prev]);
  };

  const deleteLesson = (id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
  };

  const addTest = (testData: Omit<Test, 'id' | 'createdAt' | 'status'>) => {
    const newTest: Test = {
      ...testData,
      id: `test-${Date.now()}`,
      status: 'upcoming',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTests(prev => [newTest, ...prev]);
  };

  const markDailyAttendance = (newRecords: { studentId: string; date: string; status: AttendanceRecord['status'] }[]) => {
    setAttendance(prev => {
      const updated = [...prev];
      newRecords.forEach(rec => {
        const existingIdx = updated.findIndex(r => r.studentId === rec.studentId && r.date === rec.date);
        if (existingIdx >= 0) {
          updated[existingIdx] = { ...updated[existingIdx], status: rec.status };
        } else {
          updated.push({
            id: `att-${rec.studentId}-${rec.date}`,
            studentId: rec.studentId,
            date: rec.date,
            status: rec.status,
            markedBy: 't1',
          });
        }
      });
      return updated;
    });
  };

  const applyLeave = (data: { studentId: string; studentName: string; fromDate: string; toDate: string; reason: string }) => {
    const newLeave: LeaveRequest = {
      id: `lr-${Date.now()}`,
      studentId: data.studentId,
      studentName: data.studentName,
      parentId: 'p1',
      parentName: 'Mr. Hassan Ahmed',
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests(prev => [newLeave, ...prev]);
  };

  const updateLeaveStatus = (leaveId: string, status: 'accepted' | 'rejected') => {
    setLeaveRequests(prev => prev.map(l => {
      if (l.id === leaveId) {
        const updated = { ...l, status, respondedAt: new Date().toISOString().split('T')[0], respondedBy: 't1' };
        // If accepted, automatically sync attendance records to 'leave' (grey) for those dates!
        if (status === 'accepted') {
          setAttendance(attPrev => {
            const attUpdated = [...attPrev];
            const date = l.fromDate;
            const idx = attUpdated.findIndex(r => r.studentId === l.studentId && r.date === date);
            if (idx >= 0) {
              attUpdated[idx] = { ...attUpdated[idx], status: 'leave', leaveRequestId: l.id };
            } else {
              attUpdated.push({
                id: `att-${l.studentId}-${date}`,
                studentId: l.studentId,
                date,
                status: 'leave',
                markedBy: 't1',
                leaveRequestId: l.id,
              });
            }
            return attUpdated;
          });
        }
        return updated;
      }
      return l;
    }));
  };

  const addRemark = (remarkData: Omit<Remark, 'id' | 'createdAt'>) => {
    const newRemark: Remark = {
      ...remarkData,
      id: `rem-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setRemarks(prev => [newRemark, ...prev]);
  };

  const addDailyWork = (workData: Omit<DailyWork, 'id' | 'postedAt'>) => {
    const newWork: DailyWork = {
      ...workData,
      id: `dw-${Date.now()}`,
      postedAt: new Date().toISOString(),
      completedByStudentIds: [],
    };
    setDailyWork(prev => [newWork, ...prev]);
  };

  const toggleDailyWorkDone = (workId: string, studentId: string) => {
    setDailyWork(prev => prev.map(w => {
      if (w.id === workId) {
        const currentList = w.completedByStudentIds || [];
        const isDone = currentList.includes(studentId);
        return {
          ...w,
          completedByStudentIds: isDone
            ? currentList.filter(id => id !== studentId)
            : [...currentList, studentId],
        };
      }
      return w;
    }));
  };

  const addScheduleItem = (itemData: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...itemData,
      id: `sch-${Date.now()}`,
    };
    setSchedules(prev => [...prev, newItem]);
  };

  const deleteScheduleItem = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const startLiveClass = (topic: string, subject: string, targetClass: string) => {
    setLiveClass({
      isActive: true,
      topic,
      subject,
      class: targetClass,
      teacherName: 'Maria Montessori',
      startedAt: new Date().toISOString(),
      participantsCount: 1,
    });
  };

  const endLiveClass = () => {
    setLiveClass(prev => ({ ...prev, isActive: false }));
  };

  return (
    <DataContext.Provider
      value={{
        students,
        teachers,
        lessons,
        tests,
        testResults,
        attendance,
        leaveRequests,
        remarks,
        dailyWork,
        schedules,
        liveClass,
        addLesson,
        deleteLesson,
        addTest,
        markDailyAttendance,
        applyLeave,
        updateLeaveStatus,
        addRemark,
        addDailyWork,
        toggleDailyWorkDone,
        addScheduleItem,
        deleteScheduleItem,
        startLiveClass,
        endLiveClass,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
