import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { AttendanceRecord } from '@/types';

interface AttendanceGridProps {
  records: AttendanceRecord[];
  defaultView?: 'daily' | 'weekly' | 'monthly';
  showFilter?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export const AttendanceGrid: React.FC<AttendanceGridProps> = ({
  records, defaultView = 'monthly', showFilter = true,
}) => {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>(defaultView);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const recordMap = useMemo(() => {
    const map: Record<string, AttendanceRecord['status']> = {};
    records.forEach(r => { map[r.date] = r.status; });
    return map;
  }, [records]);

  const getDayStatus = (date: Date) => {
    const key = date.toISOString().split('T')[0];
    return recordMap[key];
  };

  const statusClass = (status: AttendanceRecord['status'] | undefined, isToday: boolean) => {
    if (!status) return isToday ? 'ring-2 ring-indigo-400 bg-slate-50 text-[#667085]' : 'bg-slate-50 text-slate-300';
    switch (status) {
      case 'present': return 'attendance-present';
      case 'absent': return 'attendance-absent';
      case 'leave': return 'attendance-leave';
      case 'holiday': return 'attendance-holiday';
    }
  };

  const statusLabel = (status: AttendanceRecord['status'] | undefined) => {
    if (!status) return 'No record';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Monthly view
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(new Date(currentYear, currentMonth, d));

  // Stats
  const monthDates = Array.from({ length: daysInMonth }, (_, i) =>
    new Date(currentYear, currentMonth, i + 1).toISOString().split('T')[0]
  );
  const presentCount = monthDates.filter(d => recordMap[d] === 'present').length;
  const absentCount = monthDates.filter(d => recordMap[d] === 'absent').length;
  const leaveCount = monthDates.filter(d => recordMap[d] === 'leave').length;
  const totalRecorded = presentCount + absentCount + leaveCount;
  const attendancePct = totalRecorded > 0 ? Math.round((presentCount / totalRecorded) * 100) : 0;

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  return (
    <div className="space-y-4">
      {showFilter && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-all',
                  view === v ? 'bg-white text-[#006B5D] shadow-sm' : 'text-[#667085] hover:text-[#344054]'
                )}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-[#344054]">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
              <ChevronLeft size={14} />
            </Button>
            <span className="font-medium w-32 text-center text-xs">{MONTHS[currentMonth]} {currentYear}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-[#344054]">Present ({presentCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span className="text-[#344054]">Absent ({absentCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-300" />
          <span className="text-[#344054]">Leave ({leaveCount})</span>
        </div>
        <div className="ml-auto font-semibold text-[#006B5D]">{attendancePct}% Attendance</div>
      </div>

      {/* Calendar Grid */}
      <div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-[#667085] py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;
            const todayDate = new Date();
            const isToday = date.toDateString() === todayDate.toDateString();
            const status = getDayStatus(date);
            return (
              <Tooltip key={date.toISOString()}>
                <TooltipTrigger>
                  <div className={cn(
                    'aspect-square flex items-center justify-center text-xs font-medium rounded-lg cursor-default select-none transition-transform hover:scale-110',
                    statusClass(status, isToday)
                  )}>
                    {date.getDate()}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: <strong>{statusLabel(status)}</strong></p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
};
