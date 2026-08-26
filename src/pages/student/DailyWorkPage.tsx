import { useState } from 'react';
import { BookOpen, Paperclip, Calendar, CheckSquare, Search, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { formatDateTime } from '@/lib/utils';

export const StudentDailyWorkPage: React.FC = () => {
  const { dailyWork, toggleDailyWorkDone } = useData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Montessori Daily Work & Activity Feed</h1>
        <p className="text-sm text-slate-500">Track classroom activities, sensorial mat tasks, and fun homework exercises</p>
      </div>

      <div className="space-y-4">
        {dailyWork.map(work => {
          const isDone = (work.completedByStudentIds || []).includes('s1');
          return (
            <Card key={work.id} className={`overflow-hidden border transition-all ${isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-100 shadow-sm'}`}>
              <CardHeader className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {work.teacherSubject.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800">{work.teacherSubject}</h3>
                      <Badge variant="outline" className="text-[10px] bg-white border-slate-200">
                        {work.class}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">Assigned by {work.teacherName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    {formatDateTime(work.postedAt)}
                  </span>
                  <button
                    onClick={() => toggleDailyWorkDone(work.id, 's1')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckSquare size={13} /> {isDone ? 'Completed 🌟' : 'Mark Done'}
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-3">
                <div
                  className="text-xs text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: work.content }}
                />

                {work.attachmentName && (
                  <div className="flex items-center gap-2 pt-2 text-xs text-indigo-600 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100 w-fit">
                    <Paperclip size={14} />
                    <span className="font-semibold">{work.attachmentName}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
