// Frontend mirror of the backend AI contract (server/src/services/ai/schema.ts).
// All AI UI renders from these validated shapes — chart data is never rendered
// by injecting markup/code from a model.
import { apiGet, apiPost } from '@/lib/api';
import { saveSnapshot, loadSnapshot } from '@/lib/offlineCache';
import type { Role } from '@/types';

export type AiChartType = 'area' | 'line' | 'bar' | 'pie';

export interface AiChartSeries {
  key: string;
  name: string;
  color: string;
}

export interface AiChartSpec {
  type: AiChartType;
  title: string;
  xKey: string;
  /** Pie rows use { name, value, color } to match the existing pie chart shape. */
  data: Record<string, string | number>[];
  series: AiChartSeries[];
}

export interface AiMetric {
  label: string;
  value: string;
  accent?: 'good' | 'warn' | 'bad';
}

export interface AiInsight {
  severity: 'info' | 'warning' | 'critical';
  title: string;
  detail: string;
  chart?: AiChartSpec | null;
}

export interface AiResponse {
  intent: string;
  title: string;
  summary: string;
  metrics: AiMetric[];
  chart?: AiChartSpec | null;
  insights: AiInsight[];
  recommendations: string[];
  source: 'local' | 'llm';
  generatedAt: string;
}

// ─── Suggested starter questions per role (mirrors backend SUGGESTED_QUESTIONS) ──
export const SUGGESTED_QUESTIONS: Record<Role, string[]> = {
  teacher: [
    'Which students are struggling in Mathematics?',
    'Show my class attendance trend',
    'Suggest Montessori activities for counting',
    "Summarize my students' performance",
    'Generate a progress report for Ali Hassan',
  ],
  parent: [
    'How is my child progressing?',
    'Which areas need improvement?',
    'What activities can I do at home?',
    "Show me my child's attendance trend",
    'Is there any fee due?',
  ],
  admin: [
    'Which students have attendance below 80%?',
    'Which class has the highest attendance?',
    'Show monthly fee collection',
    'Summarize school performance',
    'Which classes need attention?',
  ],
  student: [
    'How is my progress?',
    'Show my attendance trend',
    'What is my current streak and XP?',
    'Suggest activities for phonics',
  ],
};

// ─── API calls ────────────────────────────────────────────────────────────────
export const askAi = (question: string) =>
  apiPost<{ answer: AiResponse }>('/ai/ask', { question }).then(r => r.answer);

// Insights are fetched once per user per session; the dashboard section and any
// other consumer share the same in-flight promise so the endpoint is never spammed.
// Successful results are snapshotted to the offline cache so the last-known
// insights stay visible when connectivity drops (offline-first).
const insightsCache = new Map<string, Promise<AiInsight[]>>();

export function fetchInsights(userId: string): Promise<AiInsight[]> {
  const existing = insightsCache.get(userId);
  if (existing) return existing;
  const promise = apiGet<{ insights: AiInsight[] }>('/ai/insights')
    .then(r => {
      saveSnapshot(userId, 'ai-insights', r.insights);
      return r.insights;
    })
    .catch(err => {
      // Don't cache failures — allow a retry on next mount.
      insightsCache.delete(userId);
      throw err;
    });
  insightsCache.set(userId, promise);
  return promise;
}

// Last-known insights for offline display, or null if none were ever fetched.
export const loadCachedInsights = (userId: string): AiInsight[] | null =>
  loadSnapshot<AiInsight[]>(userId, 'ai-insights');

export function clearInsightsCache(userId: string): void {
  insightsCache.delete(userId);
}
