import { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 3000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Security Settings</h1>
        <p className="text-sm text-slate-500">Manage your account password and security preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="text-indigo-600" size={20} />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>
            Ensure your account uses a strong, random password to stay secure.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm mb-4"
            >
              <CheckCircle2 size={16} />
              Password updated successfully!
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-slate-600">Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="mt-1.5"
                required
              />
            </div>

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
              <Label className="text-xs font-medium text-slate-600">Confirm New Password</Label>
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

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
