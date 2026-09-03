// Client-side PNG report generator. Everything is drawn programmatically on a
// <canvas> from the validated AiResponse/AiChartSpec — no DOM serialization and
// no external image assets, so it works reliably offline-of-CDN and in tests.
import type { AiResponse, AiChartSpec } from '@/lib/ai';

const W = 860; // logical width (canvas is rendered at 2x for sharpness)
const SCALE = 2;
const MARGIN = 44;

const COLORS = {
  indigo: '#006B5D',
  violet: '#007A6B',
  slate800: '#1E293B',
  slate600: '#475569',
  slate400: '#94A3B8',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
};

function accentColor(accent?: 'good' | 'warn' | 'bad'): string {
  if (accent === 'good') return COLORS.green;
  if (accent === 'warn') return COLORS.amber;
  if (accent === 'bad') return COLORS.red;
  return COLORS.indigo;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// ─── Chart drawing (programmatic mirror of AiChart) ──────────────────────────
function drawChart(ctx: CanvasRenderingContext2D, spec: AiChartSpec, x: number, y: number, width: number): number {
  ctx.fillStyle = COLORS.slate800;
  ctx.font = '600 15px Inter, Arial, sans-serif';
  ctx.fillText(spec.title, x, y + 14);
  const top = y + 36;
  const plotH = 240;

  if (spec.type === 'pie') {
    const rows = spec.data.filter(r => typeof r.value === 'number');
    const total = rows.reduce((s, r) => s + Number(r.value), 0);
    const cx = x + plotH / 2 + 30;
    const cy = top + plotH / 2;
    const rOuter = plotH / 2 - 10;
    const rInner = rOuter * 0.62;
    let start = -Math.PI / 2;
    rows.forEach(row => {
      const frac = total > 0 ? Number(row.value) / total : 0;
      const end = start + frac * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, rOuter, start, end);
      ctx.closePath();
      ctx.fillStyle = String(row.color ?? COLORS.indigo);
      ctx.fill();
      start = end;
    });
    // donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // legend
    let ly = top + 14;
    const lx = x + plotH + 70;
    ctx.font = '500 12px Inter, Arial, sans-serif';
    rows.slice(0, 10).forEach(row => {
      ctx.fillStyle = String(row.color ?? COLORS.indigo);
      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.slate600;
      ctx.fillText(`${String(row.name)} — ${Number(row.value)}`, lx + 12, ly + 4);
      ly += 22;
    });
    return top + plotH;
  }

  const series = spec.series.filter(s => spec.data.some(row => typeof row[s.key] === 'number'));
  const rows = spec.data.slice(-30);
  if (series.length === 0 || rows.length === 0) {
    ctx.fillStyle = COLORS.slate400;
    ctx.font = '400 13px Inter, Arial, sans-serif';
    ctx.fillText('No data available for this chart.', x, top + plotH / 2);
    return top + plotH;
  }

  const axisX = x + 34;
  const plotW = width - 34;
  let maxVal = 1;
  rows.forEach(row => series.forEach(s => { maxVal = Math.max(maxVal, Number(row[s.key]) || 0); }));
  maxVal = Math.ceil(maxVal * 1.15);

  // gridlines + y labels
  ctx.font = '400 10px Inter, Arial, sans-serif';
  for (let g = 0; g <= 4; g++) {
    const gy = top + plotH - (g / 4) * plotH;
    ctx.strokeStyle = COLORS.slate100;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(axisX, gy);
    ctx.lineTo(axisX + plotW, gy);
    ctx.stroke();
    ctx.fillStyle = COLORS.slate400;
    ctx.textAlign = 'right';
    ctx.fillText(String(Math.round((g / 4) * maxVal)), axisX - 6, gy + 3);
  }
  ctx.textAlign = 'left';

  const toY = (v: number) => top + plotH - (v / maxVal) * plotH;

  if (spec.type === 'bar') {
    const groupW = plotW / rows.length;
    const barW = Math.min(34, (groupW * 0.62) / series.length);
    rows.forEach((row, ri) => {
      series.forEach((s, si) => {
        const v = Number(row[s.key]) || 0;
        const bx = axisX + ri * groupW + groupW / 2 - (series.length * barW) / 2 + si * barW;
        const by = toY(v);
        ctx.fillStyle = s.color;
        roundedRect(ctx, bx, by, barW - 2, top + plotH - by, 3);
        ctx.fill();
      });
      ctx.fillStyle = COLORS.slate400;
      ctx.font = '400 9px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      const label = String(row[spec.xKey] ?? '');
      ctx.fillText(label.length > 9 ? `${label.slice(0, 9)}…` : label, axisX + ri * groupW + groupW / 2, top + plotH + 14);
      ctx.textAlign = 'left';
    });
  } else {
    // line / area
    const stepX = rows.length > 1 ? plotW / (rows.length - 1) : 0;
    series.forEach(s => {
      const pts = rows.map((row, i) => [axisX + i * stepX, toY(Number(row[s.key]) || 0)] as const);
      if (spec.type === 'area') {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], top + plotH);
        pts.forEach(p => ctx.lineTo(p[0], p[1]));
        ctx.lineTo(pts[pts.length - 1][0], top + plotH);
        ctx.closePath();
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      pts.forEach((p, i) => { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p[0], p[1], 2.6, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
      });
    });
    // sparse x labels
    ctx.fillStyle = COLORS.slate400;
    ctx.font = '400 9px Inter, Arial, sans-serif';
    const labelEvery = Math.max(1, Math.ceil(rows.length / 8));
    rows.forEach((row, i) => {
      if (i % labelEvery !== 0) return;
      ctx.textAlign = 'center';
      ctx.fillText(String(row[spec.xKey] ?? ''), axisX + i * stepX, top + plotH + 14);
      ctx.textAlign = 'left';
    });
  }

  // series legend for multi-series
  if (series.length > 1) {
    let lx = axisX;
    ctx.font = '500 11px Inter, Arial, sans-serif';
    series.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(lx + 4, top + plotH + 32, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.slate600;
      ctx.fillText(s.name, lx + 12, top + plotH + 36);
      lx += ctx.measureText(s.name).width + 34;
    });
    return top + plotH + 42;
  }
  return top + plotH + 20;
}

