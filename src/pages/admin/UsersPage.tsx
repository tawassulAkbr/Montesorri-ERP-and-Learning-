import { useState } from 'react';
import {
  Plus, Search, KeyRound, Copy, Check, GraduationCap, Heart, BookOpen, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useData } from '@/context/DataContext';
import { MONTESSORI_CLASSES, TEACHER_SUBJECTS, todayISO, isWeekend, getInitials, avatarColors, cn } from '@/lib/utils';
import type { IssuedCredentials, Student, Teacher, Parent, TeacherAttendanceRecord } from '@/types';

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
            <KeyRound size={16} className="text-indigo-600" />
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
                <span className="text-xs font-semibold text-slate-700">{cred.name}</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Email</span>
                  <span className="flex items-center gap-1.5 font-mono font-medium text-slate-800">
                    {cred.email}
                    <button
                      onClick={() => copy(cred.email, `email-${i}`)}
                      className="text-slate-400 hover:text-indigo-600"
                    >
                      {copied === `email-${i}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Password</span>
                  <span className="flex items-center gap-1.5 font-mono font-bold text-indigo-700">
                    {cred.password}
                    <button
                      onClick={() => copy(cred.password, `pw-${i}`)}
                      className="text-slate-400 hover:text-indigo-600"
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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [subject, setSubject] = useState<string>(TEACHER_SUBJECTS[0]);
  const [classes, setClasses] = useState<string[]>([MONTESSORI_CLASSES[1]]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleClass = (cls: string) => {
    setClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]);
  };

  const reset = () => {
    setName(''); setEmail(''); setPhone(''); setQualification('');
    setSubject(TEACHER_SUBJECTS[0]); setClasses([MONTESSORI_CLASSES[1]]); setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = email.trim().toLowerCase();
    if (classes.length === 0) {
      setError('Select at least one class.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const cred = await createTeacher({
        name: name.trim(), email: emailLower, phone: phone.trim(),
        qualification: qualification.trim(), subject, classes,
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
            A login account with a generated password will be created automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-slate-600">Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ayesha Khan" className="mt-1 text-xs" required />
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-600">Contact Number</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92 300 0000000" className="mt-1 text-xs" required />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-600">Email Address (login)</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="teacher@kinderguide.edu" className="mt-1 text-xs" required />
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-600">Qualification</Label>
            <Input value={qualification} onChange={e => setQualification(e.target.value)} placeholder="e.g. AMI Montessori Diploma" className="mt-1 text-xs" required />
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-600">Subject Area</Label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {TEACHER_SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-600">Assigned Classes</Label>
            <div className="mt-1.5 space-y-1.5">
              {MONTESSORI_CLASSES.map(cls => (
                <label key={cls} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
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
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cls, setCls] = useState<string>(MONTESSORI_CLASSES[1]);
  const [feeAmount, setFeeAmount] = useState('');

  const reset = () => {
    setName(''); setPhone(''); setGuardianName(''); setGuardianEmail('');
    setGuardianPhone(''); setAddress(''); setCls(MONTESSORI_CLASSES[1]); setFeeAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = Number(feeAmount);
    if (!Number.isFinite(fee) || fee <= 0) return;
    try {
      const creds = await createStudentWithParent({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        guardianName: guardianName.trim(),
        guardianEmail: guardianEmail.trim() || undefined,
        guardianPhone: guardianPhone.trim() || undefined,
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
            Login accounts are created for both the child and the parent/guardian.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-slate-600">Child's Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Noor Fatima" className="mt-1 text-xs" required />
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-600">Contact Number</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92 310 0000000" className="mt-1 text-xs" required />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-600">Parent / Guardian Name</Label>
            <Input value={guardianName} onChange={e => setGuardianName(e.target.value)} placeholder="e.g. Mr. Ahmed Raza" className="mt-1 text-xs" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-slate-600">Guardian Email <span className="text-slate-400">(optional)</span></Label>
              <Input type="email" value={guardianEmail} onChange={e => setGuardianEmail(e.target.value)} placeholder="auto-generated if blank" className="mt-1 text-xs" />
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-600">Guardian Phone <span className="text-slate-400">(optional)</span></Label>
              <Input value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)} placeholder="defaults to contact above" className="mt-1 text-xs" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-600">Home Address</Label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="House, street, city" className="mt-1 text-xs" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-slate-600">Grade / Class</Label>
              <select
                value={cls}
                onChange={e => setCls(e.target.value)}
                className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {MONTESSORI_CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-600">Monthly Fee (PKR)</Label>
              <Input type="number" min="1" value={feeAmount} onChange={e => setFeeAmount(e.target.value)} placeholder="e.g. 12000" className="mt-1 text-xs" required />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
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
    if (weekend) return <span className="text-[10px] font-semibold text-slate-400">Weekend</span>;
    switch (record?.status) {
      case 'present':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
            Present{record.checkInTime ? ` · ${record.checkInTime}` : ''}
          </span>
        );
      case 'leave':
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">On Leave</span>;
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
          <h1 className="text-2xl font-bold text-slate-800">User Management Directory</h1>
          <p className="text-sm text-slate-500">Only the admin can create teacher and student accounts</p>
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
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
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
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
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
              <thead className="bg-slate-50 text-slate-400 font-medium border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-5">Teacher</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Assigned Classes</th>
                  <th className="p-3.5">Qualification</th>
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
                          <p className="font-semibold text-slate-800">{t.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 whitespace-nowrap">
                        {t.subject}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-slate-600">{t.classes.join(', ')}</td>
                    <td className="p-3.5 text-slate-600">{t.qualification}</td>
                    <td className="p-3.5 text-slate-600 font-mono text-[11px]">{t.phone}</td>
                    <td className="p-3.5">{statusBadge(teacherRecord(t))}</td>
                    <td className="p-3.5 pr-5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] text-slate-500 hover:text-indigo-600 gap-1"
                        onClick={() => handleResetPassword(t.id, 'teacher')}
                      >
                        <KeyRound size={12} /> Reset Password
                      </Button>
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
              <thead className="bg-slate-50 text-slate-400 font-medium border-b border-slate-100">
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
                          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                            {s.name}
                            {s.feeDue && <AlertCircle size={12} className="text-red-500" />}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{s.enrollmentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-700 font-mono">#{s.rollNo}</td>
                    <td className="p-3.5 text-slate-600">{s.class}</td>
                    <td className="p-3.5 text-slate-600">{s.guardianName}</td>
                    <td className="p-3.5 text-slate-700 font-mono">Rs {s.feeAmount.toLocaleString()}</td>
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
                        className="h-7 text-[10px] text-slate-500 hover:text-indigo-600 gap-1"
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
              <thead className="bg-slate-50 text-slate-400 font-medium border-b border-slate-100">
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
                          <p className="font-semibold text-slate-800">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono text-[11px]">{p.phone}</td>
                    <td className="p-3.5 text-slate-600">
                      {p.childrenIds.map(id => students.find(s => s.id === id)?.name).filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] text-slate-500 hover:text-indigo-600 gap-1"
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
          <p className="px-5 py-3 text-[11px] text-slate-400 border-t border-slate-100">
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
    </div>
  );
};
