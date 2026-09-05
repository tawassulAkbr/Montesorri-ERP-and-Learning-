npx prisma db pushimport { useEffect, useState } from 'react';
import { Sparkles, Info, AlertTriangle, AlertOctagon, RefreshCw, WifiOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AiChart } from './AiChart';
import { fetchInsights, clearInsightsCache, loadCachedInsights } from '@/lib/ai';
import type { AiInsight } from '@/lib/ai';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/context/DataContext';

const severityIcon = (sev: AiInsight['severity']) => {
  if (sev === 'critical') return <AlertOctagon size={16} className="text-red-500" />;
  if (sev === 'warning') return <AlertTriangle size={16} className="text-amber-500" />;
  return <Info size={16} className="text-[#006B5D]" />;
};

const severityBorder = (sev: AiInsight['severity']) =>
  sev === 'critical' ? 'border-l-red-400' : sev === 'warning' ? 'border-l-amber-400' : 'border-l-sky-400';

// Proactive AI findings shown on each role's dashboard. When offline it falls
// back to the last snapshot captured while online (read-only, offline-first).
export const AiInsightsSection: React.FC = () => {
  const { currentUser } = useAuth();
  const { aiEnabled, offlineMode } = useData();
  const [insights, setInsights] = useState<AiInsight[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const userId = currentUser?.id ?? 'anon';

  useEffect(() => {
    if (!aiEnabled) return;
    if (offlineMode) {
      // Serve the last-known snapshot when connectivity is unavailable.
      setInsights(loadCachedInsights(userId));
      setError(false);
      return;
    }
    let cancelled = false;
    setInsights(null);
    setError(false);
    fetchInsights(userId)
      .then(list => { if (!cancelled) setInsights(list); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [aiEnabled, offlineMode, userId, refreshKey]);

  if (!aiEnabled) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="gradient-primary w-7 h-7 rounded-lg flex items-center justify-center text-white">
            <Sparkles size={14} />
          </span>
          <h2 className="text-sm font-semibold text-[#101828]">AI Insights</h2>
          <span className="text-[10px] font-semibold text-[#006B5D] bg-[#E6F4F1] rounded-full px-2 py-0.5">
            Auto-analysis
          </span>
        </div>
        {offlineMode ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1">
            <WifiOff size={12} />
            Offline · last synced
          </span>
        ) : (
          <button
            onClick={() => { clearInsightsCache(userId); setRefreshKey(k => k + 1); }}
            className="flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#006B5D] transition-colors"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        )}
      </div>

      {insights === null && !error ? (
        offlineMode ? (
          <p className="text-xs text-[#667085] bg-white border border-slate-200 rounded-xl px-4 py-3">
            AI insights weren't cached before you went offline. Reconnect to load them.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            ))}
          </div>
        )
      ) : error ? (
        <p className="text-xs text-[#667085] bg-white border border-slate-200 rounded-xl px-4 py-3">
          AI insights couldn't be loaded right now.
        </p>
      ) : insights && insights.length === 0 ? (
        <p className="text-xs text-[#667085] bg-white border border-slate-200 rounded-xl px-4 py-3">
          Not enough data to generate insights yet — keep using the app and check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {insights!.slice(0, 4).map(ins => (
            <div
              key={ins.title}
              className={`rounded-xl border border-slate-200 border-l-4 ${severityBorder(ins.severity)} bg-white p-4 shadow-sm`}
            >
              <div className="flex items-start gap-2 mb-1.5">
                <span className="mt-0.5 flex-shrink-0">{severityIcon(ins.severity)}</span>
                <p className="text-[13px] font-semibold text-[#101828] leading-snug">{ins.title}</p>
              </div>
              <p className="text-xs text-[#667085] leading-relaxed mb-2">{ins.detail}</p>
              {ins.chart && (
                <div className="mt-2">
                  <AiChart spec={ins.chart} height={110} compact />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
