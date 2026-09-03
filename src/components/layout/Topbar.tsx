import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, Lock, LogOut, User, Sparkles, Search } from 'lucide-react';
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
  messages: 'Messages', feedback: 'Feedback', assignments: 'Assignments',
  'teacher-reports': 'Teacher Reports', profile: 'My Profile',
};

function crumbLabel(crumb: string): string {
  if (BREADCRUMB_LABELS[crumb]) return BREADCRUMB_LABELS[crumb];
  // Dynamic route params (e.g. a teacher id in /parent/messages/:teacherId)
  if (/^[a-z0-9]{10,}$/i.test(crumb)) return 'Chat';
  return crumb.charAt(0).toUpperCase() + crumb.slice(1);
}

export const Topbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { notifications, markNotificationRead, aiEnabled, toggleAi } = useData();
  const { openMobile } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  const myNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unread = myNotifications.filter(n => !n.read).length;
  const crumbs = location.pathname.split('/').filter(Boolean);

  const initials = currentUser ? getInitials(currentUser.name) : 'KG';
  const avatarCls = currentUser ? avatarColors(currentUser.name) : 'bg-[#E6F4F1] text-[#006B5D]';

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleMarkAllRead = () => {
    myNotifications.filter(n => !n.read).forEach(n => markNotificationRead(n.id));
  };

  return (
    <header className="sticky top-0 z-30 bg-white px-5 py-5 lg:px-7">
      {/* Mobile hamburger */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={openMobile}
            className="rounded-xl border border-[#EAECF0] p-2 text-[#667085] transition-colors hover:bg-[#E6F4F1] hover:text-[#006B5D] lg:hidden"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold tracking-normal text-[#101828]">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="mt-1 text-sm font-medium text-[#667085]">
              {crumbs.map(crumbLabel).join(' / ') || 'Dashboard overview'}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3 xl:max-w-2xl">
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" size={17} />
            <input
              type="search"
              placeholder="Search dashboard"
              className="h-11 w-full rounded-full border border-[#EAECF0] bg-[#F9FAFB] pl-11 pr-4 text-sm font-medium text-[#344054] outline-none transition focus:border-[#006B5D] focus:bg-white focus:ring-4 focus:ring-[#E6F4F1] placeholder:text-[#98A2B3]"
            />
          </div>

          {/* AI features toggle */}
          <button
            onClick={toggleAi}
            title={aiEnabled ? 'Hide AI assistant & insights' : 'Show AI assistant & insights'}
            className={`flex h-11 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-colors ${
              aiEnabled
                ? 'border-[#B7DDD6] bg-[#E6F4F1] text-[#006B5D] hover:bg-[#D9EFEB]'
                : 'border-[#EAECF0] bg-white text-[#667085] hover:bg-[#F9FAFB]'
            }`}
          >
            <Sparkles size={15} />
            <span>AI</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#EAECF0] bg-white text-[#667085] transition-colors hover:bg-[#E6F4F1] hover:text-[#006B5D]"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#D9531E] text-[9px] font-bold text-white">
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
              className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-[#EAECF0] bg-white shadow-xl"
            >
              <div className="border-b border-[#EAECF0] p-4">
                <span className="text-sm font-bold text-[#101828]">Notifications</span>
                {unread > 0 && <Badge variant="secondary" className="ml-2 text-xs">{unread} new</Badge>}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {myNotifications.length === 0 ? (
                  <p className="text-xs text-[#667085] text-center py-6">No notifications yet.</p>
                ) : (
                  myNotifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`w-full cursor-pointer border-b border-[#F2F4F7] px-4 py-3 text-left transition-colors hover:bg-[#F9FAFB] ${!n.read ? 'bg-[#E6F4F1]/60' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${n.type === 'success' ? 'bg-[#006B5D]' : n.type === 'warning' ? 'bg-amber-400' : n.type === 'error' ? 'bg-red-400' : 'bg-[#006B5D]'}`} />
                        <div>
                          <p className="text-xs font-semibold text-[#344054]">{n.title}</p>
                          <p className="text-xs text-[#667085] mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={handleMarkAllRead}
                className="w-full py-3 text-center text-xs font-bold text-[#006B5D] transition-colors hover:bg-[#F9FAFB]"
              >
                Mark all as read
              </button>
            </motion.div>
          )}
        </AnimatePresence>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
          className={`flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-xl text-sm font-bold ring-2 ring-[#E6F4F1] ${avatarCls}`}
            >
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
            </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-[#101828]">{currentUser?.name}</p>
            <p className="text-xs text-[#667085] truncate">{currentUser?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2 cursor-pointer">
            <User size={14} className="text-[#667085]" /> My Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/change-password')} className="gap-2 cursor-pointer">
            <Lock size={14} className="text-[#667085]" /> Change Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600 cursor-pointer">
            <LogOut size={14} /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
