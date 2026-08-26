import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Eye, EyeOff, BookOpen, Heart, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Role } from '@/types';
import { cn } from '@/lib/utils';

const ROLES: { role: Role; label: string; icon: React.ReactNode; color: string }[] = [
  { role: 'teacher', label: 'Teacher', icon: <GraduationCap size={20} />, color: 'text-indigo-600' },
  { role: 'student', label: 'Student', icon: <BookOpen size={20} />, color: 'text-emerald-600' },
  { role: 'parent', label: 'Parent', icon: <Heart size={20} />, color: 'text-sky-600' },
  { role: 'admin', label: 'Admin', icon: <ShieldCheck size={20} />, color: 'text-violet-600' },
];

export const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [extraField, setExtraField] = useState('');
  const [classField, setClassField] = useState('Grade 5A');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  const extraLabel: Record<Role, string> = {
    teacher: 'Employee ID', student: 'Roll Number', parent: "Child's Enrollment ID", admin: 'Admin Code',
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-8"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Account Created!</h2>
        <p className="text-slate-500 mb-6">Your account has been successfully set up.</p>
        <Link to="/login"><Button>Go to Login <ArrowRight size={16} /></Button></Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <GraduationCap className="text-white" size={16} />
          </div>
          <span className="font-bold text-slate-800">KinderGuide</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className={cn('h-1.5 flex-1 rounded-full transition-colors', s <= step ? 'bg-indigo-600' : 'bg-slate-100')} />
          ))}
          <span className="text-xs text-slate-400 ml-1">{step}/2</span>
        </div>

        {step === 1 ? (
          <>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Create your account</h2>
            <p className="text-sm text-slate-400 mb-6">Select your role and fill in your details</p>

            {/* Role Grid */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {ROLES.map(r => (
                <button
                  key={r.role}
                  onClick={() => setRole(r.role)}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all',
                    role === r.role ? 'border-indigo-300 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'
                  )}
                >
                  <span className={role === r.role ? r.color : 'text-slate-400'}>{r.icon}</span>
                  <span className={`text-sm font-medium ${role === r.role ? 'text-slate-800' : 'text-slate-500'}`}>{r.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-slate-600">Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">Email Address</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="mt-1.5" />
              </div>
              {role === 'student' && (
                <div>
                  <Label className="text-xs font-medium text-slate-600">Class</Label>
                  <select value={classField} onChange={e => setClassField(e.target.value)} className="w-full mt-1.5 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Grade 5A</option><option>Grade 5B</option><option>Grade 6A</option><option>Grade 6B</option>
                  </select>
                </div>
              )}
              <div>
                <Label className="text-xs font-medium text-slate-600">{extraLabel[role]}</Label>
                <Input value={extraField} onChange={e => setExtraField(e.target.value)} placeholder={`Enter your ${extraLabel[role].toLowerCase()}`} className="mt-1.5" />
              </div>
            </div>

            <Button
              className="w-full mt-5 gap-2"
              onClick={() => name && email && setStep(2)}
              disabled={!name || !email}
            >
              Continue <ArrowRight size={16} />
            </Button>
          </>
        ) : (
          <>
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
              <ArrowLeft size={14} /> Back
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Set your password</h2>
            <p className="text-sm text-slate-400 mb-6">Choose a strong password for your account</p>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-slate-600">Password</Label>
                <div className="relative mt-1.5">
                  <Input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" className="pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={cn('h-1.5 flex-1 rounded-full', i <= strength ? strengthColors[strength] : 'bg-slate-100')} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {strengthLabels[strength]}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">Confirm Password</Label>
                <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm your password" className="mt-1.5" />
                {confirm && password !== confirm && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
              </div>
            </div>
            <Button
              className="w-full mt-5"
              onClick={() => password && password === confirm && setDone(true)}
              disabled={!password || password !== confirm}
            >
              Create Account
            </Button>
          </>
        )}

        <p className="text-center text-xs text-slate-400 mt-5">
          Already have an account? <Link to="/login" className="text-indigo-600 font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};
