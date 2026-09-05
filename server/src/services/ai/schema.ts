import { z } from 'zod';

// Shared AI response contract. The frontend mirrors these types in src/lib/ai.ts.
// Charts are always described by this validated spec and rendered by the app's
// own charting components — an LLM never emits rendering code.

export const AI_COLORS = {
  indigo: '#4F46E5',
  green: '#10B981',
  red: '#EF4444',
  amber: '#F59E0B',
  violet: '#8B5CF6',
  cyan: '#06B6D4',
  pink: '#EC4899',
  slate: '#94A3B8',
  lightIndigo: '#E0E7FF',
} as const;

export type AiChartType = 'area' | 'line' | 'bar' | 'pie';

export interface AiChartSeries {
  key: string;
  name: string;
  color: string;
}

export interface AiChartSpec {
  type: AiChartType;
  title: string;
  /** Category field on each data row (ignored by pie). */
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

// ─── Chart builders ───────────────────────────────────────────────────────────

export function areaChart(
  title: string,
  xKey: string,
  data: Record<string, string | number>[],
  series: AiChartSeries[],
): AiChartSpec {
  return { type: 'area', title, xKey, data, series };
}

export function barChart(
  title: string,
  xKey: string,
  data: Record<string, string | number>[],
  series: AiChartSeries[],
): AiChartSpec {
  return { type: 'bar', title, xKey, data, series };
}

export function lineChart(
  title: string,
  xKey: string,
  data: Record<string, string | number>[],
  series: AiChartSeries[],
): AiChartSpec {
  return { type: 'line', title, xKey, data, series };
}

export function pieChart(
  title: string,
  rows: { name: string; value: number; color: string }[],
): AiChartSpec {
  return {
    type: 'pie',
    title,
    xKey: 'name',
    data: rows,
    series: [{ key: 'value', name: 'Value', color: AI_COLORS.indigo }],
  };
}

// ─── Zod validation for anything an external LLM returns ─────────────────────

export const llmClassificationSchema = z.object({
  intent: z.string().min(2).max(60),
});

export const llmPolishSchema = z.object({
  summary: z.string().min(10).max(600),
});
