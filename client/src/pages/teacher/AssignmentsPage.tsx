import { useState } from 'react';
import { ClipboardList, Plus, Trash2, Paperclip, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CountdownTimer } from '@/components/shared/CountdownTimer';
import { useData } from '@/context/DataContext';
import { MONTESSORI_CLASSES, TEACHER_SUBJECTS, formatDateTime } from '@/lib/utils';

export const TeacherAssignmentsPage: React.FC = () => {
  const { assignments, submissions, addAssignment, deleteAssignment, gradeSubmission } = useData();

  const [openCreate, setOpenCreate] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  // create form state
  const [title, setTitle] = useState('');
  const [cls, setCls] = useState<string>(MONTESSORI_CLASSES[1]);
  const [subject, setSubject] = useState<string>(TEACHER_SUBJECTS[0]);
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !instructions) return;
    setSaving(true);
    setError('');
    try {
      await addAssignment({
        title,
        class: cls,
        subject,
        instructions,
        dueAt: new Date(`${dueDate}T${dueTime}`).toISOString(),
      });
      setTitle(''); setInstructions(''); setDueDate(''); setDueTime('23:59');
      setOpenCreate(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment.');
    } finally {
      setSaving(false);
    }
  };

  const handleGrade = async (submissionId: string) => {
    const g = Number(grades[submissionId]);
    if (!Number.isFinite(g) || g < 0 || g > 100) return;
    await gradeSubmission(submissionId, g, feedbacks[submissionId] || undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Assignments & Tasks</h1>
          <p className="text-sm text-[#667085]">Set deadlines, track submissions, and grade student work</p>
        </div>
        <Button onClick={() => setOpenCreate(true)} className="gap-2 shadow-sm">
          <Plus size={16} /> New Assignment
        </Button>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-semibold text-[#344054]">No assignments yet</p>
            <p className="text-xs text-[#667085] mt-1">Create your first assignment with a deadline for your class.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map(a => {
            const subs = submissions.filter(s => s.assignmentId === a.id);
            const isOpen = expanded === a.id;
            return (
              <Card key={a.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] text-[#006B5D] flex items-center justify-center flex-shrink-0">
                        <ClipboardList size={18} />
                      </div>
                      <div>
                        <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                          {a.title}
                          <CountdownTimer dueAt={a.dueAt} />
                        </CardTitle>
                        <p className="text-[11px] text-[#667085] mt-0.5">
                          {a.class} · {a.subject} · Due {formatDateTime(a.dueAt)} · {subs.length} submission{subs.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setExpanded(isOpen ? null : a.id)}>
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Submissions
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-[#667085] hover:text-red-600" onClick={() => deleteAssignment(a.id)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-xs text-[#344054] bg-slate-50 rounded-lg p-3 border border-slate-100">{a.instructions}</p>

                  {isOpen && (
                    <div className="mt-4 border border-slate-100 rounded-xl overflow-hidden">
                      {subs.length === 0 ? (
                        <p className="text-xs text-[#667085] text-center py-6">No submissions yet.</p>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-[#667085]">
                            <tr>
                              <th className="p-2.5 pl-4">Student</th>
                              <th className="p-2.5">Submitted</th>
                              <th className="p-2.5">Work</th>
                              <th className="p-2.5">Grade (/100)</th>
                              <th className="p-2.5 pr-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {subs.map(s => (
                              <tr key={s.id} className="hover:bg-slate-50">
                                <td className="p-2.5 pl-4 font-medium text-[#101828]">
                                  {s.studentName}
                                  {s.isLate && <span className="ml-1.5 text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">LATE</span>}
                                </td>
                                <td className="p-2.5 text-[#667085]">{formatDateTime(s.submittedAt)}</td>
                                <td className="p-2.5">
                                  {s.fileName ? (
                                    <a href={`/uploads/${s.filePath}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#006B5D] hover:underline">
                                      <Paperclip size={12} /> {s.fileName}
                                    </a>
                                  ) : s.text ? (
                                    <span className="text-[#344054] line-clamp-1 max-w-[180px]">{s.text}</span>
                                  ) : (
                                    <span className="text-[#667085]">—</span>
                                  )}
                                </td>
                                <td className="p-2.5">
                                  {s.grade !== undefined && s.grade !== null ? (
                                    <span className="font-bold text-emerald-700">{s.grade}</span>
                                  ) : (
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={grades[s.id] ?? ''}
                                      onChange={e => setGrades(prev => ({ ...prev, [s.id]: e.target.value }))}
                                      className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[#006B5D]"
                                    />
                                  )}
                                </td>
                                <td className="p-2.5 pr-4 text-right">
                                  {s.grade === undefined || s.grade === null ? (
                                    <Button size="sm" variant="outline" className="text-[10px] h-6 gap-1" onClick={() => handleGrade(s.id)}>
                                      <CheckCircle2 size={12} /> Grade
                                    </Button>
                                  ) : (
                                    <span className="text-[10px] text-[#667085]">Graded</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Assignment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sandpaper Letters Practice Sheet" className="mt-1 text-xs" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-[#344054]">Class</Label>
                <select value={cls} onChange={e => setCls(e.target.value)} className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D] bg-white">
                  {MONTESSORI_CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs font-medium text-[#344054]">Subject</Label>
                <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D] bg-white">
                  {TEACHER_SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-[#344054]">Due Date</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 text-xs" required />
              </div>
              <div>
                <Label className="text-xs font-medium text-[#344054]">Due Time</Label>
                <Input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="mt-1 text-xs" required />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-[#344054]">Instructions</Label>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                rows={3}
                placeholder="Describe the task, materials, and what students should submit..."
                className="w-full mt-1 text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#006B5D] resize-none"
                required
              />
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpenCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Assignment'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
