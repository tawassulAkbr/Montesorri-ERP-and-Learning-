import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Lesson, Test, TestResult, AttendanceRecord, TeacherAttendanceRecord,
  LeaveRequest, Remark, DailyWork, ScheduleItem, LiveClassSession,
  Student, Teacher, Parent, Admin, Notification, IssuedCredentials, Role, FeedbackItem,
  Assignment, Submission,
} from '@/types';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api';
import { saveSnapshot, loadSnapshot } from '@/lib/offlineCache';
import { useAuth } from '@/hooks/useAuth';
import { todayISO, isWeekend, dateInRange } from '@/lib/utils';

interface BootstrapData {
  admins: Admin[];
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
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
}

interface DataContextType extends BootstrapData {
  offlineMode: boolean;
  isOnline: boolean;
  lastSyncedAt: string | null;
  aiEnabled: boolean;
  toggleAi: () => void;
  feedbacks: FeedbackItem[];
  addFeedback: (teacherId: string, content: string) => Promise<void>;
  markFeedbackRead: (feedbackId: string) => void;
  assignments: Assignment[];
  submissions: Submission[];
  addAssignment: (input: { title: string; class: string; subject: string; instructions: string; dueAt: string }) => Promise<void>;
  deleteAssignment: (assignmentId: string) => Promise<void>;
  submitAssignment: (assignmentId: string, payload: { text?: string; fileName?: string; filePath?: string }) => Promise<void>;
  gradeSubmission: (submissionId: string, grade: number, feedback?: string) => Promise<void>;
  addLesson: (lesson: Omit<Lesson, 'id' | 'views' | 'uploadedAt'>) => void;
  deleteLesson: (id: string) => void;
  addTest: (test: Omit<Test, 'id' | 'createdAt' | 'status'>) => void;
  saveTestResults: (testId: string, results: { studentId: string; marksObtained: number; grade: TestResult['grade']; milestoneStatus?: TestResult['milestoneStatus']; teacherComment?: string }[]) => void;
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
  createTeacher: (input: { name: string; email: string; phone: string; qualification: string; subject: string; classes: string[] }) => Promise<IssuedCredentials>;
  createStudentWithParent: (input: {
    name: string; email: string; phone: string; address: string;
    guardianName: string; guardianEmail: string; guardianPhone?: string;
    class: string; feeAmount: number;
  }) => Promise<IssuedCredentials[]>;
  resetPassword: (userId: string, role: 'teacher' | 'student' | 'parent') => Promise<string | null>;
  changePassword: (userId: string, oldPassword: string, newPassword: string) => Promise<boolean>;
  setFeeDue: (studentId: string, due: boolean) => void;
  sendFeeReminder: (studentId: string) => void;
  markTeacherPresent: (teacherId: string) => void;
  markNotificationRead: (id: string) => void;
  findUser: (userId: string, role: Role) => Teacher | Student | Parent | Admin | undefined;
}

const DataContext = createContext<DataContextType | null>(null);

