import { useCallback, useEffect, useState } from 'react';
import { Flame, Trophy, Star, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiGet } from '@/lib/api';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { cn, formatDate } from '@/lib/utils';
import type { StudentStreakSummary } from '@/types';

export const TeacherStreaksPage: React.FC = () => {
  const { teachers } = useData();
  const { currentUser } = useAuth();
  const me = teachers.find(t => t.id === currentUser?.id);
  const myClasses = me?.classes ?? [];

  const [rows, setRows] = useState<StudentStreakSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ students: StudentStreakSummary[] }>('/teachers/streaks');
      setRows(res.students);
    } catch (err) {
      console.error('Failed to load streaks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = rows.filter(r => classFilter === 'all' || r.class === classFilter);
  const active = filtered.filter(r => r.currentStreak > 0).length;
  const atRisk = filtered.filter(r => r.atRisk).length;
  const topStreak = filtered.reduce((m, r) => Math.max(m, r.currentStreak), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Learning Streak Progress</h1>
          <p className="text-sm text-[#667085]">Track your students' daily micro-learning streaks and badges</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-[#344054] outline-none shadow-sm cursor-pointer"
          >
            <option value="all">All my classes</option>
            {myClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5 text-xs">
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Flame className="text-orange-500" size={20} />
          </div>
          <div>
            <p className="text-xl font-bold text-[#101828]">{active}</p>
            <p className="text-xs text-[#667085]">students on a streak</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="text-red-500" size={20} />
          </div>
          <div>
            <p className="text-xl font-bold text-[#101828]">{atRisk}</p>
            <p className="text-xs text-[#667085]">streaks at risk today</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Trophy className="text-amber-500" size={20} />
          </div>
          <div>
            <p className="text-xl font-bold text-[#101828]">{topStreak}</p>
            <p className="text-xs text-[#667085]">longest active streak</p>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Card><CardContent className="py-12 text-center text-sm text-[#667085]">Loading streak data...</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-[#667085]">No students found. They'll appear once they start learning.</CardContent></Card>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#667085] font-medium border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-5">Student</th>
                  <th className="p-3.5">Class</th>
                  <th className="p-3.5 text-center">Streak</th>
                  <th className="p-3.5 text-center">Best</th>
                  <th className="p-3.5 text-center">XP</th>
                  <th className="p-3.5 text-center">Level</th>
                  <th className="p-3.5 text-center">Badges</th>
                  <th className="p-3.5">Last Activity</th>
                  <th className="p-3.5 pr-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(r => (
                  <tr key={r.studentId} className={cn('transition-colors', r.atRisk ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50/70')}>
                    <td className="p-3.5 pl-5 font-semibold text-[#101828]">{r.name}</td>
                    <td className="p-3.5 text-[#667085]">{r.class.replace('Montessori ', '').replace(' (', ' · ').replace(')', '')}</td>
                    <td className="p-3.5 text-center">
                      <span className={cn('inline-flex items-center gap-1 font-bold', r.currentStreak > 0 ? 'text-orange-600' : 'text-slate-300')}>
                        <Flame size={13} /> {r.currentStreak}
                      </span>
                    </td>
                    <td className="p-3.5 text-center text-[#344054] font-semibold">{r.longestStreak}</td>
                    <td className="p-3.5 text-center text-[#006B5D] font-semibold">{r.totalXp}</td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold"><Star size={12} /> Lv {r.level}</span>
                    </td>
                    <td className="p-3.5 text-center text-[#344054] font-semibold">{r.badgeCount}</td>
                    <td className="p-3.5 text-[#667085]">{r.lastActivityDate ? formatDate(r.lastActivityDate) : '—'}</td>
                    <td className="p-3.5 pr-5 text-right">
                      {r.atRisk ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                          <AlertTriangle size={10} /> At risk
                        </span>
                      ) : r.currentStreak > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-bold text-[10px]">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#667085] font-bold text-[10px]">Not started</span>
                      )}
                    </td>
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
