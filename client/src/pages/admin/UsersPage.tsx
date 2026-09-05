import { useState } from 'react';
import {
  Plus, Search, KeyRound, Copy, Check, GraduationCap, Heart, BookOpen, AlertCircle, Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useData } from '@/context/DataContext';
import { MONTESSORI_CLASSES, TEACHER_SUBJECTS, todayISO, isWeekend, getInitials, avatarColors, cn, EMPLOYMENT_STATUS_LABELS, slugEmail } from '@/lib/utils';
import type { IssuedCredentials, Student, Teacher, Parent, TeacherAttendanceRecord, EmploymentStatus } from '@/types';

type TabId = 'teacher' | 'student' | 'parent';

// ─── Credentials Dialog (shown after creating accounts / resetting passwords) ─
const CredentialsDialog: React.FC<{
  issued: IssuedCredentials[] | null;
  onClose: () => void;
}> = ({ issued, onClose }) => {
  const [copied, setCopied] = useState('');

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    });
  };

  return (
    <Dialog open={!!issued} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound size={16} className="text-[#006B5D]" />
            Account Credentials
          </DialogTitle>
          <DialogDescription>
            Share these credentials securely. They will not be shown again in full.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {issued?.map((cred, i) => (
            <div key={i} className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="capitalize">{cred.role}</Badge>
                <span className="text-xs font-semibold text-[#344054]">{cred.name}</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#667085]">Email</span>
                  <span className="flex items-center gap-1.5 font-mono font-medium text-[#101828]">
                    {cred.email}
                    <button
                      onClick={() => copy(cred.email, `email-${i}`)}
                      className="text-[#667085] hover:text-[#006B5D]"
                    >
                      {copied === `email-${i}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#667085]">Password</span>
                  <span className="flex items-center gap-1.5 font-mono font-bold text-[#006B5D]">
                    {cred.password}
                    <button
                      onClick={() => copy(cred.password, `pw-${i}`)}
                      className="text-[#667085] hover:text-[#006B5D]"
                    >
                      {copied === `pw-${i}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Add Teacher Modal ────────────────────────────────────────────────────────
const AddTeacherModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onCreated: (cred: IssuedCredentials) => void;
}> = ({ open, onClose, onCreated }) => {
  const { createTeacher } = useData();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [subject, setSubject] = useState<string>(TEACHER_SUBJECTS[0]);
  const [classes, setClasses] = useState<string[]>([MONTESSORI_CLASSES[1]]);
  const [status, setStatus] = useState<EmploymentStatus>('active');
  const [personalEmail, setPersonalEmail] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleClass = (cls: string) => {
    setClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]);
  };

  const reset = () => {
    setName(''); setPhone(''); setQualification('');
    setSubject(TEACHER_SUBJECTS[0]); setClasses([MONTESSORI_CLASSES[1]]); setError('');
    setStatus('active'); setJoinDate(''); setPersonalEmail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = slugEmail(name, 'faculty.kinderguide.com');
    if (classes.length === 0) {
      setError('Select at least one class.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const cred = await createTeacher({
        name: name.trim(), email: emailLower, phone: phone.trim(),
        personalEmail: personalEmail.trim() || undefined,
        qualification: qualification.trim(), subject, classes,
        status, joinDate: joinDate || undefined,
      });
      reset();
      onClose();
      onCreated(cred);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            A login account is created and the generated credentials are emailed to the teacher automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} className="mt-1 text-xs" required />
            </div>
            <div>
              <Label className="text-xs font-medium text-[#344054]">Contact Number</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 text-xs" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Email Address (auto)</Label>
              <Input type="email" value={slugEmail(name || 'teacher', 'faculty.kinderguide.com')} readOnly className="mt-1 text-xs bg-slate-50" />
            </div>
            <div>
              <Label className="text-xs font-medium text-[#344054]">Personal Email (for credentials)</Label>
              <Input type="email" value={personalEmail} onChange={e => setPersonalEmail(e.target.value)} className="mt-1 text-xs" required />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-[#344054]">Qualification</Label>
            <Input value={qualification} onChange={e => setQualification(e.target.value)} className="mt-1 text-xs" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Employment Status</Label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as EmploymentStatus)}
                className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D] bg-white"
              >
                {(Object.keys(EMPLOYMENT_STATUS_LABELS) as EmploymentStatus[]).map(s => (
                  <option key={s} value={s}>{EMPLOYMENT_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs font-medium text-[#344054]">Join Date <span className="text-[#98A2B3] font-normal">(optional)</span></Label>
              <Input type="date" value={joinDate} onChange={e => setJoinDate(e.target.value)} className="mt-1 text-xs" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-[#344054]">Subject Area</Label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D] bg-white"
            >
              {TEACHER_SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <Label className="text-xs font-medium text-[#344054]">Assigned Classes</Label>
            <div className="mt-1.5 space-y-1.5">
              {MONTESSORI_CLASSES.map(cls => (
                <label key={cls} className="flex items-center gap-2 text-xs text-[#344054] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={classes.includes(cls)}
                    onChange={() => toggleClass(cls)}
                    className="rounded accent-indigo-600"
                  />
                  {cls}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Teacher Account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Edit Teacher Modal ───────────────────────────────────────────────────────
const EditTeacherModal: React.FC<{
  teacher: Teacher | null;
  onClose: () => void;
}> = ({ teacher, onClose }) => {
  const { updateTeacher } = useData();
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [subject, setSubject] = useState('');
  const [classes, setClasses] = useState<string[]>([]);
  const [status, setStatus] = useState<EmploymentStatus>('active');
  const [joinDate, setJoinDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Re-seed the form whenever a different teacher is opened for editing.
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (teacher && seededFor !== teacher.id) {
    setSeededFor(teacher.id);
    setPhone(teacher.phone);
    setQualification(teacher.qualification);
    setSubject(teacher.subject);
    setClasses(teacher.classes);
    setStatus(teacher.status ?? 'active');
    setJoinDate(teacher.joinDate ?? '');
    setError('');
  }
  if (!teacher && seededFor !== null) setSeededFor(null);

  const toggleClass = (cls: string) => {
    setClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    if (classes.length === 0) { setError('Select at least one class.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await updateTeacher(teacher.id, {
        phone: phone.trim(), qualification: qualification.trim(), subject, classes,
        status, joinDate: joinDate || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!teacher} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Teacher — {teacher?.name}</DialogTitle>
          <DialogDescription>
            Update contact details, assignment and HR record. Login credentials are unchanged.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Contact Number</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 text-xs" required />
            </div>
            <div>
              <Label className="text-xs font-medium text-[#344054]">Qualification</Label>
              <Input value={qualification} onChange={e => setQualification(e.target.value)} className="mt-1 text-xs" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Subject Area</Label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D] bg-white"
              >
                {TEACHER_SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-medium text-[#344054]">Employment Status</Label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as EmploymentStatus)}
                className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D] bg-white"
              >
                {(Object.keys(EMPLOYMENT_STATUS_LABELS) as EmploymentStatus[]).map(s => (
                  <option key={s} value={s}>{EMPLOYMENT_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-[#344054]">Join Date</Label>
            <Input type="date" value={joinDate} onChange={e => setJoinDate(e.target.value)} className="mt-1 text-xs" />
          </div>

          <div>
            <Label className="text-xs font-medium text-[#344054]">Assigned Classes</Label>
            <div className="mt-1.5 space-y-1.5">
              {MONTESSORI_CLASSES.map(cls => (
                <label key={cls} className="flex items-center gap-2 text-xs text-[#344054] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={classes.includes(cls)}
                    onChange={() => toggleClass(cls)}
                    className="rounded accent-indigo-600"
                  />
                  {cls}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save Changes'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Add Student Modal ────────────────────────────────────────────────────────
const AddStudentModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onCreated: (creds: IssuedCredentials[]) => void;
}> = ({ open, onClose, onCreated }) => {
  const { createStudentWithParent } = useData();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cls, setCls] = useState<string>(MONTESSORI_CLASSES[1]);
  const [feeAmount, setFeeAmount] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');

  const reset = () => {
    setName(''); setPhone(''); setGuardianName('');
    setGuardianPhone(''); setAddress(''); setCls(MONTESSORI_CLASSES[1]); setFeeAmount('');
    setPersonalEmail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = Number(feeAmount);
    if (!Number.isFinite(fee) || fee <= 0) return;
    try {
      const creds = await createStudentWithParent({
        name: name.trim(),
        email: slugEmail(name, 'kinderguide.com'),
        phone: phone.trim(),
        address: address.trim(),
        guardianName: guardianName.trim(),
        guardianEmail: slugEmail(name, 'parent.kinderguide.com'),
        guardianPhone: guardianPhone.trim() || undefined,
        personalEmail: personalEmail.trim() || undefined,
        class: cls,
        feeAmount: fee,
      });
      reset();
      onClose();
      onCreated(creds);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to enroll student.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enroll New Student</DialogTitle>
          <DialogDescription>
            Login accounts are created for the child and the guardian, and both sets of credentials are emailed automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Child's Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} className="mt-1 text-xs" required />
            </div>
            <div>
              <Label className="text-xs font-medium text-[#344054]">Contact Number</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 text-xs" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Child's Email (auto)</Label>
              <Input type="email" value={slugEmail(name || 'student', 'kinderguide.com')} readOnly className="mt-1 text-xs bg-slate-50" />
            </div>
            <div>
              <Label className="text-xs font-medium text-[#344054]">Personal Email (for credentials)</Label>
              <Input type="email" value={personalEmail} onChange={e => setPersonalEmail(e.target.value)} className="mt-1 text-xs" required />
            </div>
          </div>
          <p className="text-[10px] text-[#667085] mt-1">The login credentials are emailed to the personal email address provided.</p>

          <div>
            <Label className="text-xs font-medium text-[#344054]">Parent / Guardian Name</Label>
            <Input value={guardianName} onChange={e => setGuardianName(e.target.value)} className="mt-1 text-xs" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Guardian Email (auto)</Label>
              <Input type="email" value={slugEmail(name || 'student', 'parent.kinderguide.com')} readOnly className="mt-1 text-xs bg-slate-50" />
            </div>
            <div>
              <Label className="text-xs font-medium text-[#344054]">Guardian Phone <span className="text-[#667085]">(optional)</span></Label>
              <Input value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)} placeholder="defaults to contact above" className="mt-1 text-xs" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-[#344054]">Home Address</Label>
            <Input value={address} onChange={e => setAddress(e.target.value)} className="mt-1 text-xs" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Grade / Class</Label>
              <select
                value={cls}
                onChange={e => setCls(e.target.value)}
                className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D] bg-white"
              >
                {MONTESSORI_CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-medium text-[#344054]">Monthly Fee (PKR)</Label>
              <Input type="number" min="1" value={feeAmount} onChange={e => setFeeAmount(e.target.value)} className="mt-1 text-xs" required />
            </div>
          </div>

          <p className="text-[11px] text-[#667085] flex items-center gap-1.5">
            <AlertCircle size={12} /> Fee details are visible to the admin only.
          </p>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Enroll & Create Accounts</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AdminUsersPage: React.FC = () => {
  const {
    teachers, students, parents, teacherAttendance,
    resetPassword, setFeeDue, sendFeeReminder, findUser,
  } = useData();
  const [activeTab, setActiveTab] = useState<TabId>('teacher');
  const [searchQuery, setSearchQuery] = useState('');
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [issued, setIssued] = useState<IssuedCredentials[] | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const today = todayISO();
  const weekend = isWeekend(today);
  const q = searchQuery.trim().toLowerCase();

  const teacherRecord = (t: Teacher) =>
    teacherAttendance.find(r => r.teacherId === t.id && r.date === today);

  const handleResetPassword = async (userId: string, role: 'teacher' | 'student' | 'parent') => {
    const user = findUser(userId, role);
    try {
      const newPassword = await resetPassword(userId, role);
      if (user && newPassword) {
        setIssued([{ role, name: user.name, email: user.email, password: newPassword }]);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reset password.');
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(q) || t.email.includes(q) || t.subject.toLowerCase().includes(q)
  );
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(q) || s.rollNo.includes(q) || s.guardianName.toLowerCase().includes(q)
  );
  const filteredParents = parents.filter(p =>
    p.name.toLowerCase().includes(q) || p.email.includes(q)
  );

  const statusBadge = (record?: TeacherAttendanceRecord) => {
    if (weekend) return <span className="text-[10px] font-semibold text-[#667085]">Weekend</span>;
    switch (record?.status) {
      case 'present':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
            Present{record.checkInTime ? ` · ${record.checkInTime}` : ''}
          </span>
        );
      case 'leave':
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#344054] font-bold text-[10px]">On Leave</span>;
      case 'absent':
      default:
        return <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold text-[10px]">Absent</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">User Management Directory</h1>
          <p className="text-sm text-[#667085]">Only the admin can create teacher and student accounts</p>
        </div>

        {activeTab === 'teacher' && (
          <Button onClick={() => setAddTeacherOpen(true)} className="gap-2 shadow-sm">
            <Plus size={16} /> Add New Teacher
          </Button>
        )}
        {activeTab === 'student' && (
          <Button onClick={() => setAddStudentOpen(true)} className="gap-2 shadow-sm">
            <Plus size={16} /> Enroll New Student
          </Button>
        )}
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'teacher', label: `Teachers (${teachers.length})`, icon: <GraduationCap size={15} /> },
          { id: 'student', label: `Students (${students.length})`, icon: <BookOpen size={15} /> },
          { id: 'parent', label: `Parents (${parents.length})`, icon: <Heart size={15} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={cn(
              'px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all',
              activeTab === tab.id
                ? 'bg-[#006B5D] text-white shadow-sm'
                : 'text-[#667085] hover:text-[#101828] hover:bg-slate-100'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-[#667085]" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}s by name or email...`}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Teachers Table */}
      {activeTab === 'teacher' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#667085] font-medium border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-5">Teacher</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Assigned Classes</th>
                  <th className="p-3.5">Qualification</th>
                  <th className="p-3.5">HR Status</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Today's Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2.5">
                        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px]', avatarColors(t.name))}>
                          {getInitials(t.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#101828]">{t.name}</p>
                          <p className="text-[10px] text-[#667085] font-mono">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="bg-[#E6F4F1] text-[#006B5D] border-[#B7DDD6] whitespace-nowrap">
                        {t.subject}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-[#344054]">{t.classes.join(', ')}</td>
                    <td className="p-3.5 text-[#344054]">{t.qualification}</td>
                    <td className="p-3.5">
                      <Badge
                        className={cn(
                          'text-[10px] font-semibold whitespace-nowrap',
                          t.status === 'on_leave' && 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50',
                          t.status === 'resigned' && 'bg-slate-100 text-[#667085] border border-slate-200 hover:bg-slate-100',
                          (t.status ?? 'active') === 'active' && 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50',
                        )}
                      >
                        {EMPLOYMENT_STATUS_LABELS[t.status ?? 'active']}
                      </Badge>
                      {t.joinDate && <p className="text-[10px] text-[#98A2B3] mt-0.5">Joined {t.joinDate}</p>}
                    </td>
                    <td className="p-3.5 text-[#344054] font-mono text-[11px]">{t.phone}</td>
                    <td className="p-3.5">{statusBadge(teacherRecord(t))}</td>
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] text-[#667085] hover:text-[#006B5D] gap-1"
                          onClick={() => setEditingTeacher(t)}
                        >
                          <Pencil size={12} /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] text-[#667085] hover:text-[#006B5D] gap-1"
                          onClick={() => handleResetPassword(t.id, 'teacher')}
                        >
                          <KeyRound size={12} /> Reset Password
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Students Table */}
      {activeTab === 'student' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#667085] font-medium border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-5">Student</th>
                  <th className="p-3.5">Roll No</th>
                  <th className="p-3.5">Class</th>
                  <th className="p-3.5">Parent / Guardian</th>
                  <th className="p-3.5">Monthly Fee</th>
                  <th className="p-3.5">Fee Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s: Student) => (
                  <tr key={s.id} className={cn('transition-colors', s.feeDue ? 'bg-red-50/60 hover:bg-red-50' : 'hover:bg-slate-50/70')}>
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2.5">
                        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px]', avatarColors(s.name))}>
                          {getInitials(s.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#101828] flex items-center gap-1.5">
                            {s.name}
                            {s.feeDue && <AlertCircle size={12} className="text-red-500" />}
                          </p>
                          <p className="text-[10px] text-[#667085] font-mono">{s.enrollmentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-[#344054] font-mono">#{s.rollNo}</td>
                    <td className="p-3.5 text-[#344054]">{s.class}</td>
                    <td className="p-3.5 text-[#344054]">{s.guardianName}</td>
                    <td className="p-3.5 text-[#344054] font-mono">Rs {s.feeAmount.toLocaleString()}</td>
                    <td className="p-3.5">
                      {s.feeDue
                        ? <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">Fee Due</span>
                        : <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">Paid Up</span>}
                    </td>
                    <td className="p-3.5 pr-5 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn('h-7 text-[10px] gap-1', s.feeDue ? 'text-emerald-600 hover:text-emerald-700' : 'text-red-500 hover:text-red-600')}
                        onClick={() => setFeeDue(s.id, !s.feeDue)}
                      >
                        {s.feeDue ? 'Mark Paid' : 'Mark Fee Due'}
                      </Button>
                      {s.feeDue && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] text-amber-600 hover:text-amber-700 gap-1"
                          onClick={() => sendFeeReminder(s.id)}
                        >
                          <AlertCircle size={12} /> Remind
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] text-[#667085] hover:text-[#006B5D] gap-1"
                        onClick={() => handleResetPassword(s.id, 'student')}
                      >
                        <KeyRound size={12} /> Reset
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Parents Table */}
      {activeTab === 'parent' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#667085] font-medium border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-5">Parent / Guardian</th>
                  <th className="p-3.5">Contact Phone</th>
                  <th className="p-3.5">Linked Children</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParents.map((p: Parent) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2.5">
                        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px]', avatarColors(p.name))}>
                          {getInitials(p.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#101828]">{p.name}</p>
                          <p className="text-[10px] text-[#667085] font-mono">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-[#344054] font-mono text-[11px]">{p.phone}</td>
                    <td className="p-3.5 text-[#344054]">
                      {p.childrenIds.map(id => students.find(s => s.id === id)?.name).filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] text-[#667085] hover:text-[#006B5D] gap-1"
                        onClick={() => handleResetPassword(p.id, 'parent')}
                      >
                        <KeyRound size={12} /> Reset Password
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-[11px] text-[#667085] border-t border-slate-100">
            Parent accounts are created automatically when a student is enrolled.
          </p>
        </div>
      )}

      {/* Modals */}
      <AddTeacherModal
        open={addTeacherOpen}
        onClose={() => setAddTeacherOpen(false)}
        onCreated={cred => setIssued([cred])}
      />
      <AddStudentModal
        open={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        onCreated={creds => setIssued(creds)}
      />
      <CredentialsDialog issued={issued} onClose={() => setIssued(null)} />
      <EditTeacherModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} />
    </div>
  );
};
