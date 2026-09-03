import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Video, ClipboardList, CalendarCheck, BarChart3,
  MessageSquare, BookOpen, Users, GraduationCap, Heart, ShieldCheck,
  LogOut, ChevronLeft, ChevronRight, Settings, BookMarked, Radio, Calendar,
  MessageSquareHeart, Flame, Sparkles
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';
import { getInitials, avatarColors, cn } from '@/lib/utils';
import type { Role } from '@/types';

// ─── Nav Config per Role with Live Classroom & Daily Schedule ─────────────────
const NAV: Record<Role, { label: string; to: string; icon: React.ReactNode; isLive?: boolean }[]> = {
  teacher: [
    { label: 'Dashboard', to: '/teacher/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Live Virtual Class', to: '/teacher/live-class', icon: <Radio size={18} className="text-red-500" />, isLive: true },
    { label: 'Daily Schedule', to: '/teacher/schedule', icon: <Calendar size={18} /> },
    { label: 'Video Lessons', to: '/teacher/lessons', icon: <Video size={18} /> },
    { label: 'Daily Activities', to: '/teacher/daily-work', icon: <BookOpen size={18} /> },
    { label: 'Attendance', to: '/teacher/attendance', icon: <CalendarCheck size={18} /> },
    { label: 'My Students', to: '/teacher/students', icon: <Users size={18} /> },
    { label: 'Streak Progress', to: '/teacher/streaks', icon: <Flame size={18} className="text-orange-500" /> },
    { label: 'Milestones & Tests', to: '/teacher/tests', icon: <ClipboardList size={18} /> },
    { label: 'Assignments & Tasks', to: '/teacher/assignments', icon: <ClipboardList size={18} /> },
    { label: 'Observations & Remarks', to: '/teacher/remarks', icon: <MessageSquare size={18} /> },
    { label: 'Student Feedback', to: '/teacher/feedback', icon: <MessageSquareHeart size={18} /> },
    { label: 'Parent Messages', to: '/teacher/messages', icon: <MessageSquare size={18} /> },
    { label: 'Progress Reports', to: '/teacher/reports', icon: <BarChart3 size={18} /> },
  ],
  student: [
    { label: 'Dashboard', to: '/student/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'My Learning', to: '/student/learning', icon: <Sparkles size={18} className="text-orange-500" /> },
    { label: 'Live Classroom', to: '/student/live-class', icon: <Radio size={18} className="text-red-500" />, isLive: true },
    { label: 'My Daily Routine', to: '/student/schedule', icon: <Calendar size={18} /> },
    { label: 'Video Lectures', to: '/student/lectures', icon: <Video size={18} /> },
    { label: 'Daily Activities', to: '/student/daily-work', icon: <BookOpen size={18} /> },
    { label: 'Milestones & Tests', to: '/student/tests', icon: <ClipboardList size={18} /> },
    { label: 'My Assignments', to: '/student/assignments', icon: <ClipboardList size={18} /> },
    { label: 'Progress Report', to: '/student/reports', icon: <BarChart3 size={18} /> },
    { label: 'Give Feedback', to: '/student/feedback', icon: <MessageSquareHeart size={18} /> },
  ],
  parent: [
    { label: 'Dashboard', to: '/parent/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Child Daily Routine', to: '/parent/schedule', icon: <Calendar size={18} /> },
    { label: 'Observations & Remarks', to: '/parent/remarks', icon: <MessageSquare size={18} /> },
    { label: 'Attendance & Leaves', to: '/parent/attendance', icon: <CalendarCheck size={18} /> },
    { label: 'Daily Work & Lessons', to: '/parent/daily-work', icon: <BookOpen size={18} /> },
    { label: 'Montessori Guides', to: '/parent/teachers', icon: <GraduationCap size={18} /> },
    { label: 'Messages', to: '/parent/messages', icon: <MessageSquare size={18} /> },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Users Directory', to: '/admin/users', icon: <Users size={18} /> },
    { label: 'Class Cohorts', to: '/admin/classes', icon: <BookMarked size={18} /> },
    { label: 'School Reports', to: '/admin/reports', icon: <BarChart3 size={18} /> },
    { label: 'Teacher Reports', to: '/admin/teacher-reports', icon: <GraduationCap size={18} /> },
    { label: 'Student Feedback', to: '/admin/feedback', icon: <MessageSquareHeart size={18} /> },
    { label: 'Settings', to: '/admin/settings', icon: <Settings size={18} /> },
  ],
};

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  teacher: <GraduationCap size={14} />,
  student: <BookOpen size={14} />,
  parent: <Heart size={14} />,
  admin: <ShieldCheck size={14} />,
};

