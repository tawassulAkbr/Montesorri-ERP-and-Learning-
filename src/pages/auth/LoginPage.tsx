import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, BookOpen, Heart, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types';
import { cn } from '@/lib/utils';

const ROLES: { role: Role; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { role: 'teacher', label: 'Teacher', icon: <GraduationCap size={16} />, color: 'text-[#006B5D]', bg: 'bg-[#E6F4F1] border-[#B7DDD6]' },
  { role: 'student', label: 'Student', icon: <BookOpen size={16} />, color: 'text-[#006B5D]', bg: 'bg-[#E6F4F1] border-[#B7DDD6]' },
  { role: 'parent', label: 'Parent', icon: <Heart size={16} />, color: 'text-[#006B5D]', bg: 'bg-[#E6F4F1] border-[#B7DDD6]' },
  { role: 'admin', label: 'Admin', icon: <ShieldCheck size={16} />, color: 'text-[#006B5D]', bg: 'bg-[#E6F4F1] border-[#B7DDD6]' },
];

const ROLE_REDIRECTS: Record<Role, string> = {
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  parent: '/parent/dashboard',
  admin: '/admin/dashboard',
};

// Known seeded accounts (passwords are hashed in the DB; these hints exist for demo access).
const DEMO_ACCOUNTS: Record<Role, { email: string; password: string }> = {
  teacher: { email: 'sarah.mitchell@kinderguide.edu', password: 'teacher123' },
  student: { email: 'ali.hassan@student.edu', password: 'student123' },
  parent: { email: 'hassan.ahmed@parent.com', password: 'parent123' },
  admin: { email: 'admin@kinderguide.edu', password: 'admin123' },
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
  const common = "drop-shadow-[0_18px_35px_rgba(0,107,93,0.12)]";

  if (role === 'student') {
    return (
      <svg viewBox="0 0 420 300" className={common} role="img" aria-label="Student learning illustration">
        <rect x="58" y="92" width="304" height="158" rx="30" fill="#E6F4F1" />
        <rect x="104" y="132" width="94" height="92" rx="20" fill="#006B5D" />
        <rect x="222" y="154" width="92" height="70" rx="18" fill="#FDE7DB" />
        <path d="M141 116h80l-40-27-40 27Z" fill="#D9531E" />
        <rect x="140" y="116" width="82" height="14" rx="7" fill="#005E54" />
        <circle cx="138" cy="172" r="10" fill="#fff" />
        <circle cx="166" cy="172" r="10" fill="#fff" />
        <path d="M134 202c24 14 48 14 72 0" stroke="#fff" strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M292 88l13 27 29 5-21 21 4 29-25-14-26 14 5-29-21-21 29-5 13-27Z" fill="#006B5D" />
        <path d="M78 142l7 15 16 3-12 12 3 16-14-8-14 8 3-16-12-12 16-3 7-15Z" fill="#D9531E" />
        <rect x="246" y="184" width="44" height="9" rx="4.5" fill="#006B5D" />
        <rect x="246" y="204" width="34" height="9" rx="4.5" fill="#D9531E" />
      </svg>
    );
  }

  if (role === 'parent') {
    return (
      <svg viewBox="0 0 420 300" className={common} role="img" aria-label="Parent community illustration">
        <rect x="54" y="78" width="312" height="174" rx="30" fill="#E6F4F1" />
        <rect x="86" y="146" width="176" height="82" rx="24" fill="#fff" />
        <circle cx="132" cy="124" r="32" fill="#006B5D" />
        <circle cx="192" cy="110" r="38" fill="#D9531E" />
        <circle cx="252" cy="124" r="32" fill="#006B5D" />
        <path d="M108 213c10-28 36-43 84-43s74 15 84 43" fill="#006B5D" opacity=".16" />
        <rect x="258" y="72" width="88" height="54" rx="20" fill="#fff" />
        <path d="M292 126l-17 21 5-27" fill="#fff" />
        <circle cx="286" cy="98" r="5" fill="#006B5D" />
        <circle cx="304" cy="98" r="5" fill="#D9531E" />
        <circle cx="322" cy="98" r="5" fill="#006B5D" />
        <path d="M121 188h42M121 205h72" stroke="#B7DDD6" strokeWidth="8" strokeLinecap="round" />
      </svg>
    );
  }

  if (role === 'admin') {
    return (
      <svg viewBox="0 0 420 300" className={common} role="img" aria-label="Admin dashboard illustration">
        <rect x="58" y="72" width="304" height="178" rx="28" fill="#E6F4F1" />
        <rect x="92" y="128" width="190" height="96" rx="18" fill="#fff" />
        <path d="M187 82l88 52H99l88-52Z" fill="#006B5D" />
        <rect x="123" y="150" width="18" height="50" rx="9" fill="#D9531E" />
        <rect x="164" y="138" width="18" height="62" rx="9" fill="#006B5D" />
        <rect x="205" y="165" width="18" height="35" rx="9" fill="#B7DDD6" />
        <rect x="251" y="94" width="76" height="50" rx="16" fill="#fff" />
        <path d="M271 120h36M271 106h22" stroke="#006B5D" strokeWidth="7" strokeLinecap="round" />
        <path d="M315 154l36 16v29c0 26-18 43-36 51-18-8-36-25-36-51v-29l36-16Z" fill="#005E54" />
        <path d="M300 198l11 11 22-29" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 420 300" className={common} role="img" aria-label="Teacher lesson illustration">
      <rect x="58" y="76" width="304" height="174" rx="30" fill="#E6F4F1" />
      <rect x="96" y="110" width="154" height="120" rx="22" fill="#006B5D" />
      <rect x="112" y="128" width="122" height="78" rx="14" fill="#fff" />
      <path d="M134 158h70M134 181h46M134 144h82" stroke="#006B5D" strokeWidth="9" strokeLinecap="round" />
      <rect x="252" y="126" width="74" height="102" rx="18" fill="#fff" />
      <rect x="269" y="148" width="40" height="8" rx="4" fill="#D9531E" />
      <rect x="269" y="170" width="40" height="8" rx="4" fill="#006B5D" />
      <rect x="269" y="192" width="30" height="8" rx="4" fill="#B7DDD6" />
      <path d="M321 64l8 17 18 8-18 8-8 18-8-18-18-8 18-8 8-17Z" fill="#D9531E" />
      <circle cx="120" cy="244" r="14" fill="#D9531E" />
      <circle cx="158" cy="244" r="14" fill="#006B5D" />
    </svg>
  );
};

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoCred = DEMO_ACCOUNTS[selectedRole];

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

  const roleConfig = ROLES.find(r => r.role === selectedRole)!;
  const heroCopy = HERO_COPY[selectedRole];

  return (
    <div className="m-0 h-screen min-h-screen w-screen overflow-hidden bg-white p-0 text-[#0B1B3D]">
      <div className="flex h-full w-full items-stretch justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid h-full w-full overflow-hidden bg-white lg:grid-cols-[1.08fr_0.92fr]"
        >
          <section className="relative hidden overflow-hidden border-r border-teal-900/10 bg-white px-12 py-12 lg:block">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              className="relative z-10 max-w-md"
            >
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#006B5D]">
                KinderGuide
              </p>
              <div className="mb-5 inline-flex items-center rounded-full border border-[#B7DDD6] bg-[#E6F4F1] px-3 py-1 text-xs font-bold text-[#006B5D]">
                {roleConfig.label} Portal
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#0B1B3D] lg:text-4xl">
                {heroCopy.headline}
              </h1>
              <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
                {heroCopy.subtitle}
              </p>
              <div className="mx-auto mt-8 h-auto w-full max-w-sm lg:max-w-md">
                <RoleIllustration role={selectedRole} />
              </div>
            </motion.div>
          </section>

          <section className="flex items-center justify-center bg-white px-6 py-8 sm:px-10 lg:px-14">
            <motion.div
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-[390px]"
            >
              <div className="mb-10 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#006B5D] text-white shadow-[0_10px_22px_rgba(0,107,93,0.18)]">
                  <GraduationCap size={19} />
                </div>
                <span className="text-lg font-extrabold tracking-normal text-[#1D2939]">
                  KinderGuide
                </span>
              </div>

              <div className="mb-7">
                <p className="mb-2 text-sm font-extrabold text-[#006B5D]">Login</p>
                <h2 className="text-3xl font-extrabold tracking-normal text-[#101828]">
                  Login to your account
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-[#667085]">
                  Choose your portal and enter your school credentials.
                </p>
              </div>

              <div className="mb-6 grid grid-cols-4 gap-2 rounded-lg border border-[#EAECF0] bg-[#F9FAFB] p-1.5">
                {ROLES.map(r => (
                  <button
                    key={r.role}
                    id={`role-${r.role}`}
                    type="button"
                    onClick={() => handleRoleSelect(r.role)}
                    className={cn(
                      'flex min-h-16 flex-col items-center justify-center gap-1 rounded-md px-1.5 py-2 text-center text-[11px] font-bold transition-all',
                      selectedRole === r.role
                        ? `${r.bg} ${r.color} border shadow-[0_8px_18px_rgba(0,107,93,0.12)]`
                        : 'border border-transparent text-[#667085] hover:bg-white hover:text-[#344054]'
                    )}
                  >
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-bold text-[#344054]">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="mt-2 h-11 rounded-md border-[#EAECF0] bg-[#F9FAFB] px-3 text-sm text-[#101828] placeholder:text-[#98A2B3] focus-visible:border-[#006B5D] focus-visible:ring-[#E6F4F1]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-bold text-[#344054]">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-11 rounded-md border-[#EAECF0] bg-[#F9FAFB] px-3 pr-10 text-sm text-[#101828] placeholder:text-[#98A2B3] focus-visible:border-[#006B5D] focus-visible:ring-[#E6F4F1]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] transition-colors hover:text-[#344054]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#667085]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#D0D5DD] accent-[#006B5D]"
                    />
                    Remember me
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-[#006B5D] transition-colors hover:text-[#005E54]"
                  >
                    Forgot password?
                  </Link>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-md border border-[#FECDCA] bg-[#FEF3F2] px-3 py-2 text-xs font-semibold text-[#B42318]"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full rounded-md bg-[#006B5D] text-sm font-extrabold uppercase tracking-normal text-white shadow-[0_12px_24px_rgba(0,107,93,0.18)] hover:bg-[#005E54] hover:shadow-[0_14px_28px_rgba(0,107,93,0.24)]"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                  {!loading && <ArrowRight size={16} />}
                </Button>
              </form>

              <div className={cn('mt-6 rounded-md border p-4 text-xs', roleConfig.bg)}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className={cn('font-extrabold', roleConfig.color)}>
                    Demo credentials
                  </p>
                  <span className="rounded-full border border-[#EAECF0] bg-white px-2.5 py-1 font-bold text-[#667085]">
                    {roleConfig.label}
                  </span>
                </div>
                {demoCred ? (
                  <div className="space-y-2">
                    <p className="flex flex-wrap items-center gap-2 text-[#667085]">
                      Email
                      <span className="rounded-full border border-[#EAECF0] bg-white px-2.5 py-1 font-mono font-semibold text-[#344054]">
                        {demoCred.email}
                      </span>
                    </p>
                    <p className="flex flex-wrap items-center gap-2 text-[#667085]">
                      Password
                      <span className="rounded-full border border-[#EAECF0] bg-white px-2.5 py-1 font-mono font-semibold text-[#344054]">
                        {demoCred.password}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDemoCredentialFill(selectedRole)}
                      className="mt-1 text-xs font-extrabold text-[#006B5D] transition-colors hover:text-[#005E54]"
                    >
                      Use demo credentials
                    </button>
                  </div>
                ) : (
                  <p className="text-[#667085]">No accounts yet. Ask the school admin to create one.</p>
                )}
              </div>

              <p className="mt-5 text-center text-xs font-medium text-[#98A2B3]">
                Accounts are created and managed by the school administrator.
              </p>
            </motion.div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};
