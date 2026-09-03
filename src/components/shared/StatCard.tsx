import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  iconBg?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon, trend, trendLabel, iconBg = 'bg-[#E6F4F1]', className,
}) => {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'card-hover relative overflow-hidden rounded-2xl border border-[#F2F4F7] bg-white p-5 shadow-sm',
        className
      )}
    >
      {/* Subtle bg accent */}
      <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-[#006B5D] opacity-5" />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[#667085]">{title}</p>
          <p className="text-2xl font-extrabold leading-tight text-[#101828]">{value}</p>
          {subtitle && <p className="mt-1 text-xs font-medium text-[#98A2B3]">{subtitle}</p>}

          {trend !== undefined && (
            <div className={cn(
              'inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full',
              trendPositive && 'bg-[#E6F4F1] text-[#006B5D]',
              trendNegative && 'bg-red-50 text-red-600',
              !trendPositive && !trendNegative && 'bg-slate-50 text-[#667085]',
            )}>
              {trendPositive && <TrendingUp size={11} />}
              {trendNegative && <TrendingDown size={11} />}
              {!trendPositive && !trendNegative && <Minus size={11} />}
              <span>{trend > 0 ? '+' : ''}{trend}% {trendLabel || 'vs last month'}</span>
            </div>
          )}
        </div>

        <div className={cn('flex-shrink-0 rounded-xl p-3 text-[#006B5D]', iconBg)}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};
