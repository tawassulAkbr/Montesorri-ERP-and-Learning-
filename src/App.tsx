import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { DataProvider } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage';
import { ProfilePage } from '@/pages/ProfilePage';

// Teacher Pages
import { TeacherDashboard } from '@/pages/teacher/TeacherDashboard';
import { TeacherLiveClassPage } from '@/pages/teacher/LiveClassPage';
import { TeacherSchedulePage } from '@/pages/teacher/SchedulePage';
import { LessonsPage as TeacherLessonsPage } from '@/pages/teacher/LessonsPage';
import { TestsPage as TeacherTestsPage } from '@/pages/teacher/TestsPage';
import { AttendancePage as TeacherAttendancePage } from '@/pages/teacher/AttendancePage';
import { ReportsPage as TeacherReportsPage } from '@/pages/teacher/ReportsPage';
import { RemarksPage as TeacherRemarksPage } from '@/pages/teacher/RemarksPage';
import { DailyWorkPage as TeacherDailyWorkPage } from '@/pages/teacher/DailyWorkPage';
import { StudentsPage as TeacherStudentsPage } from '@/pages/teacher/StudentsPage';
import { TeacherFeedbackPage } from '@/pages/teacher/FeedbackPage';
import { TeacherAssignmentsPage } from '@/pages/teacher/AssignmentsPage';
import { TeacherMessagesPage } from '@/pages/teacher/MessagesPage';
import { TeacherStreaksPage } from '@/pages/teacher/StreaksPage';

// Student Pages
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { StudentLiveClassPage } from '@/pages/student/StudentLiveClassPage';
import { StudentSchedulePage } from '@/pages/student/SchedulePage';
import { StudentLecturesPage } from '@/pages/student/LecturesPage';
import { StudentTestsPage } from '@/pages/student/TestsPage';
import { StudentReportsPage } from '@/pages/student/ReportsPage';
import { StudentDailyWorkPage } from '@/pages/student/DailyWorkPage';
import { StudentFeedbackPage } from '@/pages/student/FeedbackPage';
import { StudentAssignmentsPage } from '@/pages/student/AssignmentsPage';
import { StudentLearningPage } from '@/pages/student/LearningPage';

// Parent Pages
import { ParentDashboard } from '@/pages/parent/ParentDashboard';
import { ParentSchedulePage } from '@/pages/parent/SchedulePage';
import { ParentRemarksPage } from '@/pages/parent/RemarksPage';
import { ParentAttendancePage } from '@/pages/parent/AttendancePage';
import { ParentDailyWorkPage } from '@/pages/parent/DailyWorkPage';
import { ParentTeachersPage } from '@/pages/parent/TeachersPage';
import { ParentMessageThreadPage } from '@/pages/parent/MessageThreadPage';
import { ParentMessagesPage } from '@/pages/parent/MessagesPage';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminUsersPage } from '@/pages/admin/UsersPage';
import { AdminClassesPage } from '@/pages/admin/ClassesPage';
import { AdminReportsPage } from '@/pages/admin/ReportsPage';
import { AdminTeacherReportsPage } from '@/pages/admin/TeacherReportsPage';
import { AdminFeedbackPage } from '@/pages/admin/FeedbackPage';
import { FinancePage } from '@/pages/admin/FinancePage';
import { InventoryPage } from '@/pages/admin/InventoryPage';
import { HrPayrollPage } from '@/pages/admin/HrPayrollPage';
import { CurriculumPage } from '@/pages/admin/CurriculumPage';

import type { Role } from '@/types';

