import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiPost } from '@/lib/api';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    setLoading(true);
    setError('');
    try {
      await apiPost('/auth/reset-password', { token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
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
        ) : !token ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid Reset Link</h2>
            <p className="text-sm text-slate-500 mb-6">
              This link is missing its token. Please request a new reset link.
            </p>
            <Link to="/forgot-password">
              <Button className="w-full">Request New Link</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Create New Password</h2>
            <p className="text-sm text-slate-500 mb-6">
              Choose a new password for your account (at least 6 characters).
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
                minLength={6}
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

            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !newPassword || newPassword !== confirmPassword}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="text-xs text-slate-500 hover:text-indigo-600 font-medium">
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
