import { useState } from 'react';
import { Search, Sparkles, AlertCircle, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { isNewEnrollment, formatDate, getInitials, avatarColors, cn } from '@/lib/utils';
import type { Teacher } from '@/types';

export const StudentsPage: React.FC = () => {
  const { students } = useData();
  const { currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  const me = currentUser as Teacher | null;
  const myClasses = me?.classes ?? [];

  const roster = students.filter(s => myClasses.includes(s.class));
  const q = query.trim().toLowerCase();
  const visible = roster.filter(s =>
    (classFilter === 'all' || s.class === classFilter)
    && (s.name.toLowerCase().includes(q) || s.guardianName.toLowerCase().includes(q))
  );

  const newCount = roster.filter(s => isNewEnrollment(s.createdAt)).length;
  const dueCount = roster.filter(s => s.feeDue).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Students</h1>
        <p className="text-sm text-slate-500">
          Review your class rosters, new enrollments, and their parents or guardians
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-100 shadow-sm text-xs font-semibold text-slate-600">
          <Users size={14} className="text-indigo-600" /> {roster.length} students in your classes
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200 text-xs font-semibold text-amber-700">
          <Sparkles size={14} /> {newCount} new enrollment{newCount !== 1 ? 's' : ''} (last 7 days)
        </div>
        {dueCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-xl border border-red-200 text-xs font-semibold text-red-600">
            <AlertCircle size={14} /> {dueCount} with pending fee
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by student or guardian name..."
            className="pl-9 text-xs"
          />
        </div>
        <select
          value={classFilter}
          onChange={e => setClassFilter(e.target.value)}
          className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none shadow-sm cursor-pointer"
        >
          <option value="all">All my classes</option>
          {myClasses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Student list */}
      {visible.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">No students found</p>
            <p className="text-xs text-slate-400 mt-1">Try a different search or class filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-medium border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-5">Student</th>
                  <th className="p-3.5">Class</th>
                  <th className="p-3.5">Parent / Guardian</th>
                  <th className="p-3.5">Enrolled On</th>
                  <th className="p-3.5 pr-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map(s => (
                  <tr key={s.id} className={cn('transition-colors', s.feeDue ? 'bg-red-50/60 hover:bg-red-50' : 'hover:bg-slate-50/70')}>
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2.5">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px]', avatarColors(s.name))}>
                          {getInitials(s.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                            {s.name}
                            {isNewEnrollment(s.createdAt) && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                <Sparkles size={9} /> NEW
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">#{s.rollNo} • {s.enrollmentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600">{s.class}</td>
                    <td className="p-3.5">
                      <p className="font-medium text-slate-700">{s.guardianName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{s.phone}</p>
                    </td>
                    <td className="p-3.5 text-slate-600">{formatDate(s.createdAt)}</td>
                    <td className="p-3.5 pr-5 text-right">
                      {s.feeDue
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]"><AlertCircle size={10} /> Fee Due</span>
                        : <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">Clear</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-[11px] text-slate-400 border-t border-slate-100">
            Fee amounts are confidential and visible to the admin only.
          </p>
        </div>
      )}
    </div>
  );
};
