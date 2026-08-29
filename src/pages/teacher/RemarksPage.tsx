import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, CheckCircle2, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import type { Remark, RemarkType, Student } from '@/types';

export const RemarksPage: React.FC = () => {
  const { students, teachers, remarks, addRemark } = useData();
  const { currentUser } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student>(students[0]);
  const [remarkType, setRemarkType] = useState<RemarkType>('positive');
  const [content, setContent] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const me = teachers.find(t => t.id === currentUser?.id);

  const handleSendRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || content === '<p><br></p>') return;

    addRemark({
      teacherId: currentUser?.id ?? '',
      teacherName: currentUser?.name ?? '',
      teacherSubject: me?.subject ?? '',
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      parentId: selectedStudent.parentId,
      content,
      type: remarkType,
    });

    setContent('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  const studentRemarks = remarks.filter(r => r.studentId === selectedStudent.id);

  const typeConfig: Record<RemarkType, { label: string; cls: string }> = {
    positive: { label: 'Praise & Milestone Progress', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    constructive: { label: 'Developmental Guidance', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    concern: { label: 'Parent Collaboration Needed', cls: 'bg-red-50 text-red-700 border-red-200' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Montessori Child Observations & Remarks</h1>
        <p className="text-sm text-slate-500">Provide direct feedback, behavioural observations, or home guidance notes to parents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Students Selector */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Select Student</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[550px] overflow-y-auto divide-y divide-slate-100 p-0 px-4">
            {students.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`w-full py-3 px-2 flex items-center justify-between text-left rounded-lg transition-colors ${
                  selectedStudent.id === student.id
                    ? 'bg-indigo-50/80 text-indigo-700'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold">{student.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Roll #{student.rollNo} • {student.class}</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                  {remarks.filter(r => r.studentId === student.id).length} notes
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Right: Compose & History */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="text-indigo-600" size={16} />
                  Write Observation for {selectedStudent.name}'s Parents
                </CardTitle>
                <div className="flex gap-1.5">
                  {(['positive', 'constructive', 'concern'] as RemarkType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setRemarkType(t)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                        remarkType === t
                          ? typeConfig[t].cls + ' ring-2 ring-indigo-500'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {typeConfig[t].label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sentSuccess && (
                <div className="mb-4 p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} /> Observation remark published & synced to {selectedStudent.name}'s parent portal!
                </div>
              )}

              <form onSubmit={handleSendRemark} className="space-y-4">
                <div>
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write detailed observations on fine motor, phonetic progress, or work mat habits..."
                    minHeight={140}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="gap-1.5 shadow-sm">
                    <Send size={14} /> Send Observation to Parents
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Past Remarks Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Observation History for {selectedStudent.name} ({studentRemarks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentRemarks.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No remarks sent for this student yet.</p>
              ) : (
                studentRemarks.map(rem => (
                  <div
                    key={rem.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{rem.teacherName}</span>
                        <span className="text-[10px] text-slate-400">({rem.teacherSubject})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeConfig[rem.type].cls}`}>
                          {typeConfig[rem.type].label}
                        </span>
                        <span className="text-[10px] text-slate-400">{formatDate(rem.createdAt)}</span>
                      </div>
                    </div>

                    <div
                      className="text-xs text-slate-600 prose-sm"
                      dangerouslySetInnerHTML={{ __html: rem.content }}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
