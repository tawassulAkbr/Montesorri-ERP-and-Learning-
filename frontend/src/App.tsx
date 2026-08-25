import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardRouter from './pages/Dashboards';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';

import Staff from './pages/Staff';
import Students from './pages/Students';
import Finance from './pages/Finance';
import Lessons from './pages/Lessons';
import Attendance from './pages/Attendance';
import Messages from './pages/Messages';
import Progress from './pages/Progress';

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
            
            <Route path="/staff" element={<Staff />} />
            <Route path="/students" element={<Students />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/progress" element={<Progress />} />

            <Route path="/tenants" element={<div className="text-surface-500 text-center py-12 font-medium">Tenants Management (Platform Feature)</div>} />
            <Route path="/settings" element={<div className="text-surface-500 text-center py-12 font-medium">Settings Configuration</div>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
