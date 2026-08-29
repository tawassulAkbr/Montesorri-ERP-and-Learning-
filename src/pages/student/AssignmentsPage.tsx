import { useState } from 'react';
import { ClipboardList, Paperclip, Upload, CheckCircle2, XCircle, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/shared/CountdownTimer';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { uploadFile } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

export const StudentAssignmentsPage: React.FC = () => {
  const { assignments, submissions, submitAssignment } = useData();
  const { currentUser } = useAuth();

  const [texts, setTexts] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<Record<string, string>>({});

  const mySubmission = (assignmentId: string) =>
    submissions.find(s => s.assignmentId === assignmentId && s.studentId === currentUser?.id);

  const handleSubmit = async (assignmentId: string) => {
    const text = (texts[assignmentId] || '').trim();
    const file = files[assignmentId];
    if (!text && !file) {
      setError(prev => ({ ...prev, [assignmentId]: 'Write something or attach a file before submitting.' }));
      return;
    }
    setSubmitting(assignmentId);
    setError(prev => ({ ...prev, [assignmentId]: '' }));
    try {
      let uploaded: { fileName: string; filePath: string } | undefined;
      if (file) {
        uploaded = await uploadFile(file);
      }
      await submitAssignment(assignmentId, {
        text: text || undefined,
        fileName: uploaded?.fileName,
        filePath: uploaded?.filePath,
      });
      setTexts(prev => ({ ...prev, [assignmentId]: '' }));
      setFiles(prev => ({ ...prev, [assignmentId]: undefined }));
    } catch (err) {
      setError(prev => ({ ...prev, [assignmentId]: err instanceof Error ? err.message : 'Submission failed.' }));
    } finally {
      setSubmitting(null);
    }
  };

  const isClosed = (dueAt: string) => new Date(dueAt).getTime() <= Date.now();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Assignments & Tasks</h1>
        <p className="text-sm text-slate-500">Submit your work before the deadline — your submission time is shared with your teacher</p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">No assignments yet</p>
            <p className="text-xs text-slate-400 mt-1">When your teacher posts an assignment, it appears here with a countdown.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map(a => {
            const sub = mySubmission(a.id);
            const closed = isClosed(a.dueAt);
            return (
              <Card key={a.id} className={sub ? 'border-emerald-200' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                      <ClipboardList size={18} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                        {a.title}
                        <CountdownTimer dueAt={a.dueAt} />
                        {sub?.isLate && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">SUBMITTED LATE</span>}
                      </CardTitle>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {a.subject} · By {a.teacherName} · Due {formatDateTime(a.dueAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">{a.instructions}</p>

                  {sub ? (
                    <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 size={15} /> Submitted {formatDateTime(sub.submittedAt)}
                      </div>
                      {sub.fileName && (
                        <a href={`/uploads/${sub.filePath}`} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                          <Paperclip size={12} /> {sub.fileName}
                        </a>
                      )}
                      {sub.text && <p className="mt-1.5 text-xs text-slate-600">{sub.text}</p>}
                      {sub.grade !== undefined && sub.grade !== null ? (
                        <p className="mt-2 text-xs font-bold text-emerald-700">Grade: {sub.grade}/100 {sub.feedback ? `— ${sub.feedback}` : ''}</p>
                      ) : (
                        <p className="mt-2 text-[11px] text-slate-400">Waiting for your teacher to grade this.</p>
                      )}
                    </div>
                  ) : closed ? (
                    <div className="p-3 rounded-xl border border-red-200 bg-red-50/50 flex items-center gap-2 text-xs font-semibold text-red-600">
                      <XCircle size={15} /> Deadline passed — submissions are closed.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <textarea
                        value={texts[a.id] || ''}
                        onChange={e => setTexts(prev => ({ ...prev, [a.id]: e.target.value }))}
                        rows={3}
                        placeholder="Write your answer, or describe your completed work..."
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <label className="inline-flex items-center gap-1.5 text-xs text-indigo-600 cursor-pointer border border-dashed border-indigo-300 rounded-lg px-3 py-1.5 hover:bg-indigo-50">
                          <Upload size={13} />
                          {files[a.id] ? files[a.id]!.name : 'Attach a file (photo, PDF, doc)'}
                          <input
                            type="file"
                            className="hidden"
                            onChange={e => setFiles(prev => ({ ...prev, [a.id]: e.target.files?.[0] }))}
                          />
                        </label>
                        <Button size="sm" className="gap-1.5 text-xs" disabled={submitting === a.id} onClick={() => handleSubmit(a.id)}>
                          <Send size={13} /> {submitting === a.id ? 'Submitting...' : 'Submit Work'}
                        </Button>
                      </div>
                      {error[a.id] && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error[a.id]}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
