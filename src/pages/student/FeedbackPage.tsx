import { useState } from 'react';
import { MessageSquareHeart, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import type { Teacher } from '@/types';

export const StudentFeedbackPage: React.FC = () => {
  const { teachers, students, feedbacks, addFeedback } = useData();
  const { currentUser } = useAuth();
  const me = students.find(s => s.id === currentUser?.id);

  const myTeachers = teachers.filter(t => me && t.classes.includes(me.class));
  const [teacherId, setTeacherId] = useState<string>('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || content.trim().length < 3) return;
    setSending(true);
    setError('');
    try {
      await addFeedback(teacherId, content.trim());
      setContent('');
      setTeacherId('');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send feedback.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#101828]">Share Feedback with Your Teacher</h1>
        <p className="text-sm text-[#667085] flex items-center gap-1.5">
          <ShieldCheck size={15} className="text-emerald-600" />
          Your name is hidden from your teacher — feedback is anonymous.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquareHeart className="text-[#006B5D]" size={18} />
              Write Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#344054] mb-1 block">Choose a teacher</label>
                <select
                  value={teacherId}
                  onChange={e => setTeacherId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D] bg-white"
                  required
                >
                  <option value="" disabled>Select a teacher...</option>
                  {myTeachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[#344054] mb-1 block">Your message</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={5}
                  placeholder="Tell your teacher what's going well, what's hard, or what you'd like to change..."
                  className="w-full text-xs border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#006B5D] resize-none"
                  required
                />
              </div>

              {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              {sent && (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-2">
                  <CheckCircle2 size={15} /> Feedback sent anonymously!
                </div>
              )}

              <Button type="submit" disabled={sending || !teacherId || content.trim().length < 3} className="gap-2 w-full">
                <Send size={15} /> {sending ? 'Sending...' : 'Send Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Past Feedback ({feedbacks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedbacks.length === 0 ? (
              <p className="text-xs text-[#667085] py-6 text-center">You haven't sent any feedback yet.</p>
            ) : (
              feedbacks.map(fb => (
                <div key={fb.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#344054]">To: {fb.teacherName}</span>
                    <span className="text-[10px] text-[#667085]">{formatDate(fb.createdAt)}</span>
                  </div>
                  <p className="text-xs text-[#344054]">{fb.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
