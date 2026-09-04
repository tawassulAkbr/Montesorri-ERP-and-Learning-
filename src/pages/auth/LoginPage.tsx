import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, BookOpen, Heart, ShieldCheck, ArrowRight, Loader2, Sparkles, BookMarked, MessageSquareHeart, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types';
import { cn } from '@/lib/utils';

const ROLES: { role: Role; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { role: 'teacher', label: 'Teacher', icon: <GraduationCap size={18} />, color: 'text-[#006B5D]', bg: 'bg-[#E6F4F1] border-[#B7DDD6]' },
  { role: 'student', label: 'Student', icon: <BookOpen size={18} />, color: 'text-[#006B5D]', bg: 'bg-[#E6F4F1] border-[#B7DDD6]' },
  { role: 'parent', label: 'Parent', icon: <Heart size={18} />, color: 'text-[#006B5D]', bg: 'bg-[#E6F4F1] border-[#B7DDD6]' },
  { role: 'admin', label: 'Admin', icon: <ShieldCheck size={18} />, color: 'text-[#006B5D]', bg: 'bg-[#E6F4F1] border-[#B7DDD6]' },
];

const ROLE_REDIRECTS: Record<Role, string> = {
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  parent: '/parent/dashboard',
  admin: '/admin/dashboard',
};

// Known seeded accounts (passwords are hashed in the DB; these hints exist for demo access).
const DEMO_ACCOUNTS: Record<Role, { email: string; password: string }> = {
  teacher: { email: 'amina.khan@faculty.kinderguide.com', password: 'teacher123' },
  student: { email: 'bilal.ahmed@kinderguide.com', password: 'student123' },
  parent: { email: 'bilal.ahmed@parent.kinderguide.com', password: 'parent123' },
  admin: { email: 'admin@kinderguide.com', password: 'admin123' },
};

const HERO_COPY: Record<Role, { headline: string; subtitle: string }> = {
  teacher: {
    headline: 'KinderGuide for Educators',
    subtitle: 'Empowering teachers to observe growth, organize Montessori work cycles, and inspire young minds every day.',
  },
  student: {
    headline: 'KinderGuide for Learners',
    subtitle: 'A fun Montessori space to explore hands-on activities, watch video lessons, and track daily achievements.',
  },
  parent: {
    headline: 'KinderGuide for Families',
    subtitle: "Your direct window into your child's daily Montessori journey, learning milestones, and teacher communications.",
  },
  admin: {
    headline: 'KinderGuide for Administrators',
    subtitle: 'Centralized management for school operations, user access, attendance records, and financial administration.',
  },
};