// Protected Route Guard
const ProtectedRoute: React.FC<{ allowedRole?: Role; children: React.ReactNode }> = ({ allowedRole, children }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Redirect to user's assigned dashboard
    switch (role) {
      case 'teacher': return <Navigate to="/teacher/dashboard" replace />;
      case 'student': return <Navigate to="/student/dashboard" replace />;
      case 'parent': return <Navigate to="/parent/dashboard" replace />;
      case 'admin': return <Navigate to="/admin/dashboard" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Authenticated Dashboard Base */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Global Settings */}
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Teacher Sub-routes */}
              <Route path="/teacher">
                <Route path="dashboard" element={<ProtectedRoute allowedRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
                <Route path="live-class" element={<ProtectedRoute allowedRole="teacher"><TeacherLiveClassPage /></ProtectedRoute>} />
                <Route path="schedule" element={<ProtectedRoute allowedRole="teacher"><TeacherSchedulePage /></ProtectedRoute>} />
                <Route path="lessons" element={<ProtectedRoute allowedRole="teacher"><TeacherLessonsPage /></ProtectedRoute>} />
                <Route path="tests" element={<ProtectedRoute allowedRole="teacher"><TeacherTestsPage /></ProtectedRoute>} />
                <Route path="attendance" element={<ProtectedRoute allowedRole="teacher"><TeacherAttendancePage /></ProtectedRoute>} />
                <Route path="students" element={<ProtectedRoute allowedRole="teacher"><TeacherStudentsPage /></ProtectedRoute>} />
                <Route path="streaks" element={<ProtectedRoute allowedRole="teacher"><TeacherStreaksPage /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute allowedRole="teacher"><TeacherReportsPage /></ProtectedRoute>} />
                <Route path="remarks" element={<ProtectedRoute allowedRole="teacher"><TeacherRemarksPage /></ProtectedRoute>} />
                <Route path="daily-work" element={<ProtectedRoute allowedRole="teacher"><TeacherDailyWorkPage /></ProtectedRoute>} />
                <Route path="assignments" element={<ProtectedRoute allowedRole="teacher"><TeacherAssignmentsPage /></ProtectedRoute>} />
                <Route path="messages" element={<ProtectedRoute allowedRole="teacher"><TeacherMessagesPage /></ProtectedRoute>} />
                <Route path="feedback" element={<ProtectedRoute allowedRole="teacher"><TeacherFeedbackPage /></ProtectedRoute>} />
              </Route>

              {/* Student Sub-routes */}
              <Route path="/student">
                <Route path="dashboard" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
                <Route path="learning" element={<ProtectedRoute allowedRole="student"><StudentLearningPage /></ProtectedRoute>} />
                <Route path="live-class" element={<ProtectedRoute allowedRole="student"><StudentLiveClassPage /></ProtectedRoute>} />
                <Route path="schedule" element={<ProtectedRoute allowedRole="student"><StudentSchedulePage /></ProtectedRoute>} />
                <Route path="lectures" element={<ProtectedRoute allowedRole="student"><StudentLecturesPage /></ProtectedRoute>} />
                <Route path="tests" element={<ProtectedRoute allowedRole="student"><StudentTestsPage /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute allowedRole="student"><StudentReportsPage /></ProtectedRoute>} />
                <Route path="daily-work" element={<ProtectedRoute allowedRole="student"><StudentDailyWorkPage /></ProtectedRoute>} />
                <Route path="assignments" element={<ProtectedRoute allowedRole="student"><StudentAssignmentsPage /></ProtectedRoute>} />
                <Route path="feedback" element={<ProtectedRoute allowedRole="student"><StudentFeedbackPage /></ProtectedRoute>} />
              </Route>

              {/* Parent Sub-routes */}
              <Route path="/parent">
                <Route path="dashboard" element={<ProtectedRoute allowedRole="parent"><ParentDashboard /></ProtectedRoute>} />
                <Route path="schedule" element={<ProtectedRoute allowedRole="parent"><ParentSchedulePage /></ProtectedRoute>} />
                <Route path="remarks" element={<ProtectedRoute allowedRole="parent"><ParentRemarksPage /></ProtectedRoute>} />
                <Route path="attendance" element={<ProtectedRoute allowedRole="parent"><ParentAttendancePage /></ProtectedRoute>} />
                <Route path="daily-work" element={<ProtectedRoute allowedRole="parent"><ParentDailyWorkPage /></ProtectedRoute>} />
                <Route path="teachers" element={<ProtectedRoute allowedRole="parent"><ParentTeachersPage /></ProtectedRoute>} />
                <Route path="messages" element={<ProtectedRoute allowedRole="parent"><ParentMessagesPage /></ProtectedRoute>} />
                <Route path="messages/:teacherId" element={<ProtectedRoute allowedRole="parent"><ParentMessageThreadPage /></ProtectedRoute>} />
              </Route>

              {/* Admin Sub-routes */}
              <Route path="/admin">
                <Route path="dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute allowedRole="admin"><AdminUsersPage /></ProtectedRoute>} />
                <Route path="classes" element={<ProtectedRoute allowedRole="admin"><AdminClassesPage /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute allowedRole="admin"><AdminReportsPage /></ProtectedRoute>} />
                <Route path="teacher-reports" element={<ProtectedRoute allowedRole="admin"><AdminTeacherReportsPage /></ProtectedRoute>} />
                <Route path="finance" element={<ProtectedRoute allowedRole="admin"><FinancePage /></ProtectedRoute>} />
                <Route path="hr-payroll" element={<ProtectedRoute allowedRole="admin"><HrPayrollPage /></ProtectedRoute>} />
                <Route path="curriculum" element={<ProtectedRoute allowedRole="admin"><CurriculumPage /></ProtectedRoute>} />
                <Route path="inventory" element={<ProtectedRoute allowedRole="admin"><InventoryPage /></ProtectedRoute>} />
                <Route path="feedback" element={<ProtectedRoute allowedRole="admin"><AdminFeedbackPage /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute allowedRole="admin"><ChangePasswordPage /></ProtectedRoute>} />
              </Route>
            </Route>

            {/* Root Redirect to Login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