// ─── Main report ──────────────────────────────────────────────────────────────
export function downloadAiReport(answer: AiResponse): void {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Pre-measure summary height so the canvas is sized correctly.
  canvas.width = W * SCALE;
  ctx.scale(SCALE, SCALE);
  ctx.font = '400 14px Inter, Arial, sans-serif';
  const summaryLines = wrapText(ctx, answer.summary, W - MARGIN * 2);
  const metricRows = Math.ceil(answer.metrics.length / 4);
  const recLines = answer.recommendations.reduce(
    (n, r) => n + wrapText(ctx, `•  ${r}`, W - MARGIN * 2 - 10).length, 0
  );

  let estHeight = 110 + 40; // header + padding
  estHeight += 30 + 20; // title + date
  estHeight += summaryLines.length * 22 + 26;
  if (answer.metrics.length > 0) estHeight += metricRows * 84 + 16;
  if (answer.chart) estHeight += 36 + 240 + 46;
  if (answer.recommendations.length > 0) estHeight += 24 + recLines * 22 + 20;
  estHeight += 60; // footer

  canvas.height = Math.max(estHeight, 500) * SCALE;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, canvas.height / SCALE);

  // ── Branded header ──
  const header = ctx.createLinearGradient(0, 0, W, 110);
  header.addColorStop(0, COLORS.indigo);
  header.addColorStop(1, COLORS.violet);
  ctx.fillStyle = header;
  ctx.fillRect(0, 0, W, 110);

  // Programmatic logo: white rounded square + "KG"
  const logoGrad = ctx.createLinearGradient(MARGIN, 31, MARGIN + 48, 79);
  logoGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
  logoGrad.addColorStop(1, 'rgba(255,255,255,0.75)');
  roundedRect(ctx, MARGIN, 31, 48, 48, 12);
  ctx.fillStyle = logoGrad;
  ctx.fill();
  ctx.fillStyle = COLORS.indigo;
  ctx.font = '800 19px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('KG', MARGIN + 24, 62);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 23px Inter, Arial, sans-serif';
  ctx.fillText('KinderGuide', MARGIN + 62, 53);
  ctx.font = '400 12.5px Inter, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('Montessori ERP · AI Insights Report', MARGIN + 62, 72);

  let y = 110 + 42;

  // ── Title + date ──
  ctx.fillStyle = COLORS.slate800;
  ctx.font = '700 21px Inter, Arial, sans-serif';
  ctx.fillText(answer.title, MARGIN, y);
  y += 22;
  ctx.fillStyle = COLORS.slate400;
  ctx.font = '400 12px Inter, Arial, sans-serif';
  const stamp = new Date(answer.generatedAt);
  ctx.fillText(
    `Generated ${stamp.toLocaleDateString()} at ${stamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Analysis by KinderGuide AI`,
    MARGIN, y
  );
  y += 30;

  // ── Summary ──
  ctx.fillStyle = COLORS.slate600;
  ctx.font = '400 14px Inter, Arial, sans-serif';
  summaryLines.forEach(line => {
    ctx.fillText(line, MARGIN, y);
    y += 22;
  });
  y += 26;

  // ── Metric boxes ──
  if (answer.metrics.length > 0) {
    const boxW = (W - MARGIN * 2 - 3 * 14) / 4;
    answer.metrics.forEach((m, i) => {
      const bx = MARGIN + (i % 4) * (boxW + 14);
      if (i % 4 === 0 && i > 0) y += 84;
      const by = y;
      const color = accentColor(m.accent);
      roundedRect(ctx, bx, by, boxW, 68, 10);
      ctx.fillStyle = COLORS.slate100;
      ctx.fill();
      ctx.fillStyle = color;
      roundedRect(ctx, bx, by, 4, 68, 2);
      ctx.fill();
      ctx.fillStyle = COLORS.slate400;
      ctx.font = '500 10.5px Inter, Arial, sans-serif';
      const label = m.label.length > 22 ? `${m.label.slice(0, 22)}…` : m.label;
      ctx.fillText(label, bx + 14, by + 24);
      ctx.fillStyle = color;
      ctx.font = '700 19px Inter, Arial, sans-serif';
      ctx.fillText(m.value, bx + 14, by + 50);
    });
    y += 84; // last row's box height + gap (loop already advanced y to its top)
  }

  // ── Chart ──
  if (answer.chart) {
    roundedRect(ctx, MARGIN, y - 8, W - MARGIN * 2, 330, 12);
    ctx.fillStyle = '#FBFCFE';
    ctx.fill();
    ctx.strokeStyle = COLORS.slate200;
    ctx.lineWidth = 1;
    roundedRect(ctx, MARGIN, y - 8, W - MARGIN * 2, 330, 12);
    ctx.stroke();
    y = drawChart(ctx, answer.chart, MARGIN + 18, y + 8, W - MARGIN * 2 - 36) + 26;
  }

  // ── Recommendations ──
  if (answer.recommendations.length > 0) {
    ctx.fillStyle = COLORS.slate800;
    ctx.font = '600 14px Inter, Arial, sans-serif';
    ctx.fillText('Recommended next steps', MARGIN, y);
    y += 24;
    ctx.font = '400 13px Inter, Arial, sans-serif';
    answer.recommendations.forEach(rec => {
      wrapText(ctx, `•  ${rec}`, W - MARGIN * 2 - 10).forEach(line => {
        ctx.fillStyle = COLORS.slate600;
        ctx.fillText(line, MARGIN, y);
        y += 22;
      });
    });
    y += 12;
  }

  // ── Footer ──
  ctx.strokeStyle = COLORS.slate200;
  ctx.beginPath();
  ctx.moveTo(MARGIN, y);
  ctx.lineTo(W - MARGIN, y);
  ctx.stroke();
  ctx.fillStyle = COLORS.slate400;
  ctx.font = '400 11px Inter, Arial, sans-serif';
  ctx.fillText('Generated by KinderGuide AI · kinderguide.edu', MARGIN, y + 24);
  ctx.textAlign = 'right';
  ctx.fillText('Confidential — visible to your role only', W - MARGIN, y + 24);
  ctx.textAlign = 'left';

  // ── Trigger download ──
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `kinderguide-ai-report-${Date.now()}.png`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, 'image/png');
}
