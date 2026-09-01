import { Download, Lightbulb, AlertTriangle, Info } from 'lucide-react';
import type { AiResponse, AiMetric } from '@/lib/ai';
import { AiChart } from './AiChart';
import { downloadAiReport } from '@/lib/reportImage';

const accentClasses: Record<NonNullable<AiMetric['accent']> | 'none', string> = {
  good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  bad: 'bg-red-50 text-red-700 border-red-200',
  none: 'bg-indigo-50 text-indigo-700 border-indigo-100',
};

interface AiResponseCardProps {
  answer: AiResponse;
  /** Hides the download button (used when the panel already offers one). */
  hideDownload?: boolean;
  onDownloaded?: () => void;
}

export const AiResponseCard: React.FC<AiResponseCardProps> = ({ answer, hideDownload, onDownloaded }) => {
  const handleDownload = () => {
    try {
      downloadAiReport(answer);
      onDownloaded?.();
    } catch (err) {
      console.error('Report download failed:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-semibold text-slate-800 leading-snug">{answer.title}</h4>
          {!hideDownload && (
            <button
              type="button"
              onClick={handleDownload}
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <Download size={13} />
              Download Report
            </button>
          )}
        </div>
        <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">{answer.summary}</p>

        {answer.metrics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {answer.metrics.map(m => (
              <span
                key={m.label}
                className={`inline-flex items-baseline gap-1.5 text-xs rounded-lg border px-2.5 py-1.5 ${accentClasses[m.accent ?? 'none']}`}
              >
                <span className="opacity-70">{m.label}</span>
                <span className="font-bold">{m.value}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {answer.chart && (
        <div className="px-4 pb-2">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">{answer.chart.title}</p>
          <AiChart spec={answer.chart} height={220} />
        </div>
      )}

      {(answer.insights.length > 0 || answer.recommendations.length > 0) && (
        <div className="px-4 pb-4 pt-1 space-y-2">
          {answer.insights.map(ins => (
            <div key={ins.title} className="flex items-start gap-2 text-xs">
              {ins.severity === 'critical' ? (
                <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              ) : ins.severity === 'warning' ? (
                <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
              ) : (
                <Info size={14} className="text-sky-500 mt-0.5 flex-shrink-0" />
              )}
              <span className="text-slate-600">
                <span className="font-medium text-slate-700">{ins.title}.</span> {ins.detail}
              </span>
            </div>
          ))}
          {answer.recommendations.length > 0 && (
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-1.5">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                <Lightbulb size={12} className="text-amber-500" /> Suggestions
              </p>
              {answer.recommendations.map(rec => (
                <p key={rec} className="text-xs text-slate-600 leading-relaxed">• {rec}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
