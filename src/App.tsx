import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { DataProvider } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage';

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

// Student Pages
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { StudentLiveClassPage } from '@/pages/student/StudentLiveClassPage';
import { StudentSchedulePage } from '@/pages/student/SchedulePage';
import { StudentLecturesPage } from '@/pages/student/LecturesPage';
import { StudentTestsPage } from '@/pages/student/TestsPage';
import { StudentReportsPage } from '@/pages/student/ReportsPage';
import { StudentDailyWorkPage } from '@/pages/student/DailyWorkPage';

// Parent Pages
import { ParentDashboard } from '@/pages/parent/ParentDashboard';
import { ParentSchedulePage } from '@/pages/parent/SchedulePage';
import { ParentRemarksPage } from '@/pages/parent/RemarksPage';
import { ParentAttendancePage } from '@/pages/parent/AttendancePage';
import { ParentDailyWorkPage } from '@/pages/parent/DailyWorkPage';
import { ParentTeachersPage } from '@/pages/parent/TeachersPage';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminUsersPage } from '@/pages/admin/UsersPage';
import { AdminClassesPage } from '@/pages/admin/ClassesPage';
import { AdminReportsPage } from '@/pages/admin/ReportsPage';

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
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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

              {/* Teacher Sub-routes */}
              <Route path="/teacher">
                <Route path="dashboard" element={<ProtectedRoute allowedRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
                <Route path="live-class" element={<ProtectedRoute allowedRole="teacher"><TeacherLiveClassPage /></ProtectedRoute>} />
                <Route path="schedule" element={<ProtectedRoute allowedRole="teacher"><TeacherSchedulePage /></ProtectedRoute>} />
                <Route path="lessons" element={<ProtectedRoute allowedRole="teacher"><TeacherLessonsPage /></ProtectedRoute>} />
                <Route path="tests" element={<ProtectedRoute allowedRole="teacher"><TeacherTestsPage /></ProtectedRoute>} />
                <Route path="attendance" element={<ProtectedRoute allowedRole="teacher"><TeacherAttendancePage /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute allowedRole="teacher"><TeacherReportsPage /></ProtectedRoute>} />
                <Route path="remarks" element={<ProtectedRoute allowedRole="teacher"><TeacherRemarksPage /></ProtectedRoute>} />
                <Route path="daily-work" element={<ProtectedRoute allowedRole="teacher"><TeacherDailyWorkPage /></ProtectedRoute>} />
              </Route>

              {/* Student Sub-routes */}
              <Route path="/student">
                <Route path="dashboard" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
                <Route path="live-class" element={<ProtectedRoute allowedRole="student"><StudentLiveClassPage /></ProtectedRoute>} />
                <Route path="schedule" element={<ProtectedRoute allowedRole="student"><StudentSchedulePage /></ProtectedRoute>} />
                <Route path="lectures" element={<ProtectedRoute allowedRole="student"><StudentLecturesPage /></ProtectedRoute>} />
                <Route path="tests" element={<ProtectedRoute allowedRole="student"><StudentTestsPage /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute allowedRole="student"><StudentReportsPage /></ProtectedRoute>} />
                <Route path="daily-work" element={<ProtectedRoute allowedRole="student"><StudentDailyWorkPage /></ProtectedRoute>} />
              </Route>

              {/* Parent Sub-routes */}
              <Route path="/parent">
                <Route path="dashboard" element={<ProtectedRoute allowedRole="parent"><ParentDashboard /></ProtectedRoute>} />
                <Route path="schedule" element={<ProtectedRoute allowedRole="parent"><ParentSchedulePage /></ProtectedRoute>} />
                <Route path="remarks" element={<ProtectedRoute allowedRole="parent"><ParentRemarksPage /></ProtectedRoute>} />
                <Route path="attendance" element={<ProtectedRoute allowedRole="parent"><ParentAttendancePage /></ProtectedRoute>} />
                <Route path="daily-work" element={<ProtectedRoute allowedRole="parent"><ParentDailyWorkPage /></ProtectedRoute>} />
                <Route path="teachers" element={<ProtectedRoute allowedRole="parent"><ParentTeachersPage /></ProtectedRoute>} />
              </Route>

              {/* Admin Sub-routes */}
              <Route path="/admin">
                <Route path="dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute allowedRole="admin"><AdminUsersPage /></ProtectedRoute>} />
                <Route path="classes" element={<ProtectedRoute allowedRole="admin"><AdminClassesPage /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute allowedRole="admin"><AdminReportsPage /></ProtectedRoute>} />
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
