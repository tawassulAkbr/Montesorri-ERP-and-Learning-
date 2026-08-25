import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardRouter from './pages/Dashboards';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            {/* Placeholders for other routes */}
            <Route path="/tenants" element={<div className="text-surface-500 text-center py-12">Tenants Management (Coming Soon)</div>} />
            <Route path="/settings" element={<div className="text-surface-500 text-center py-12">Settings (Coming Soon)</div>} />
            <Route path="/staff" element={<div className="text-surface-500 text-center py-12">Staff & HR (Coming Soon)</div>} />
            <Route path="/students" element={<div className="text-surface-500 text-center py-12">Student Directory (Coming Soon)</div>} />
            <Route path="/finance" element={<div className="text-surface-500 text-center py-12">Fees & Finance (Coming Soon)</div>} />
            <Route path="/lessons" element={<div className="text-surface-500 text-center py-12">Lesson Planner (Coming Soon)</div>} />
            <Route path="/attendance" element={<div className="text-surface-500 text-center py-12">Smart Attendance (Coming Soon)</div>} />
            <Route path="/messages" element={<div className="text-surface-500 text-center py-12">Messages (Coming Soon)</div>} />
            <Route path="/progress" element={<div className="text-surface-500 text-center py-12">Progress Tracker (Coming Soon)</div>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
