import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Users, Calendar, Settings, LogOut, BookOpen, MessageSquare, CreditCard } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    navigate('/login');
    return null;
  }

  const getLinks = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: Home },
          { name: 'Tenants', path: '/tenants', icon: Building },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];
      case 'SCHOOL_ADMIN':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: Home },
          { name: 'Staff', path: '/staff', icon: Users },
          { name: 'Students', path: '/students', icon: BookOpen },
          { name: 'Finance', path: '/finance', icon: CreditCard },
        ];
      case 'TEACHER':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: Home },
          { name: 'Lessons', path: '/lessons', icon: BookOpen },
          { name: 'Attendance', path: '/attendance', icon: Calendar },
          { name: 'Messages', path: '/messages', icon: MessageSquare },
        ];
      case 'PARENT':
      case 'STUDENT':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: Home },
          { name: 'Progress', path: '/progress', icon: BookOpen },
          { name: 'Messages', path: '/messages', icon: MessageSquare },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-surface-200 flex flex-col">
        <div className="p-6 border-b border-surface-100">
          <Link to="/dashboard" className="text-2xl font-bold text-brand-600 tracking-tight">KinderGuide.</Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                  isActive 
                    ? 'bg-brand-50 text-brand-700' 
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-surface-400'}`} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-surface-100">
          <div className="px-4 py-3 mb-2">
            <p className="text-sm font-medium text-surface-900 truncate">{user.email}</p>
            <p className="text-xs text-surface-500 capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-surface-200 px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-surface-800 capitalize">
            {location.pathname.replace('/', '') || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
              {user.email[0].toUpperCase()}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