const EMPTY_LIVE_CLASS: LiveClassSession = {
  isActive: false, topic: '', subject: '', class: '', teacherName: '', startedAt: '', participantsCount: 0,
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role, token, currentUser } = useAuth();
  const userId = currentUser?.id ?? 'anon';

  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [offlineMode, setOfflineMode] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  // AI features are ON by default; preference persists per user.
  const [aiEnabled, setAiEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem(`kg_ai:${userId}`) !== 'false'; } catch { return true; }
  });
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendanceRecord[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [dailyWork, setDailyWork] = useState<DailyWork[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [liveClass, setLiveClass] = useState<LiveClassSession>(EMPTY_LIVE_CLASS);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const applyBootstrap = useCallback((data: BootstrapData) => {
    setAdmins(data.admins);
    setStudents(data.students);
    setTeachers(data.teachers);
    setParents(data.parents);
    setNotifications(data.notifications);
    setTeacherAttendance(data.teacherAttendance);
    setLessons(data.lessons);
    setTests(data.tests);
    setTestResults(data.testResults);
    setAttendance(data.attendance);
    setLeaveRequests(data.leaveRequests);
    setRemarks(data.remarks);
    setDailyWork(data.dailyWork);
    setSchedules(data.schedules);
    setLiveClass(data.liveClass);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const data = await apiGet<BootstrapData>('/bootstrap');
      applyBootstrap(data);
      saveSnapshot(userId, 'bootstrap', data);
      setOfflineMode(false);
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  }, [applyBootstrap, userId]);

  const loadFeedbacks = useCallback(async () => {
    try {
      const path = role === 'admin' ? '/admin/feedback'
        : role === 'teacher' ? '/teachers/feedback'
        : role === 'student' ? '/students/feedback/mine'
        : null;
      if (!path) { setFeedbacks([]); return; }
      const res = await apiGet<{ feedbacks: FeedbackItem[] }>(path);
      setFeedbacks(res.feedbacks);
      saveSnapshot(userId, 'feedbacks', res.feedbacks);
    } catch (err) {
      console.error('Failed to load feedback:', err);
      const cached = loadSnapshot<FeedbackItem[]>(userId, 'feedbacks');
      if (cached) setFeedbacks(cached);
    }
  }, [role, userId]);

  const flattenAssignments = (list: (Assignment & { submissions?: Submission[] })[]) => {
    const submissions: Submission[] = [];
    const assignments: Assignment[] = list.map(a => {
      if (a.submissions) submissions.push(...a.submissions);
      const { submissions: _subs, ...rest } = a;
      return rest as Assignment;
    });
    return { assignments, submissions };
  };

  const loadAssignments = useCallback(async () => {
    try {
      let next: { assignments: Assignment[]; submissions: Submission[] };
      if (role === 'teacher') {
        const res = await apiGet<{ assignments: (Assignment & { submissions?: Submission[] })[] }>('/teachers/assignments');
        next = flattenAssignments(res.assignments);
      } else if (role === 'admin') {
        const res = await apiGet<{ assignments: (Assignment & { submissions?: Submission[] })[] }>('/admin/assignments');
        next = flattenAssignments(res.assignments);
      } else if (role === 'student') {
        const res = await apiGet<{ assignments: Assignment[]; submissions: Submission[] }>('/students/assignments');
        next = { assignments: res.assignments, submissions: res.submissions };
      } else {
        setAssignments([]);
        setSubmissions([]);
        return;
      }
      setAssignments(next.assignments);
      setSubmissions(next.submissions);
      saveSnapshot(userId, 'assignments', next);
    } catch (err) {
      console.error('Failed to load assignments:', err);
      const cached = loadSnapshot<{ assignments: Assignment[]; submissions: Submission[] }>(userId, 'assignments');
      if (cached) {
        setAssignments(cached.assignments);
        setSubmissions(cached.submissions);
      }
    }
  }, [role, userId]);

  // Re-read the stored AI preference when a different user signs in.
  useEffect(() => {
    try { setAiEnabled(localStorage.getItem(`kg_ai:${userId}`) !== 'false'); } catch { setAiEnabled(true); }
  }, [userId]);

  const toggleAi = useCallback(() => {
    setAiEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem(`kg_ai:${userId}`, next ? 'true' : 'false'); } catch { /* ignore */ }
      return next;
    });
  }, [userId]);

  // Track browser connectivity so the app can switch modes and re-sync.
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // While serving cached data, keep probing the server so we auto-recover
  // as soon as the API is reachable again (no reload needed).
  useEffect(() => {
    if (!offlineMode || !isAuthenticated || !token) return;
    const timer = setInterval(() => {
      if (!navigator.onLine) return;
      refreshAll().then(() => {
        loadFeedbacks();
        loadAssignments();
      });
    }, 15000);
    return () => clearInterval(timer);
  }, [offlineMode, isAuthenticated, token, refreshAll, loadFeedbacks, loadAssignments]);

  // Hydrate from the API once authenticated; fall back to the offline cache
  // when the network or API server is unreachable.
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    let cancelled = false;
    setLoading(true);
    const fbPath = role === 'admin' ? '/admin/feedback'
      : role === 'teacher' ? '/teachers/feedback'
      : role === 'student' ? '/students/feedback/mine'
      : null;
    Promise.all([
      apiGet<BootstrapData>('/bootstrap'),
      fbPath ? apiGet<{ feedbacks: FeedbackItem[] }>(fbPath) : Promise.resolve({ feedbacks: [] as FeedbackItem[] }),
    ])
      .then(([data, fb]) => {
        if (cancelled) return;
        applyBootstrap(data);
        setFeedbacks(fb.feedbacks);
        saveSnapshot(userId, 'bootstrap', data);
        saveSnapshot(userId, 'feedbacks', fb.feedbacks);
        setOfflineMode(false);
        setLastSyncedAt(new Date().toISOString());
      })
      .catch(err => {
        console.error('Bootstrap failed:', err);
        if (cancelled) return;
        const cached = loadSnapshot<BootstrapData>(userId, 'bootstrap');
        if (cached) {
          applyBootstrap(cached);
          setFeedbacks(loadSnapshot<FeedbackItem[]>(userId, 'feedbacks') ?? []);
        }
        setOfflineMode(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    loadAssignments();
    return () => { cancelled = true; };
  }, [isAuthenticated, token, role, applyBootstrap, loadAssignments, userId, isOnline]);

  // Display-parity: derive auto-absent for teachers locally (server derives it on read too).
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

  // ─── Persist + resync helper ────────────────────────────────────────────────
  const persist = useCallback((call: () => Promise<unknown>) => {
    call()
      .then(() => refreshAll())
      .catch(err => {
        console.error('Action failed:', err);
        refreshAll();
      });
  }, [refreshAll]);

  // ─── Mutations (optimistic update + API persist + resync) ─────────────────
  const addLesson = (lessonData: Omit<Lesson, 'id' | 'views' | 'uploadedAt'>) => {
    setLessons(prev => [{
      ...lessonData,
      id: `tmp-${Date.now()}`,
      uploadedAt: todayISO(),
      views: 0,
    }, ...prev]);
    persist(() => apiPost('/lessons', lessonData));
  };

  const deleteLesson = (id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
    persist(() => apiDelete(`/lessons/${id}`));
  };

  const addTest = (testData: Omit<Test, 'id' | 'createdAt' | 'status'>) => {
    setTests(prev => [{
      ...testData,
      id: `tmp-${Date.now()}`,
      status: 'upcoming',
      createdAt: todayISO(),
    }, ...prev]);
    persist(() => apiPost('/tests', testData));
  };

  const saveTestResults = (testId: string, results: { studentId: string; marksObtained: number; grade: TestResult['grade']; milestoneStatus?: TestResult['milestoneStatus']; teacherComment?: string }[]) => {
    persist(() => apiPost(`/tests/${testId}/results`, { results }));
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
    persist(() => apiPost('/teachers/attendance', { records: newRecords }));
  };

  const applyLeave = (data: { studentId: string; studentName: string; parentId: string; parentName: string; fromDate: string; toDate: string; reason: string }) => {
    setLeaveRequests(prev => [{
      id: `tmp-${Date.now()}`,
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
    persist(() => apiPost('/parents/apply-leave', data));
  };

  const applyTeacherLeave = (data: { teacherId: string; teacherName: string; fromDate: string; toDate: string; reason: string }) => {
    setLeaveRequests(prev => [{
      id: `tmp-${Date.now()}`,
      kind: 'teacher',
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason,
      status: 'pending',
      submittedAt: todayISO(),
    }, ...prev]);
    persist(() => apiPost('/teachers/apply-leave', data));
  };

  const updateLeaveStatus = (leaveId: string, status: 'accepted' | 'rejected', responderId = '') => {
    setLeaveRequests(prev => prev.map(l =>
      l.id === leaveId ? { ...l, status, respondedAt: todayISO(), respondedBy: responderId } : l
    ));
    const path = role === 'admin' ? `/admin/leaves/${leaveId}` : `/teachers/student-leaves/${leaveId}`;
    persist(() => apiPatch(path, { status }));
  };

  const addRemark = (remarkData: Omit<Remark, 'id' | 'createdAt'>) => {
    setRemarks(prev => [{ ...remarkData, id: `tmp-${Date.now()}`, createdAt: todayISO() }, ...prev]);
    persist(() => apiPost('/remarks', remarkData));
  };

  const addDailyWork = (workData: Omit<DailyWork, 'id' | 'postedAt'>) => {
    setDailyWork(prev => [{
      ...workData,
      id: `tmp-${Date.now()}`,
      postedAt: new Date().toISOString(),
      completedByStudentIds: [],
    }, ...prev]);
    persist(() => apiPost('/daily-work', workData));
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
    persist(() => apiPatch(`/daily-work/${workId}/complete`));
  };

  const addScheduleItem = (itemData: Omit<ScheduleItem, 'id'>) => {
    setSchedules(prev => [...prev, { ...itemData, id: `tmp-${Date.now()}` }]);
    persist(() => apiPost('/schedule', itemData));
  };

  const deleteScheduleItem = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    persist(() => apiDelete(`/schedule/${id}`));
  };

  const startLiveClass = (topic: string, subject: string, targetClass: string, teacherName?: string) => {
    setLiveClass({
      isActive: true,
      topic,
      subject,
      class: targetClass,
      teacherName: teacherName || '',
      startedAt: new Date().toISOString(),
      participantsCount: 1,
    });
    persist(() => apiPut('/live-class/start', { topic, subject, class: targetClass, teacherName }));
  };

  const endLiveClass = () => {
    setLiveClass(prev => ({ ...prev, isActive: false }));
    persist(() => apiPut('/live-class/end'));
  };

  // ─── Value-returning (async) mutations ─────────────────────────────────────
  const createTeacher = async (input: { name: string; email: string; phone: string; qualification: string; subject: string; classes: string[] }): Promise<IssuedCredentials> => {
    const res = await apiPost<{ teacher: Teacher; issued: IssuedCredentials }>('/admin/teachers', input);
    await refreshAll();
    return res.issued;
  };

  const createStudentWithParent = async (input: {
    name: string; email: string; phone: string; address: string;
    guardianName: string; guardianEmail: string; guardianPhone?: string;
    class: string; feeAmount: number;
  }): Promise<IssuedCredentials[]> => {
    const res = await apiPost<{ student: Student; issued: IssuedCredentials[] }>('/admin/students', input);
    await refreshAll();
    return res.issued;
  };

  const resetPassword = async (userId: string, userRole: 'teacher' | 'student' | 'parent'): Promise<string | null> => {
    const res = await apiPost<{ issued: IssuedCredentials }>(`/admin/users/${userId}/reset-password`, { role: userRole });
    return res.issued?.password ?? null;
  };

  const changePassword = async (_userId: string, oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await apiPut('/auth/change-password', { oldPassword, newPassword });
      return true;
    } catch {
      return false;
    }
  };

  const setFeeDue = (studentId: string, due: boolean) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, feeDue: due } : s));
    persist(() => apiPatch(`/admin/students/${studentId}/fee-due`, { due }));
  };

  const sendFeeReminder = (studentId: string) => {
    persist(() => apiPost(`/admin/students/${studentId}/fee-reminder`));
  };

  const addFeedback = async (teacherId: string, content: string) => {
    await apiPost('/students/feedback', { teacherId, content });
    await loadFeedbacks();
  };

  const markFeedbackRead = (feedbackId: string) => {
    setFeedbacks(prev => prev.map(f => f.id === feedbackId ? { ...f, readByTeacher: true } : f));
    apiPatch(`/teachers/feedback/${feedbackId}/read`).catch(err => console.error('Failed to mark feedback read:', err));
  };

  const addAssignment = async (input: { title: string; class: string; subject: string; instructions: string; dueAt: string }) => {
    await apiPost('/teachers/assignments', input);
    await loadAssignments();
  };

  const deleteAssignment = async (assignmentId: string) => {
    await apiDelete(`/teachers/assignments/${assignmentId}`);
    await loadAssignments();
  };

  const submitAssignment = async (assignmentId: string, payload: { text?: string; fileName?: string; filePath?: string }) => {
    await apiPost(`/students/assignments/${assignmentId}/submit`, payload);
    await loadAssignments();
  };

  const gradeSubmission = async (submissionId: string, grade: number, feedback?: string) => {
    await apiPatch(`/teachers/assignments/submissions/${submissionId}/grade`, { grade, feedback });
    await loadAssignments();
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
    persist(() => apiPost('/teachers/mark-present'));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    apiPatch(`/notifications/${id}/read`).catch(err => console.error('Failed to mark notification read:', err));
  };

  const findUser = (userId: string, userRole: Role) => {
    if (userRole === 'teacher') return teachers.find(t => t.id === userId);
    if (userRole === 'student') return students.find(s => s.id === userId);
    if (userRole === 'parent') return parents.find(p => p.id === userId);
    return admins.find(a => a.id === userId);
  };

  // Loading gate: pages assume populated arrays, so hold rendering until hydrated.
  if (isAuthenticated && loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary animate-pulse" />
        <p className="text-sm font-medium text-slate-500">Loading your school data...</p>
      </div>
    );
  }

  return (
    <DataContext.Provider
      value={{
        offlineMode, isOnline, lastSyncedAt,
        aiEnabled, toggleAi,
        admins, students, teachers, parents, notifications, teacherAttendance,
        lessons, tests, testResults, attendance, leaveRequests, remarks, dailyWork, schedules, liveClass,
        feedbacks, addFeedback, markFeedbackRead,
        assignments, submissions, addAssignment, deleteAssignment, submitAssignment, gradeSubmission,
        addLesson, deleteLesson, addTest, saveTestResults, markDailyAttendance, applyLeave, applyTeacherLeave, updateLeaveStatus,
        addRemark, addDailyWork, toggleDailyWorkDone, addScheduleItem, deleteScheduleItem,
        startLiveClass, endLiveClass, createTeacher, createStudentWithParent, resetPassword, changePassword,
        setFeeDue, sendFeeReminder, markTeacherPresent, markNotificationRead, findUser,
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
