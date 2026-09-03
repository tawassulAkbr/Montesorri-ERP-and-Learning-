import { useEffect, useState } from 'react';
import { Clock, AlertTriangle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  dueAt: string; // ISO datetime
  className?: string;
}

function diffParts(target: number, now: number) {
  const ms = Math.max(0, target - now);
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return { ms, days, hours, minutes };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ dueAt, className }) => {
  const target = new Date(dueAt).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const { ms, days, hours, minutes } = diffParts(target, now);

  if (ms <= 0) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-[11px] font-bold text-[#667085] bg-slate-100 px-2 py-0.5 rounded-full', className)}>
        <Lock size={11} /> Closed
      </span>
    );
  }

  const label = days > 0
    ? `${days}d ${hours}h left`
    : hours > 0
      ? `${hours}h ${minutes}m left`
      : `${minutes}m left`;

  const urgent = ms < 60 * 60 * 1000;
  const warning = !urgent && ms < 24 * 60 * 60 * 1000;

  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
      urgent ? 'text-red-700 bg-red-50' : warning ? 'text-amber-700 bg-amber-50' : 'text-[#006B5D] bg-[#E6F4F1]',
      className
    )}>
      {urgent ? <AlertTriangle size={11} /> : <Clock size={11} />}
      {label}
    </span>
  );
};
