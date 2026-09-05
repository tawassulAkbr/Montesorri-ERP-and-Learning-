import { useState } from 'react';
import { ClipboardList, Award, CheckCircle2, Calendar, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, getGradeColor } from '@/lib/utils';

export const StudentTestsPage: React.FC = () => {
  const { tests, testResults, students } = useData();
  const { currentUser } = useAuth();
  const me = students.find(s => s.id === currentUser?.id);
  const [tab, setTab] = useState<'upcoming' | 'results'>('upcoming');

  const upcomingTests = tests.filter(t => t.status === 'upcoming' && (!me || t.class === me.class));
  const myResults = testResults.filter(r => r.studentId === currentUser?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#101828]">Tests & Evaluations</h1>
        <p className="text-sm text-[#667085]">Track your exam schedules, check grading results, and view teacher feedback</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            tab === 'upcoming'
              ? 'bg-[#006B5D] text-white shadow-sm'
              : 'text-[#667085] hover:text-[#101828] hover:bg-slate-100'
          }`}
        >
          Upcoming Tests ({upcomingTests.length})
        </button>
        <button
          onClick={() => setTab('results')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            tab === 'results'
              ? 'bg-[#006B5D] text-white shadow-sm'
              : 'text-[#667085] hover:text-[#101828] hover:bg-slate-100'
          }`}
        >
          Evaluated Results ({myResults.length})
        </button>
      </div>

      {tab === 'upcoming' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingTests.map(test => (
            <Card key={test.id} className="p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className="bg-[#E6F4F1] text-[#006B5D] border-[#B7DDD6]">
                    {test.subject}
                  </Badge>
                  <span className="text-xs font-bold text-[#006B5D] flex items-center gap-1">
                    <Calendar size={13} /> {formatDate(test.date)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#101828] mb-1">{test.title}</h3>
                <p className="text-xs text-[#667085] mb-3">{test.instructions || 'Review syllabus chapters thoroughly.'}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#667085]">
                <span>Class: {test.class}</span>
                <span className="font-semibold text-[#344054]">Max Score: {test.maxMarks} pts</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'results' && (
        <div className="space-y-4">
          {myResults.map(res => {
            const percentage = Math.round((res.marksObtained / res.maxMarks) * 100);
            return (
              <Card key={res.id} className="p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-[10px]">{res.subject}</Badge>
                    <span className="text-xs text-[#667085]">{formatDate(res.date)}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#101828]">{res.testTitle}</h3>
                  {res.teacherComment && (
                    <p className="text-xs text-[#667085] italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      "{res.teacherComment}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#101828]">{res.marksObtained} / {res.maxMarks}</span>
                    <span className="text-xs text-[#667085] block">{percentage}% Score</span>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${getGradeColor(res.grade)}`}>
                    {res.grade}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
