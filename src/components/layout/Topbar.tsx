import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, ChevronRight, Lock, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/context/DataContext';
import { useSidebar } from '@/hooks/useSidebar';
import { getInitials, avatarColors } from '@/lib/utils';

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard', lessons: 'Lessons', tests: 'Tests', attendance: 'Attendance',
  reports: 'Reports', remarks: 'Remarks', 'daily-work': 'Daily Work', lectures: 'Lectures',
  teachers: 'Teachers', users: 'Users', classes: 'Classes', settings: 'Settings',
  students: 'Students', 'live-class': 'Live Class', schedule: 'Schedule',
};

export const Topbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { notifications, markNotificationRead } = useData();
  const { openMobile } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  const myNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unread = myNotifications.filter(n => !n.read).length;
  const crumbs = location.pathname.split('/').filter(Boolean);

  const initials = currentUser ? getInitials(currentUser.name) : 'KG';
  const avatarCls = currentUser ? avatarColors(currentUser.name) : 'bg-indigo-100 text-indigo-700';

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleMarkAllRead = () => {
    myNotifications.filter(n => !n.read).forEach(n => markNotificationRead(n.id));
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center px-4 gap-3 sticky top-0 z-30">
      {/* Mobile hamburger */}
      <button
        onClick={openMobile}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 flex-1">
        {crumbs.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-slate-300" />}
            <span className={`text-sm ${i === crumbs.length - 1 ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>
              {BREADCRUMB_LABELS[crumb] || crumb.charAt(0).toUpperCase() + crumb.slice(1)}
            </span>
          </span>
        ))}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
            >
              <div className="p-4 border-b border-slate-100">
                <span className="font-semibold text-sm text-slate-800">Notifications</span>
                {unread > 0 && <Badge variant="secondary" className="ml-2 text-xs">{unread} new</Badge>}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {myNotifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                ) : (
                  myNotifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? 'bg-indigo-50/40' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'success' ? 'bg-emerald-400' : n.type === 'warning' ? 'bg-amber-400' : n.type === 'error' ? 'bg-red-400' : 'bg-indigo-400'}`} />
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={handleMarkAllRead}
                className="w-full text-center text-xs text-indigo-600 font-medium py-3 hover:bg-slate-50 transition-colors"
              >
                Mark all as read
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className={`w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center cursor-pointer ${avatarCls}`}>
          {initials}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-slate-800">{currentUser?.name}</p>
            <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/change-password')} className="gap-2 cursor-pointer">
            <Lock size={14} className="text-slate-400" /> Change Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600 cursor-pointer">
            <LogOut size={14} /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
