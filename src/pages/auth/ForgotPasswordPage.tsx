import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, KeyRound, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <GraduationCap className="text-white" size={16} />
          </div>
          <span className="font-bold text-slate-800">KinderGuide</span>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Password Reset Successful!</h2>
            <p className="text-sm text-slate-500 mb-6">You can now sign in with your new password.</p>
            <Link to="/login">
              <Button className="w-full">Sign In Now</Button>
            </Link>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Forgot Password?</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Enter your email address and we'll send you a 6-digit verification code.
                </p>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (email) setStep(2);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-xs font-medium text-slate-600">Registered Email</Label>
                    <div className="relative mt-1.5">
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. sarah.mitchell@kinderguide.edu"
                        required
                      />
                      <Mail size={16} className="absolute right-3 top-3 text-slate-400" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full gap-2">
                    Send Code <ArrowRight size={16} />
                  </Button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-4"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Enter Verification Code</h2>
                <p className="text-sm text-slate-500 mb-6">
                  We've sent a 6-digit code to <span className="font-semibold text-slate-700">{email}</span>
                </p>

                <div className="flex justify-between gap-2 mb-6">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      className="w-12 h-12 text-center text-lg font-bold border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  ))}
                </div>

                <Button
                  onClick={() => setStep(3)}
                  className="w-full gap-2"
                  disabled={otp.some(d => !d)}
                >
                  Verify Code <ArrowRight size={16} />
                </Button>

                <p className="text-center text-xs text-slate-400 mt-4">
                  Didn't receive code?{' '}
                  <button type="button" className="text-indigo-600 font-medium hover:underline">
                    Resend
                  </button>
                </p>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleReset} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 mb-1">Create New Password</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Your new password must be different from previous passwords.
                </p>

                <div>
                  <Label className="text-xs font-medium text-slate-600">New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-slate-600">Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="mt-1.5"
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!newPassword || newPassword !== confirmPassword}
                >
                  Reset Password
                </Button>
              </form>
            )}

            <div className="text-center mt-6">
              <Link to="/login" className="text-xs text-slate-500 hover:text-indigo-600 font-medium">
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
