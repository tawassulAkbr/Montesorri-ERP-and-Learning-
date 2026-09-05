import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle2, Upload, Trash2, CheckCircle2, AlertCircle, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { apiPut, uploadFile } from '@/lib/api';
import { TEACHER_SUBJECTS, getInitials, avatarColors } from '@/lib/utils';
import type { Teacher, Student, Parent, User } from '@/types';

export const ProfilePage: React.FC = () => {
  const { currentUser, role, applyUser } = useAuth();

  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState((currentUser as Teacher | Student | Parent | null)?.phone ?? '');
  const [qualification, setQualification] = useState((currentUser as Teacher | null)?.qualification ?? '');
  const [subject, setSubject] = useState((currentUser as Teacher | null)?.subject ?? TEACHER_SUBJECTS[0]);
  const [address, setAddress] = useState((currentUser as Student | null)?.address ?? '');
  const [guardianName, setGuardianName] = useState((currentUser as Student | null)?.guardianName ?? '');

  // undefined = unchanged, '' = remove, otherwise the new uploaded URL
  const [pendingAvatar, setPendingAvatar] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const displayedAvatar = pendingAvatar !== undefined ? pendingAvatar : currentUser.avatar;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const res = await uploadFile(file);
      setPendingAvatar(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, string> = { name: name.trim() };
      if (pendingAvatar !== undefined) payload.avatarUrl = pendingAvatar;
      if (phone.trim()) payload.phone = phone.trim();
      if (role === 'teacher') {
        if (qualification.trim()) payload.qualification = qualification.trim();
        if (subject) payload.subject = subject;
      }
      if (role === 'student') {
        if (address.trim()) payload.address = address.trim();
        if (guardianName.trim()) payload.guardianName = guardianName.trim();
      }

      const res = await apiPut<{ user: User }>('/auth/profile', payload);
      applyUser(res.user);
      setPendingAvatar(undefined);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const initials = getInitials(currentUser.name);
  const avatarCls = avatarColors(currentUser.name);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#101828]">My Profile</h1>
        <p className="text-sm text-[#667085]">Update your photo, name and personal details</p>
      </div>

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Camera className="text-[#006B5D]" size={20} />
            <CardTitle>Profile Photo</CardTitle>
          </div>
          <CardDescription>Upload a photo so teachers and parents can recognize you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-5">
            {displayedAvatar ? (
              <img
                src={displayedAvatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-bold ${avatarCls}`}>
                {initials}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? 'Uploading…' : 'Upload Photo'}
                </Button>
                {displayedAvatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={uploading}
                    onClick={() => setPendingAvatar('')}
                  >
                    <Trash2 size={14} /> Remove
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-[#667085]">PNG or JPG. Saved changes apply after pressing Save.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCircle2 className="text-[#006B5D]" size={20} />
            <CardTitle>Personal Details</CardTitle>
          </div>
          <CardDescription>
            Your login email cannot be changed here — contact the admin if it needs updating.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm mb-4"
            >
              <CheckCircle2 size={16} />
              Profile updated successfully!
            </motion.div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm mb-4">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-[#344054]">Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="mt-1.5" required minLength={2} />
              </div>
              <div>
                <Label className="text-xs font-medium text-[#344054]">Email <span className="text-[#667085]">(login)</span></Label>
                <Input value={currentUser.email} disabled className="mt-1.5 bg-slate-50 text-[#667085]" />
              </div>
            </div>

            {role !== 'admin' && (
              <div>
                <Label className="text-xs font-medium text-[#344054]">Contact Number</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92 300 0000000" className="mt-1.5" />
              </div>
            )}

            {role === 'teacher' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-[#344054]">Subject Area</Label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full mt-1.5 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D] bg-white"
                  >
                    {!(TEACHER_SUBJECTS as readonly string[]).includes(subject) && <option>{subject}</option>}
                    {TEACHER_SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-[#344054]">Qualification</Label>
                  <Input value={qualification} onChange={e => setQualification(e.target.value)} placeholder="e.g. AMI Montessori Diploma" className="mt-1.5" />
                </div>
              </div>
            )}

            {role === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-[#344054]">Parent / Guardian Name</Label>
                  <Input value={guardianName} onChange={e => setGuardianName(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-[#344054]">Home Address</Label>
                  <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="House, street, city" className="mt-1.5" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Badge variant="secondary" className="capitalize">{role}</Badge>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
