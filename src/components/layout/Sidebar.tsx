import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Video, ClipboardList, CalendarCheck, BarChart3,
  MessageSquare, BookOpen, Users, GraduationCap, Heart, ShieldCheck,
  LogOut, ChevronLeft, ChevronRight, Settings, BookMarked, Radio, Calendar
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
    { label: 'Milestones & Tests', to: '/teacher/tests', icon: <ClipboardList size={18} /> },
    { label: 'Observations & Remarks', to: '/teacher/remarks', icon: <MessageSquare size={18} /> },
    { label: 'Progress Reports', to: '/teacher/reports', icon: <BarChart3 size={18} /> },
  ],
  student: [
    { label: 'Dashboard', to: '/student/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Live Classroom', to: '/student/live-class', icon: <Radio size={18} className="text-red-500" />, isLive: true },
    { label: 'My Daily Routine', to: '/student/schedule', icon: <Calendar size={18} /> },
    { label: 'Video Lectures', to: '/student/lectures', icon: <Video size={18} /> },
    { label: 'Daily Activities', to: '/student/daily-work', icon: <BookOpen size={18} /> },
    { label: 'Milestones & Tests', to: '/student/tests', icon: <ClipboardList size={18} /> },
    { label: 'Progress Report', to: '/student/reports', icon: <BarChart3 size={18} /> },
  ],
  parent: [
    { label: 'Dashboard', to: '/parent/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Child Daily Routine', to: '/parent/schedule', icon: <Calendar size={18} /> },
    { label: 'Observations & Remarks', to: '/parent/remarks', icon: <MessageSquare size={18} /> },
    { label: 'Attendance & Leaves', to: '/parent/attendance', icon: <CalendarCheck size={18} /> },
    { label: 'Daily Work & Lessons', to: '/parent/daily-work', icon: <BookOpen size={18} /> },
    { label: 'Montessori Guides', to: '/parent/teachers', icon: <GraduationCap size={18} /> },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Users Directory', to: '/admin/users', icon: <Users size={18} /> },
    { label: 'Class Cohorts', to: '/admin/classes', icon: <BookMarked size={18} /> },
    { label: 'School Reports', to: '/admin/reports', icon: <BarChart3 size={18} /> },
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
  teacher: 'bg-indigo-100 text-indigo-700',
  student: 'bg-emerald-100 text-emerald-700',
  parent: 'bg-sky-100 text-sky-700',
  admin: 'bg-violet-100 text-violet-700',
};

// ─── Sidebar Inner ────────────────────────────────────────────────────────────
const SidebarContent: React.FC<{ collapsed: boolean; onToggle?: () => void; onClose?: () => void }> = ({
  collapsed, onToggle, onClose,
}) => {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = role ? NAV[role] : [];
  const initials = currentUser ? getInitials(currentUser.name) : 'KG';
  const avatarCls = currentUser ? avatarColors(currentUser.name) : 'bg-indigo-100 text-indigo-700';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-100">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
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
              <span className="font-bold text-slate-800 text-sm tracking-tight whitespace-nowrap">KinderGuide</span>
              <span className="block text-[10px] text-indigo-600 font-semibold leading-none">Montessori ERP</span>
            </motion.div>
          )}
        </AnimatePresence>
        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              'ml-auto w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0',
              collapsed && 'mx-auto'
            )}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600">
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* User Card */}
      <div className={cn(
        'flex items-center gap-3 px-3 py-4 border-b border-slate-100 flex-shrink-0',
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
              <p className="text-sm font-semibold text-slate-800 truncate">{currentUser?.name}</p>
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
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive ? 'nav-link-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
              collapsed && 'justify-center px-2'
            )}
          >
            {({ isActive }) => (
              <>
                <span className={cn(isActive ? 'text-indigo-600' : 'text-slate-400')}>{item.icon}</span>
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
      <div className="px-2 py-3 border-t border-slate-100 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer',
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
        className="hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0 overflow-hidden"
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