const ROLE_COLORS: Record<Role, string> = {
  teacher: 'bg-[#E6F4F1] text-[#006B5D]',
  student: 'bg-[#E6F4F1] text-[#006B5D]',
  parent: 'bg-[#E6F4F1] text-[#006B5D]',
  admin: 'bg-[#E6F4F1] text-[#006B5D]',
};

// ─── Sidebar Inner ────────────────────────────────────────────────────────────
const SidebarContent: React.FC<{ collapsed: boolean; onToggle?: () => void; onClose?: () => void }> = ({
  collapsed, onToggle, onClose,
}) => {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = role ? NAV[role] : [];
  const initials = currentUser ? getInitials(currentUser.name) : 'KG';
  const avatarCls = currentUser ? avatarColors(currentUser.name) : 'bg-[#E6F4F1] text-[#006B5D]';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="flex h-20 flex-shrink-0 items-center px-5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#006B5D]">
          <GraduationCap className="text-white" size={16} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="ml-3 overflow-hidden"
            >
              <span className="whitespace-nowrap text-sm font-extrabold tracking-normal text-[#1D2939]">KinderGuide</span>
              <span className="block text-[10px] font-bold leading-none text-[#006B5D]">Montessori ERP</span>
            </motion.div>
          )}
        </AnimatePresence>
        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              'ml-auto flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl text-[#667085] transition-colors hover:bg-[#E6F4F1] hover:text-[#006B5D]',
              collapsed && 'mx-auto'
            )}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto text-[#667085] hover:text-[#344054]">
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* User Card */}
      <div className={cn(
        'mx-3 mb-3 flex flex-shrink-0 items-center gap-3 rounded-2xl border border-[#EAECF0] bg-[#F9FAFB] px-3 py-3',
        collapsed && 'justify-center px-2'
      )}>
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0', avatarCls)}>
          {initials}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-hidden"
            >
              <p className="truncate text-sm font-bold text-[#101828]">{currentUser?.name}</p>
              {role && (
                <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5', ROLE_COLORS[role])}>
                  {ROLE_ICONS[role]}
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
              isActive ? 'bg-[#E6F4F1] text-[#006B5D]' : 'text-[#667085] hover:bg-[#F6FAF9] hover:text-[#006B5D]',
              collapsed && 'justify-center px-2'
            )}
          >
            {({ isActive }) => (
              <>
                <span className={cn(isActive ? 'text-[#006B5D]' : 'text-[#98A2B3]')}>{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap overflow-hidden flex items-center gap-2"
                    >
                      {item.label}
                      {item.isLive && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping ml-auto" />
                      )}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="flex-shrink-0 px-3 py-3">
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#667085] transition-colors hover:bg-red-50 hover:text-red-600',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut size={18} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { isCollapsed, toggle, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden h-full flex-shrink-0 flex-col overflow-hidden lg:flex"
      >
        <SidebarContent collapsed={isCollapsed} onToggle={toggle} />
      </motion.aside>

      <Sheet open={isMobileOpen} onOpenChange={closeMobile}>
        <SheetContent side="left" className="p-0 w-60">
          <SidebarContent collapsed={false} onClose={closeMobile} />
        </SheetContent>
      </Sheet>
    </>
  );
};
