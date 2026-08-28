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
  { role: 'teacher', label: 'Teacher', icon: <GraduationCap size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-300' },
  { role: 'student', label: 'Student', icon: <BookOpen size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-300' },
  { role: 'parent', label: 'Parent', icon: <Heart size={18} />, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-300' },
  { role: 'admin', label: 'Admin', icon: <ShieldCheck size={18} />, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-300' },
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

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-white/5 rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white" size={22} />
            </div>
            <span className="text-white font-bold text-xl">KinderGuide</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              A Montessori Home<br />
              <span className="text-indigo-200">For Everyone</span>
            </h1>
            <p className="text-indigo-200 text-lg leading-relaxed mb-12">
              Separate portals for teachers, children, and parents — one school, one shared journey.
            </p>
          </motion.div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              '🧩 Montessori work cycles & video lessons',
              '📊 Daily attendance for children and staff',
              '💬 Direct teacher-parent communication',
              '🏫 Admin-managed accounts & fee records',
            ].map((feat, i) => (
              <motion.div
                key={feat}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-white/90 text-sm"
              >
                <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full flex-shrink-0" />
                {feat}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-[440px] flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="text-white" size={16} />
            </div>
            <span className="font-bold text-slate-800">KinderGuide</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back!</h2>
          <p className="text-sm text-slate-400 mb-7">Choose your portal and sign in</p>

          {/* Role Selector */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {ROLES.map(r => (
              <button
                key={r.role}
                id={`role-${r.role}`}
                onClick={() => handleRoleSelect(r.role)}
                className={cn(
                  'flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border-2 transition-all text-center',
                  selectedRole === r.role
                    ? `${r.bg} border-current ${r.color} shadow-sm`
                    : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                )}
              >
                <span className={selectedRole === r.role ? r.color : ''}>{r.icon}</span>
                <span className="text-[11px] font-semibold">{r.label}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs font-medium text-slate-600">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-medium text-slate-600">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight size={16} />}
            </Button>

            <div className="text-center">
              <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                Forgot password?
              </Link>
            </div>
          </form>

          {/* Demo credentials */}
          <div className={cn('mt-5 p-3 rounded-xl border text-xs', roleConfig.bg)}>
            <p className={cn('font-semibold mb-1', roleConfig.color)}>
              Demo credentials ({roleConfig.label})
            </p>
            {demoCred ? (
              <>
                <p className="text-slate-600">Email: <span className="font-mono font-medium">{demoCred.email}</span></p>
                <p className="text-slate-600">Password: <span className="font-mono font-medium">{demoCred.password}</span></p>
              </>
            ) : (
              <p className="text-slate-600">No accounts yet — ask the school admin to create one.</p>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-5">
            Accounts are created and managed by the school administrator.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
