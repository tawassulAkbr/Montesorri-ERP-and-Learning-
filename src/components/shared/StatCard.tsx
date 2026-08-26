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
  title, value, subtitle, icon, trend, trendLabel, iconBg = 'bg-indigo-50', className,
}) => {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'bg-white rounded-xl border border-slate-100 p-5 shadow-sm card-hover relative overflow-hidden',
        className
      )}
    >
      {/* Subtle bg accent */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 rounded-full -mt-6 -mr-6 bg-indigo-600" />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}

          {trend !== undefined && (
            <div className={cn(
              'inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full',
              trendPositive && 'bg-emerald-50 text-emerald-600',
              trendNegative && 'bg-red-50 text-red-600',
              !trendPositive && !trendNegative && 'bg-slate-50 text-slate-500',
            )}>
              {trendPositive && <TrendingUp size={11} />}
              {trendNegative && <TrendingDown size={11} />}
              {!trendPositive && !trendNegative && <Minus size={11} />}
              <span>{trend > 0 ? '+' : ''}{trend}% {trendLabel || 'vs last month'}</span>
            </div>
          )}
        </div>

        <div className={cn('p-3 rounded-xl flex-shrink-0', iconBg)}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};
