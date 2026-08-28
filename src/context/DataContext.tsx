import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Lesson, Test, TestResult, AttendanceRecord, TeacherAttendanceRecord,
  LeaveRequest, Remark, DailyWork, ScheduleItem, LiveClassSession,
  Student, Teacher, Parent, Admin, Credential, Notification, IssuedCredentials, Role,
} from '@/types';
import {
  seedTeachers, seedStudents, seedParents, seedAdmins, seedCredentials, seedNotifications,
  seedLessons, seedTests, seedTestResults, seedDailyWork, seedSchedules,
  seedAttendance, seedLeaveRequests, seedRemarks, seedLiveClass,
} from '@/data/seed';
import {
  generatePassword, todayISO, isWeekend, dateInRange, eachDateInclusive, slugEmail,
} from '@/lib/utils';

interface DataContextType {
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  admins: Admin[];
  credentials: Credential[];
  notifications: Notification[];
  teacherAttendance: TeacherAttendanceRecord[];
  lessons: Lesson[];
  tests: Test[];
  testResults: TestResult[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  remarks: Remark[];
  dailyWork: DailyWork[];
  schedules: ScheduleItem[];
  liveClass: LiveClassSession;

  addLesson: (lesson: Omit<Lesson, 'id' | 'views' | 'uploadedAt'>) => void;
  deleteLesson: (id: string) => void;
  addTest: (test: Omit<Test, 'id' | 'createdAt' | 'status'>) => void;
  markDailyAttendance: (records: { studentId: string; date: string; status: AttendanceRecord['status'] }[], markedBy?: string) => void;
  applyLeave: (leave: { studentId: string; studentName: string; parentId: string; parentName: string; fromDate: string; toDate: string; reason: string }) => void;
  applyTeacherLeave: (leave: { teacherId: string; teacherName: string; fromDate: string; toDate: string; reason: string }) => void;
  updateLeaveStatus: (leaveId: string, status: 'accepted' | 'rejected', responderId?: string) => void;
  addRemark: (remark: Omit<Remark, 'id' | 'createdAt'>) => void;
  addDailyWork: (work: Omit<DailyWork, 'id' | 'postedAt'>) => void;
  toggleDailyWorkDone: (workId: string, studentId: string) => void;
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  deleteScheduleItem: (id: string) => void;
  startLiveClass: (topic: string, subject: string, targetClass: string, teacherName?: string) => void;
  endLiveClass: () => void;
  createTeacher: (input: { name: string; email: string; phone: string; qualification: string; subject: string; classes: string[] }) => IssuedCredentials;
  createStudentWithParent: (input: {
    name: string; email?: string; phone: string; address: string;
    guardianName: string; guardianEmail?: string; guardianPhone?: string;
    class: string; feeAmount: number;
  }) => IssuedCredentials[];
  resetPassword: (userId: string) => string | null;
  changePassword: (userId: string, oldPassword: string, newPassword: string) => boolean;
  setFeeDue: (studentId: string, due: boolean) => void;
  markTeacherPresent: (teacherId: string) => void;
  markNotificationRead: (id: string) => void;
  findUser: (userId: string, role: Role) => Teacher | Student | Parent | Admin | undefined;
}

const DataContext = createContext<DataContextType | null>(null);

const FEE_MSG = 'A fee payment is due. Please contact the school office.';

function hasFeeFields(list: Student[]): boolean {
  return list.length > 0 && typeof list[0].feeAmount === 'number' && typeof list[0].guardianName === 'string';
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`kg_data_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [students, setStudents] = useState<Student[]>(() => {
    const stored = getStored('students', seedStudents);
    return hasFeeFields(stored) ? stored : seedStudents;
  });
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const stored = getStored('teachers', seedTeachers);
    return stored[0] && 'qualification' in stored[0] ? stored : seedTeachers;
  });
  const [parents, setParents] = useState<Parent[]>(() => getStored('parents', seedParents));
  const [credentials, setCredentials] = useState<Credential[]>(() => getStored('credentials', seedCredentials));
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = getStored('notifications', seedNotifications);
    return stored[0] && 'userId' in stored[0] ? stored : seedNotifications;
  });
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendanceRecord[]>(() => getStored('teacherAttendance', []));
  const [lessons, setLessons] = useState<Lesson[]>(() => getStored('lessons', seedLessons));
  const [tests, setTests] = useState<Test[]>(() => getStored('tests', seedTests));
  const [testResults, setTestResults] = useState<TestResult[]>(() => getStored('testResults', seedTestResults));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStored('attendance', seedAttendance));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const stored = getStored('leaves', seedLeaveRequests);
    return stored.map(l => ({ ...l, kind: l.kind ?? 'student' }));
  });
  const [remarks, setRemarks] = useState<Remark[]>(() => getStored('remarks', seedRemarks));
  const [dailyWork, setDailyWork] = useState<DailyWork[]>(() => getStored('dailyWork', seedDailyWork));
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => getStored('schedules', seedSchedules));
  const [liveClass, setLiveClass] = useState<LiveClassSession>(() => getStored('liveClass', seedLiveClass));
  const admins = seedAdmins;

  useEffect(() => { localStorage.setItem('kg_data_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('kg_data_teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('kg_data_parents', JSON.stringify(parents)); }, [parents]);
  useEffect(() => { localStorage.setItem('kg_data_credentials', JSON.stringify(credentials)); }, [credentials]);
  useEffect(() => { localStorage.setItem('kg_data_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('kg_data_teacherAttendance', JSON.stringify(teacherAttendance)); }, [teacherAttendance]);
  useEffect(() => { localStorage.setItem('kg_data_lessons', JSON.stringify(lessons)); }, [lessons]);
  useEffect(() => { localStorage.setItem('kg_data_tests', JSON.stringify(tests)); }, [tests]);
  useEffect(() => { localStorage.setItem('kg_data_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('kg_data_leaves', JSON.stringify(leaveRequests)); }, [leaveRequests]);
  useEffect(() => { localStorage.setItem('kg_data_remarks', JSON.stringify(remarks)); }, [remarks]);
  useEffect(() => { localStorage.setItem('kg_data_dailyWork', JSON.stringify(dailyWork)); }, [dailyWork]);
  useEffect(() => { localStorage.setItem('kg_data_schedules', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('kg_data_liveClass', JSON.stringify(liveClass)); }, [liveClass]);

  useEffect(() => {
    const today = todayISO();
    if (isWeekend(today)) return;
    setTeacherAttendance(prev => {
      let changed = false;
      const next = [...prev];
      teachers.forEach(t => {
        const existing = next.find(r => r.teacherId === t.id && r.date === today);
        if (existing) return;
        const acceptedLeave = leaveRequests.find(
          l => l.kind === 'teacher' && l.teacherId === t.id && l.status === 'accepted' && dateInRange(today, l.fromDate, l.toDate)
        );
        next.push({
          id: `ta-${t.id}-${today}`,
          teacherId: t.id,
          date: today,
          status: acceptedLeave ? 'leave' : 'absent',
          leaveRequestId: acceptedLeave?.id,
        });
        changed = true;
      });
      return changed ? next : prev;
    });
  }, [teachers, leaveRequests]);

  const addLesson = (lessonData: Omit<Lesson, 'id' | 'views' | 'uploadedAt'>) => {
    setLessons(prev => [{
      ...lessonData,
      id: `lesson-${Date.now()}`,
      uploadedAt: todayISO(),
      views: 0,
    }, ...prev]);
  };

  const deleteLesson = (id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
  };

  const addTest = (testData: Omit<Test, 'id' | 'createdAt' | 'status'>) => {
    setTests(prev => [{
      ...testData,
      id: `test-${Date.now()}`,
      status: 'upcoming',
      createdAt: todayISO(),
    }, ...prev]);
  };

  const markDailyAttendance = (newRecords: { studentId: string; date: string; status: AttendanceRecord['status'] }[], markedBy = 'system') => {
    setAttendance(prev => {
      const updated = [...prev];
      newRecords.forEach(rec => {
        const existingIdx = updated.findIndex(r => r.studentId === rec.studentId && r.date === rec.date);
        if (existingIdx >= 0) {
          updated[existingIdx] = { ...updated[existingIdx], status: rec.status, markedBy };
        } else {
          updated.push({
            id: `att-${rec.studentId}-${rec.date}`,
            studentId: rec.studentId,
            date: rec.date,
            status: rec.status,
            markedBy,
          });
        }
      });
      return updated;
    });
  };

  const applyLeave = (data: { studentId: string; studentName: string; parentId: string; parentName: string; fromDate: string; toDate: string; reason: string }) => {
    setLeaveRequests(prev => [{
      id: `lr-${Date.now()}`,
      kind: 'student',
      studentId: data.studentId,
      studentName: data.studentName,
      parentId: data.parentId,
      parentName: data.parentName,
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason,
      status: 'pending',
      submittedAt: todayISO(),
    }, ...prev]);
  };

  const applyTeacherLeave = (data: { teacherId: string; teacherName: string; fromDate: string; toDate: string; reason: string }) => {
    setLeaveRequests(prev => [{
      id: `lr-t-${Date.now()}`,
      kind: 'teacher',
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason,
      status: 'pending',
      submittedAt: todayISO(),
    }, ...prev]);
  };

  const updateLeaveStatus = (leaveId: string, status: 'accepted' | 'rejected', responderId = 'a1') => {
    setLeaveRequests(prev => prev.map(l => {
      if (l.id !== leaveId) return l;
      const updated: LeaveRequest = { ...l, status, respondedAt: todayISO(), respondedBy: responderId };
      if (status === 'accepted') {
        const dates = eachDateInclusive(l.fromDate, l.toDate).filter(d => !isWeekend(d));
        if (l.kind === 'teacher' && l.teacherId) {
          const teacherId = l.teacherId;
          setTeacherAttendance(attPrev => {
            const attUpdated = [...attPrev];
            dates.forEach(date => {
              const idx = attUpdated.findIndex(r => r.teacherId === teacherId && r.date === date);
              const rec: TeacherAttendanceRecord = {
                id: `ta-${teacherId}-${date}`,
                teacherId,
                date,
                status: 'leave',
                leaveRequestId: l.id,
              };
              if (idx >= 0) attUpdated[idx] = rec;
              else attUpdated.push(rec);
            });
            return attUpdated;
          });
        } else if (l.studentId) {
          const studentId = l.studentId;
          setAttendance(attPrev => {
            const attUpdated = [...attPrev];
            dates.forEach(date => {
              const idx = attUpdated.findIndex(r => r.studentId === studentId && r.date === date);
              const rec: AttendanceRecord = {
                id: `att-${studentId}-${date}`,
                studentId,
                date,
                status: 'leave',
                markedBy: responderId,
                leaveRequestId: l.id,
              };
              if (idx >= 0) attUpdated[idx] = rec;
              else attUpdated.push(rec);
            });
            return attUpdated;
          });
        }
      }
      return updated;
    }));
  };

  const addRemark = (remarkData: Omit<Remark, 'id' | 'createdAt'>) => {
    setRemarks(prev => [{ ...remarkData, id: `rem-${Date.now()}`, createdAt: todayISO() }, ...prev]);
  };

  const addDailyWork = (workData: Omit<DailyWork, 'id' | 'postedAt'>) => {
    setDailyWork(prev => [{
      ...workData,
      id: `dw-${Date.now()}`,
      postedAt: new Date().toISOString(),
      completedByStudentIds: [],
    }, ...prev]);
  };

  const toggleDailyWorkDone = (workId: string, studentId: string) => {
    setDailyWork(prev => prev.map(w => {
      if (w.id !== workId) return w;
      const currentList = w.completedByStudentIds || [];
      const isDone = currentList.includes(studentId);
      return {
        ...w,
        completedByStudentIds: isDone
          ? currentList.filter(id => id !== studentId)
          : [...currentList, studentId],
      };
    }));
  };

  const addScheduleItem = (itemData: Omit<ScheduleItem, 'id'>) => {
    setSchedules(prev => [...prev, { ...itemData, id: `sch-${Date.now()}` }]);
  };

  const deleteScheduleItem = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const startLiveClass = (topic: string, subject: string, targetClass: string, teacherName = 'Maria Montessori') => {
    setLiveClass({
      isActive: true,
      topic,
      subject,
      class: targetClass,
      teacherName,
      startedAt: new Date().toISOString(),
      participantsCount: 1,
    });
  };

  const endLiveClass = () => {
    setLiveClass(prev => ({ ...prev, isActive: false }));
  };

  const createTeacher = (input: { name: string; email: string; phone: string; qualification: string; subject: string; classes: string[] }): IssuedCredentials => {
    const id = `t-${Date.now()}`;
    const password = generatePassword();
    const employeeId = `EMP-${String(teachers.length + 1).padStart(3, '0')}`;
    setTeachers(prev => [{
      id, name: input.name, email: input.email.toLowerCase(), role: 'teacher',
      subject: input.subject, employeeId, classes: input.classes,
      phone: input.phone, qualification: input.qualification, createdAt: todayISO(),
    }, ...prev]);
    setCredentials(prev => [...prev, { userId: id, email: input.email.toLowerCase(), password, role: 'teacher' }]);
    return { role: 'teacher', name: input.name, email: input.email.toLowerCase(), password };
  };

  const createStudentWithParent = (input: {
    name: string; email?: string; phone: string; address: string;
    guardianName: string; guardianEmail?: string; guardianPhone?: string;
    class: string; feeAmount: number;
  }): IssuedCredentials[] => {
    const issued: IssuedCredentials[] = [];
    const studentId = `s-${Date.now()}`;
    const studentEmail = (input.email || slugEmail(input.name, 'student.edu')).toLowerCase();
    const studentPassword = generatePassword();
    const ageGroup = input.class.includes('Toddler') ? '2-3 Years' : input.class.includes('Senior') ? '4-5 Years' : '3-4 Years';
    const rollNo = String(students.filter(s => s.class === input.class).length + 1).padStart(2, '0');

    const guardianPhone = input.guardianPhone || input.phone;
    const guardianEmailRaw = input.guardianEmail || slugEmail(input.guardianName, 'parent.com');
    const guardianEmail = guardianEmailRaw.toLowerCase();

    let parent = parents.find(
      p => p.email.toLowerCase() === guardianEmail || p.phone === guardianPhone
    );
    let parentPassword: string | undefined;

    if (!parent) {
      const parentId = `p-${Date.now()}`;
      parentPassword = generatePassword();
      parent = {
        id: parentId,
        name: input.guardianName,
        email: guardianEmail,
        role: 'parent',
        childrenIds: [studentId],
        phone: guardianPhone,
        createdAt: todayISO(),
      };
      setParents(prev => [parent!, ...prev]);
      setCredentials(prev => [...prev, { userId: parentId, email: guardianEmail, password: parentPassword!, role: 'parent' }]);
      issued.push({ role: 'parent', name: input.guardianName, email: guardianEmail, password: parentPassword });
    } else {
      const pid = parent.id;
      setParents(prev => prev.map(p => p.id === pid ? { ...p, childrenIds: [...p.childrenIds, studentId] } : p));
      const existingCred = credentials.find(c => c.userId === pid);
      issued.push({
        role: 'parent',
        name: parent.name,
        email: parent.email,
        password: existingCred?.password || '(existing account — ask admin to reset)',
      });
    }

    const parentId = parent.id;
    setStudents(prev => [{
      id: studentId,
      name: input.name,
      email: studentEmail,
      role: 'student',
      rollNo,
      class: input.class,
      ageGroup,
      parentId,
      enrollmentId: `MON-${new Date().getFullYear()}-${String(students.length + 1).padStart(3, '0')}`,
      createdAt: todayISO(),
      phone: input.phone,
      address: input.address,
      guardianName: input.guardianName,
      feeAmount: input.feeAmount,
      feeDue: false,
    }, ...prev]);
    setCredentials(prev => [...prev, { userId: studentId, email: studentEmail, password: studentPassword, role: 'student' }]);
    issued.unshift({ role: 'student', name: input.name, email: studentEmail, password: studentPassword });
    return issued;
  };

  const resetPassword = (userId: string): string | null => {
    const password = generatePassword();
    let found = false;
    setCredentials(prev => prev.map(c => {
      if (c.userId === userId) {
        found = true;
        return { ...c, password };
      }
      return c;
    }));
    return found ? password : null;
  };

  const changePassword = (userId: string, oldPassword: string, newPassword: string): boolean => {
    const cred = credentials.find(c => c.userId === userId);
    if (!cred || cred.password !== oldPassword) return false;
    setCredentials(prev => prev.map(c => c.userId === userId ? { ...c, password: newPassword } : c));
    return true;
  };

  const setFeeDue = (studentId: string, due: boolean) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, feeDue: due } : s));
    const now = new Date().toISOString();
    if (due) {
      setNotifications(prev => [
        {
          id: `n-fee-${studentId}-${Date.now()}`,
          userId: studentId,
          title: 'Fee due',
          message: FEE_MSG,
          type: 'warning',
          read: false,
          createdAt: now,
          kind: 'fee_due',
          relatedStudentId: studentId,
        },
        {
          id: `n-fee-p-${student.parentId}-${Date.now()}`,
          userId: student.parentId,
          title: 'Fee due',
          message: `A fee payment is due for ${student.name}. Please contact the school office.`,
          type: 'warning',
          read: false,
          createdAt: now,
          kind: 'fee_due',
          relatedStudentId: studentId,
        },
        ...prev,
      ]);
    } else {
      setNotifications(prev => {
        const marked = prev.map(n =>
          n.kind === 'fee_due' && n.relatedStudentId === studentId ? { ...n, read: true } : n
        );
        return [
          {
            id: `n-cleared-${studentId}-${Date.now()}`,
            userId: studentId,
            title: 'Fee cleared',
            message: 'Your fee record is now up to date.',
            type: 'success',
            read: false,
            createdAt: now,
            kind: 'fee_cleared',
            relatedStudentId: studentId,
          },
          {
            id: `n-cleared-p-${student.parentId}-${Date.now()}`,
            userId: student.parentId,
            title: 'Fee cleared',
            message: `The fee record for ${student.name} is now up to date.`,
            type: 'success',
            read: false,
            createdAt: now,
            kind: 'fee_cleared',
            relatedStudentId: studentId,
          },
          ...marked,
        ];
      });
    }
  };

  const markTeacherPresent = (teacherId: string) => {
    const today = todayISO();
    setTeacherAttendance(prev => {
      const idx = prev.findIndex(r => r.teacherId === teacherId && r.date === today);
      const rec: TeacherAttendanceRecord = {
        id: `ta-${teacherId}-${today}`,
        teacherId,
        date: today,
        status: 'present',
      };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = rec;
        return next;
      }
      return [...prev, rec];
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const findUser = (userId: string, role: Role) => {
    if (role === 'teacher') return teachers.find(t => t.id === userId);
    if (role === 'student') return students.find(s => s.id === userId);
    if (role === 'parent') return parents.find(p => p.id === userId);
    return admins.find(a => a.id === userId);
  };

  return (
    <DataContext.Provider
      value={{
        students, teachers, parents, admins, credentials, notifications, teacherAttendance,
        lessons, tests, testResults, attendance, leaveRequests, remarks, dailyWork, schedules, liveClass,
        addLesson, deleteLesson, addTest, markDailyAttendance, applyLeave, applyTeacherLeave, updateLeaveStatus,
        addRemark, addDailyWork, toggleDailyWorkDone, addScheduleItem, deleteScheduleItem,
        startLiveClass, endLiveClass, createTeacher, createStudentWithParent, resetPassword, changePassword,
        setFeeDue, markTeacherPresent, markNotificationRead, findUser,
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
