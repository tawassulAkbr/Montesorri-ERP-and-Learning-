import { useCallback, useEffect, useState } from 'react';
import { GraduationCap, CalendarCheck, Video, ClipboardList, MessageSquare, CalendarOff, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TeacherReport {
  teacherId: string;
  name: string;
  subject: string;
  present: number;
  absent: number;
  leave: number;
  avgCheckIn: string | null;
  lessonsUploaded: number;
  testsCreated: number;
  remarksPosted: number;
  leavesApplied: number;
}

type Range = 'daily' | 'weekly' | 'monthly';

export const AdminTeacherReportsPage: React.FC = () => {
  const [range, setRange] = useState<Range>('weekly');
  const [data, setData] = useState<{ from: string; to: string; reports: TeacherReport[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (r: Range) => {
    setLoading(true);
    try {
      const res = await apiGet<{ from: string; to: string; reports: TeacherReport[] }>(`/admin/teacher-reports?range=${r}`);
      setData(res);
    } catch (err) {
      console.error('Failed to load teacher reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
  }, [range, load]);

  const rangeLabel = range === 'daily' ? 'Today' : range === 'weekly' ? 'Last 7 days' : 'Last 30 days';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teacher Performance Reports</h1>
          <p className="text-sm text-slate-500">
            Attendance, check-in times, and teaching activity per teacher — {data ? `${formatDate(data.from)} to ${formatDate(data.to)}` : rangeLabel}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly'] as Range[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all',
                  range === r ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => window.print()}>
            <Download size={14} /> Export
          </Button>
        </div>
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-sm text-slate-400">Loading reports...</CardContent></Card>
      ) : !data || data.reports.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-slate-400">No teacher data available.</CardContent></Card>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-medium border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-5">Teacher</th>
                  <th className="p-3.5 text-center"><CalendarCheck size={13} className="inline mr-1" />Present</th>
                  <th className="p-3.5 text-center">Absent</th>
                  <th className="p-3.5 text-center"><CalendarOff size={13} className="inline mr-1" />Leave</th>
                  <th className="p-3.5 text-center">Avg Check-in</th>
                  <th className="p-3.5 text-center"><Video size={13} className="inline mr-1" />Lessons</th>
                  <th className="p-3.5 text-center"><ClipboardList size={13} className="inline mr-1" />Tests</th>
                  <th className="p-3.5 text-center"><MessageSquare size={13} className="inline mr-1" />Remarks</th>
                  <th className="p-3.5 pr-5 text-center">Leaves Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.reports.map(r => (
                  <tr key={r.teacherId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          <GraduationCap size={14} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{r.name}</p>
                          <p className="text-[10px] text-slate-400">{r.subject}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-bold text-emerald-600">{r.present}</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={cn('font-bold', r.absent > 0 ? 'text-red-600' : 'text-slate-400')}>{r.absent}</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={cn('font-bold', r.leave > 0 ? 'text-amber-600' : 'text-slate-400')}>{r.leave}</span>
                    </td>
                    <td className="p-3.5 text-center font-mono text-slate-600">{r.avgCheckIn ?? '—'}</td>
                    <td className="p-3.5 text-center text-slate-600">{r.lessonsUploaded}</td>
                    <td className="p-3.5 text-center text-slate-600">{r.testsCreated}</td>
                    <td className="p-3.5 text-center text-slate-600">{r.remarksPosted}</td>
                    <td className="p-3.5 pr-5 text-center text-slate-600">{r.leavesApplied}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