const RoleIllustration: React.FC<{ role: Role }> = ({ role }) => {
  const common = "w-full h-full flex items-center justify-center bg-[#F9FAFB] border border-[#EAECF0] rounded-3xl overflow-hidden relative shadow-inner";

  return (
    <div className={common}>
      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 flex flex-col items-center justify-center p-8 text-center"
        >
          {role === 'student' && (
            <div className="flex flex-col items-center gap-6">
              <div className="h-28 w-28 rounded-full bg-[#E6F4F1] flex items-center justify-center text-[#006B5D] shadow-[0_18px_35px_rgba(0,107,93,0.12)]">
                <Sparkles size={64} strokeWidth={1.5} />
              </div>
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-2xl bg-[#FDE7DB] flex items-center justify-center text-[#D9531E] shadow-sm">
                  <BookOpen size={32} />
                </div>
                <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-[#667085] shadow-sm border border-[#EAECF0]">
                  <GraduationCap size={32} />
                </div>
              </div>
            </div>
          )}
          {role === 'parent' && (
            <div className="flex flex-col items-center gap-6">
              <div className="h-28 w-28 rounded-full bg-[#FDE7DB] flex items-center justify-center text-[#D9531E] shadow-[0_18px_35px_rgba(217,83,30,0.12)]">
                <Heart size={64} strokeWidth={1.5} />
              </div>
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-2xl bg-[#E6F4F1] flex items-center justify-center text-[#006B5D] shadow-sm">
                  <MessageSquareHeart size={32} />
                </div>
                <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-[#667085] shadow-sm border border-[#EAECF0]">
                  <BookMarked size={32} />
                </div>
              </div>
            </div>
          )}
          {role === 'admin' && (
            <div className="flex flex-col items-center gap-6">
              <div className="h-28 w-28 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#4B5563] shadow-[0_18px_35px_rgba(75,85,99,0.12)]">
                <ShieldCheck size={64} strokeWidth={1.5} />
              </div>
              <div className="flex gap-4">
                <div className="w-32 h-16 rounded-2xl bg-white flex items-center justify-center text-[#006B5D] shadow-sm border border-[#EAECF0]">
                  <div className="flex flex-col gap-2 w-full px-4">
                    <div className="h-2 w-full bg-[#E6F4F1] rounded-full" />
                    <div className="h-2 w-2/3 bg-[#E6F4F1] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
          {role === 'teacher' && (
            <div className="flex flex-col items-center gap-6">
              <div className="h-28 w-28 rounded-full bg-[#006B5D] flex items-center justify-center text-white shadow-[0_18px_35px_rgba(0,107,93,0.22)]">
                <GraduationCap size={64} strokeWidth={1.5} />
              </div>
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-2xl bg-[#FDE7DB] flex items-center justify-center text-[#D9531E] shadow-sm">
                  <BookOpen size={32} />
                </div>
                <div className="h-16 w-16 rounded-2xl bg-[#E6F4F1] flex items-center justify-center text-[#006B5D] shadow-sm">
                  <BookMarked size={32} />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {/* Decorative background grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#006B5D 2px, transparent 2px)', backgroundSize: '32px 32px' }} />
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('kg-login-theme') !== 'light');
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoCred = DEMO_ACCOUNTS[selectedRole];
  const roleConfig = ROLES.find(r => r.role === selectedRole)!;
  const heroCopy = HERO_COPY[selectedRole];
  const panelText = dark ? 'text-white' : 'text-[#101828]';

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleDemoCredentialFill = (role: Role) => {
    const account = DEMO_ACCOUNTS[role];
    setSelectedRole(role);
    setError('');
    setEmail(account.email);
    setPassword(account.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(email, password, selectedRole);
    if (ok) {
      navigate(ROLE_REDIRECTS[selectedRole]);
    } else {
      setError('Invalid credentials for this portal. Accounts are issued by the school admin.');
    }
    setLoading(false);
  };

  const toggleTheme = () => setDark(v => {
    localStorage.setItem('kg-login-theme', v ? 'light' : 'dark');
    return !v;
  });

  return (
    <div className={cn('flex min-h-screen w-full transition-colors', dark ? 'dark bg-slate-900 text-white' : 'bg-white text-slate-900')}>
      <button
        type="button"
        onClick={toggleTheme}
        className={cn('fixed right-5 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition', dark ? 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}
        aria-label="Toggle theme"
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      {/* Left side: Premium Image Cover */}
      <div className="login-hero-bg relative hidden w-1/2 lg:block bg-gradient-to-br from-[#E6F4F1] to-[#F9FAFB]">
        {/* Abstract background blobs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#B7DDD6] blur-3xl opacity-30" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#006B5D] blur-3xl opacity-10" />

        <div className="absolute inset-0 z-20 flex flex-col justify-center gap-12 p-12 pb-32 text-[#101828]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006B5D]">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">KinderGuide</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            key={selectedRole}
            className="max-w-md"
          >
            <div className="mb-4 inline-flex items-center rounded-full bg-white px-3 py-1 text-sm font-bold text-[#006B5D] shadow-sm border border-[#EAECF0]">
              {roleConfig.icon} <span className="ml-2">{roleConfig.label} Portal</span>
            </div>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight">
              {heroCopy.headline}
            </h1>
            <p className="text-lg text-[#667085] leading-relaxed mb-6">
              {heroCopy.subtitle}
            </p>
            <div className="mx-auto w-full max-w-sm lg:max-w-md h-64">
              <RoleIllustration role={selectedRole} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className={cn('flex w-full flex-col justify-center px-6 lg:w-1/2 lg:px-20 xl:px-32', dark ? 'bg-slate-900' : 'bg-white')}>
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006B5D] text-white shadow-lg">
              <GraduationCap size={24} />
            </div>
            <span className={cn('text-xl font-extrabold', panelText)}>KinderGuide</span>
          </div>

          <div className="mb-5">
            <h2 className={cn('text-3xl font-extrabold tracking-tight', panelText)}>
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-[#667085]">
              Please enter your details to sign in to your account.
            </p>
          </div>

          <div className={cn('mb-6 grid grid-cols-4 gap-1.5 rounded-xl p-1', dark ? 'bg-slate-800' : 'bg-white')}>
            {ROLES.map(r => (
              <button
                key={r.role}
                type="button"
                onClick={() => handleRoleSelect(r.role)}
                className={cn(
                  'flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-bold transition-all border',
                  selectedRole === r.role
                    ? 'bg-white text-[#006B5D] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-[#B7DDD6]'
                    : dark ? 'text-slate-300 border-slate-700 hover:bg-slate-800' : 'text-[#667085] border-transparent hover:bg-[#F6FAF9] hover:text-[#344054]'
                )}
              >
                <span className={selectedRole === r.role ? 'text-[#006B5D]' : 'text-[#98A2B3]'}>
                  {r.icon}
                </span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className={cn('text-sm font-bold', dark ? 'text-slate-200' : 'text-[#344054]')}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1.5 h-12 rounded-xl border-[#EAECF0] bg-[#F9FAFB] px-4 text-sm text-[#101828] placeholder:text-[#98A2B3] focus-visible:border-[#006B5D] focus-visible:ring-[#E6F4F1] focus-visible:bg-white transition-colors"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className={cn('text-sm font-bold', dark ? 'text-slate-200' : 'text-[#344054]')}>
                Password
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 rounded-xl border-[#EAECF0] bg-[#F9FAFB] px-4 pr-10 text-sm text-[#101828] placeholder:text-[#98A2B3] focus-visible:border-[#006B5D] focus-visible:ring-[#E6F4F1] focus-visible:bg-white transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] transition-colors hover:text-[#344054]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className={cn('flex items-center gap-2.5 text-sm font-medium', dark ? 'text-slate-400' : 'text-[#667085]')}>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#D0D5DD] text-[#006B5D] focus:ring-[#E6F4F1]"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-bold text-[#006B5D] hover:text-[#005E54] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <p className="text-sm font-semibold text-red-600">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-[#006B5D] text-sm font-bold text-white shadow-[0_8px_20px_rgba(0,107,93,0.16)] hover:bg-[#005E54] hover:shadow-[0_12px_24px_rgba(0,107,93,0.22)] transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className={cn('mt-6 rounded-xl border p-5', dark ? 'border-slate-700 bg-slate-800' : 'border-[#EAECF0] bg-white')}>
            <div className="mb-4 flex items-center justify-between">
              <p className={cn('text-sm font-bold', dark ? 'text-slate-200' : 'text-[#344054]')}>Demo Account</p>
              <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-bold', dark ? 'border-slate-600 bg-slate-900 text-slate-200' : 'border-[#EAECF0] bg-white text-[#344054]')}>
                {roleConfig.label}
              </span>
            </div>
            {demoCred ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className={dark ? 'text-slate-400' : 'text-[#667085]'}>Email</span>
                  <span className={cn('font-mono font-medium', dark ? 'text-slate-100' : 'text-[#101828]')}>{demoCred.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={dark ? 'text-slate-400' : 'text-[#667085]'}>Password</span>
                  <span className={cn('font-mono font-medium', dark ? 'text-slate-100' : 'text-[#101828]')}>{demoCred.password}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoCredentialFill(selectedRole)}
                  className={cn('mt-2 w-full h-10 font-bold transition-colors', dark ? 'border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-700' : 'border-[#EAECF0] bg-white hover:bg-slate-50')}
                >
                  Fill credentials
                </Button>
              </div>
            ) : (
              <p className={cn('text-sm', dark ? 'text-slate-400' : 'text-[#667085]')}>No demo account available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
