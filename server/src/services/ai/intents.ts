import type { AuthUser, FrontendRole } from '../../middleware/auth';
import type { AiInsight, AiResponse } from './schema';
import { AI_COLORS, barChart } from './schema';
import {
  buildScope, listScopedStudents, groupLabelFor,
  overallAttendanceRate, dailyAttendanceSeries, attendanceAreaChart,
  perStudentAttendanceRates, subjectAverages, studentSubjectDetails,
  strugglingStudents, strugglingBarChart, feeSnapshot, feePieChart,
  classSummaries, classComparisonChart, enrollmentPie, streakSummary,
  formatRs, shortDate, type AiScope,
} from './analytics';
import { ACTIVITY_BANK, FAMILY_LABELS } from './activities';
import { todayISO } from '../attendance';
import { prisma } from '../../db';
import { aiLlmEnabled } from '../../config';
import { llmClassify } from './llm';

// ─── Suggested questions (mirrored in src/lib/ai.ts on the frontend) ─────────

export const SUGGESTED_QUESTIONS: Record<FrontendRole, string[]> = {
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

// ─── Subject-family detection ─────────────────────────────────────────────────

const SUBJECT_FAMILIES: { family: string; inQuestion: RegExp; inSubject: RegExp }[] = [
  { family: 'math', inQuestion: /math|count|number|numeracy|arithmetic/, inSubject: /math|count|number/i },
  { family: 'phonics', inQuestion: /phonics|letter|reading|language|sound|literacy|alphabet/, inSubject: /phonics|language|letter|reading/i },
  { family: 'sensorial', inQuestion: /sensorial|sensory|pink tower|cylinder|practical life/, inSubject: /sensorial|practical/i },
  { family: 'art', inQuestion: /\bart\b|craft|drawing|paint|creativ/, inSubject: /art|craft|creativ/i },
  { family: 'rhymes', inQuestion: /rhyme|song|music|story|arabic/, inSubject: /rhyme|story|arabic/i },
];

const detectFamily = (q: string): string | null =>
  SUBJECT_FAMILIES.find(f => f.inQuestion.test(q))?.family ?? null;

const familyMatchesSubject = (family: string, subject: string): boolean =>
  SUBJECT_FAMILIES.find(f => f.family === family)?.inSubject.test(subject) ?? false;

// ─── Response helpers ─────────────────────────────────────────────────────────

type Draft = Omit<AiResponse, 'source' | 'generatedAt'>;

const finalize = (draft: Draft): AiResponse => ({
  ...draft,
  source: 'local',
  generatedAt: new Date().toISOString(),
});

const noData = (intent: string, title: string, message: string): AiResponse => finalize({
  intent,
  title,
  summary: message,
  metrics: [],
  chart: null,
  insights: [],
  recommendations: ['Check back once more records have been added in the portal.'],
});

interface Ctx {
  user: AuthUser;
  scope: AiScope;
  q: string;
}

// ─── Intent handlers ──────────────────────────────────────────────────────────

async function handleFee(ctx: Ctx): Promise<AiResponse> {
  const { user } = ctx;

  if (user.role === 'teacher' || user.role === 'student') {
    return finalize({
      intent: 'fee-status',
      title: 'Fee Information',
      summary: 'Fee records are managed by the school administration, so they are not visible to your role. Please contact the school office for fee-related questions.',
      metrics: [],
      chart: null,
      insights: [],
      recommendations: [],
    });
  }

  if (user.role === 'admin') {
    const snap = await feeSnapshot();
    const insights: AiInsight[] = [];
    if (snap.dueStudents.length > 0) {
      insights.push({
        severity: 'warning',
        title: `${snap.dueStudents.length} student(s) with outstanding fees`,
        detail: snap.dueStudents.map(s => `${s.name} (${s.class})`).join(', '),
      });
    } else {
      insights.push({ severity: 'info', title: 'All fees collected', detail: 'No outstanding fee notices at this time.' });
    }
    return finalize({
      intent: 'fee-status',
      title: 'Fee Collection Overview',
      summary: `Of ${formatRs(snap.totalBilled)} billed across ${snap.studentCount} students, ${formatRs(snap.totalCollected)} is collected and ${formatRs(snap.totalDue)} remains outstanding${snap.dueStudents.length > 0 ? ` across ${snap.dueStudents.length} student(s)` : ''}.`,
      metrics: [
        { label: 'Total billed', value: formatRs(snap.totalBilled) },
        { label: 'Collected', value: formatRs(snap.totalCollected), accent: 'good' },
        { label: 'Outstanding', value: formatRs(snap.totalDue), accent: snap.totalDue > 0 ? 'bad' : 'good' },
        { label: 'Students with dues', value: String(snap.dueStudents.length), accent: snap.dueStudents.length > 0 ? 'warn' : 'good' },
      ],
      chart: feePieChart(snap),
      insights,
      recommendations: snap.dueStudents.length > 0
        ? ['Send fee reminders from the Admin → Users page to the affected families.', 'Review dues weekly to keep collection on track.']
        : ['Collection is complete — no action needed.'],
    });
  }

  // Parent: status flag only, never amounts.
  const children = await listScopedStudents(user);
  if (children.length === 0) {
    return noData('fee-status', 'Fee Status', 'No children are linked to your account yet.');
  }
  const due = children.filter(c => c.feeDue);
  return finalize({
    intent: 'fee-status',
    title: 'Fee Status',
    summary: due.length === 0
      ? `All fee obligations are cleared for ${children.map(c => c.name).join(' and ')}. Thank you!`
      : `There is an outstanding fee notice for ${due.map(c => c.name).join(' and ')}. Please contact the school office for details and payment options.`,
    metrics: children.map(c => ({
      label: c.name,
      value: c.feeDue ? 'Fee due' : 'Cleared',
      accent: (c.feeDue ? 'bad' : 'good') as 'bad' | 'good',
    })),
    chart: null,
    insights: [],
    recommendations: due.length > 0 ? ['Reach out to the school office to settle the outstanding notice.'] : [],
  });
}

async function handleAttendanceLow(ctx: Ctx): Promise<AiResponse> {
  const { user, scope, q } = ctx;
  const thresholdMatch = q.match(/(\d{1,3})\s*%/);
  const threshold = thresholdMatch ? Math.min(100, Math.max(1, parseInt(thresholdMatch[1], 10))) : 80;

  const [rates, students] = await Promise.all([
    perStudentAttendanceRates(scope.studentIds),
    listScopedStudents(user),
  ]);
  const checked = students.filter(s => {
    const r = rates.get(s.id);
    return r && r.days >= 5;
  });
  const low = checked
    .map(s => ({ student: s, rate: rates.get(s.id)!.rate }))
    .filter(x => x.rate < threshold)
    .sort((a, b) => a.rate - b.rate);

  if (checked.length === 0) {
    return noData('attendance-low', 'Low Attendance Check', `There is not enough attendance history yet for ${groupLabelFor(user.role)} to evaluate against the ${threshold}% threshold.`);
  }

  const lowest = checked.reduce((min, s) => Math.min(min, rates.get(s.id)!.rate), 100);

  if (low.length === 0) {
    return finalize({
      intent: 'attendance-low',
      title: `Attendance Below ${threshold}%`,
      summary: `Good news — no student in ${groupLabelFor(user.role)} is below ${threshold}% attendance. The lowest rate on record is ${lowest}%.`,
      metrics: [
        { label: 'Threshold', value: `${threshold}%` },
        { label: 'Students checked', value: String(checked.length) },
        { label: 'Lowest rate', value: `${lowest}%`, accent: 'good' },
      ],
      chart: null,
      insights: [{ severity: 'info', title: 'Attendance is healthy', detail: 'Consistent morning routines are clearly working — keep them up.' }],
      recommendations: ['Keep the current attendance routines in place.', 'Re-check after the next few weeks of records.'],
    });
  }

  const isParent = user.role === 'parent';
  return finalize({
    intent: 'attendance-low',
    title: `Students Below ${threshold}% Attendance`,
    summary: isParent
      ? `${low.length === 1 ? `${low[0].student.name} has` : `${low.length} of your children have`} attendance below ${threshold}%. More consistent attendance will help keep learning momentum.`
      : `${low.length} student(s) in ${groupLabelFor(user.role)} have attendance below ${threshold}%.`,
    metrics: [
      { label: 'Threshold', value: `${threshold}%` },
      { label: 'Students flagged', value: String(low.length), accent: 'bad' },
      { label: 'Lowest rate', value: `${low[0].rate}%`, accent: 'bad' },
    ],
    chart: barChart(
      `Attendance below ${threshold}%`,
      'name',
      low.map(x => ({ name: x.student.name, rate: x.rate })),
      [{ key: 'rate', name: 'Attendance %', color: AI_COLORS.red }],
    ),
    insights: low.map(x => ({
      severity: x.rate < 70 ? 'critical' : 'warning',
      title: `${x.student.name} — ${x.rate}%`,
      detail: `${x.student.class} · ${rates.get(x.student.id)!.days} recorded days`,
    })),
    recommendations: isParent
      ? ['Aim for the regular school-day routine; even one extra day a week makes a difference.', 'Notify the teacher in advance for planned absences.']
      : ['Contact the families of flagged students to understand barriers.', 'Pair flagged students with an attendance buddy during circle time.', 'Review again in two weeks.'],
  });
}

async function handleClassComparison(ctx: Ctx): Promise<AiResponse> {
  const { user, scope, q } = ctx;
  const rows = await classSummaries(user.role === 'teacher' ? scope.teacherClasses : undefined);
  if (rows.length === 0) {
    return noData('class-comparison', 'Class Comparison', 'No classes found in your scope yet.');
  }

  const withAttendance = rows.filter(r => r.attendanceRate !== null);
  const withScores = rows.filter(r => r.avgScore !== null);
  const bestAttendance = withAttendance.length > 0
    ? withAttendance.reduce((a, b) => (b.attendanceRate! > a.attendanceRate! ? b : a))
    : null;
  const bestScore = withScores.length > 0
    ? withScores.reduce((a, b) => (b.avgScore! > a.avgScore! ? b : a))
    : null;
  const needsAttention = rows
    .filter(r => r.attendanceRate !== null || r.avgScore !== null)
    .sort((a, b) => ((a.attendanceRate ?? 0) + (a.avgScore ?? 0)) - ((b.attendanceRate ?? 0) + (b.avgScore ?? 0)))[0] ?? null;

  const rowsWithData = rows.filter(r => r.attendanceRate !== null || r.avgScore !== null);
  let summary: string;
  if (rowsWithData.length <= 1) {
    const only = rowsWithData[0] ?? null;
    summary = only
      ? `Only ${only.className} has recorded data so far${only.attendanceRate !== null ? ` — attendance at ${only.attendanceRate}%` : ''}${only.avgScore !== null ? ` and assessments averaging ${only.avgScore}%` : ''}. Other classes will appear here once their data is recorded.`
      : 'No class has attendance or assessment data recorded yet.';
  } else if (/highest|best|top/.test(q) && bestAttendance) {
    summary = bestScore && bestScore.className === bestAttendance.className
      ? `${bestAttendance.className} leads both attendance (${bestAttendance.attendanceRate}%) and assessments (${bestScore.avgScore}% average).`
      : `${bestAttendance.className} currently leads with ${bestAttendance.attendanceRate}% attendance${bestScore ? `, while ${bestScore.className} tops assessments at ${bestScore.avgScore}% average` : ''}.`;
  } else if (/attention|weakest|worst|lowest/.test(q) && needsAttention) {
    summary = `${needsAttention.className} needs the most attention right now${needsAttention.attendanceRate !== null ? ` — attendance is at ${needsAttention.attendanceRate}%` : ''}${needsAttention.avgScore !== null ? ` and assessment average is ${needsAttention.avgScore}%` : ''}.`;
  } else {
    summary = `Compared ${rows.length} classes by attendance and assessment averages. ${bestAttendance ? `${bestAttendance.className} leads attendance at ${bestAttendance.attendanceRate}%.` : 'No attendance has been recorded yet.'}`;
  }

  const insights: AiInsight[] = rows
    .filter(r => r.attendanceRate === null && r.avgScore === null)
    .map(r => ({
      severity: 'info' as const,
      title: `${r.className} — no data yet`,
      detail: 'Attendance and assessments have not been recorded for this class yet.',
    }));

  return finalize({
    intent: 'class-comparison',
    title: 'Class Comparison',
    summary,
    metrics: [
      { label: 'Classes compared', value: String(rows.length) },
      ...(bestAttendance ? [{ label: 'Best attendance', value: `${bestAttendance.className.split(' ')[0]} · ${bestAttendance.attendanceRate}%`, accent: 'good' as const }] : []),
      ...(bestScore ? [{ label: 'Top assessments', value: `${bestScore.className.split(' ')[0]} · ${bestScore.avgScore}%`, accent: 'good' as const }] : []),
    ],
    chart: classComparisonChart(rows),
    insights,
    recommendations: needsAttention
      ? [`Focus observations on ${needsAttention.className} this week.`, 'Share what is working in the strongest class with other teachers.']
      : ['Add attendance and assessment records to unlock comparisons.'],
  });
}

async function handleActivities(ctx: Ctx): Promise<AiResponse> {
  const { user, q } = ctx;
  const family = detectFamily(q) ?? 'general';
  const list = ACTIVITY_BANK[family] ?? ACTIVITY_BANK.general;
  const label = FAMILY_LABELS[family];
  return finalize({
    intent: 'activity-suggestions',
    title: `Montessori Activity Ideas — ${label}`,
    summary: user.role === 'parent'
      ? `Here are ${list.length} hands-on ${label.toLowerCase()} activities you can do at home with everyday materials.`
      : `Here are ${list.length} prepared-environment activities for ${label.toLowerCase()}, suitable for circle time or individual work cycles.`,
    metrics: [
      { label: 'Focus area', value: label },
      { label: 'Activities', value: String(list.length) },
    ],
    chart: null,
    insights: [],
    recommendations: list.map(a => `${a.name} — ${a.detail}`),
  });
}

async function handleAttendanceTrend(ctx: Ctx): Promise<AiResponse> {
  const { user, scope } = ctx;
  const series = await dailyAttendanceSeries(scope.studentIds);
  if (series.length === 0) {
    return noData('attendance-trend', 'Attendance Trend', `No attendance has been recorded yet for ${groupLabelFor(user.role)}.`);
  }
  const rate = await overallAttendanceRate(scope.studentIds);
  const totalAbsent = series.reduce((sum, d) => sum + d.absent, 0);

  // Compare first half vs second half to describe direction.
  const half = Math.floor(series.length / 2);
  const avgOf = (rows: typeof series) => {
    const p = rows.reduce((s, r) => s + r.present, 0);
    const t = rows.reduce((s, r) => s + r.present + r.absent + r.leave, 0);
    return t === 0 ? null : (p / t) * 100;
  };
  const first = half > 0 ? avgOf(series.slice(0, half)) : null;
  const second = half > 0 ? avgOf(series.slice(half)) : null;
  const trend = first !== null && second !== null
    ? second - first > 2 ? 'improving' : first - second > 2 ? 'declining' : 'steady'
    : 'steady';

  const titleByRole = {
    teacher: 'Class Attendance Trend',
    admin: 'School Attendance Trend',
    parent: "Your Child's Attendance Trend",
    student: 'My Attendance Trend',
  }[user.role];

  return finalize({
    intent: 'attendance-trend',
    title: titleByRole,
    summary: `Attendance for ${groupLabelFor(user.role)} averages ${rate ?? '—'}% across ${series.length} recorded school days and is currently ${trend}${trend === 'improving' ? ' — keep the momentum going!' : trend === 'declining' ? ', so a gentle routine check-in may help.' : '.'}`,
    metrics: [
      { label: 'Overall rate', value: `${rate ?? '—'}%`, accent: rate !== null && rate >= 85 ? 'good' : 'warn' },
      { label: 'Days recorded', value: String(series.length) },
      { label: 'Total absences', value: String(totalAbsent), accent: totalAbsent > 0 ? 'warn' : 'good' },
    ],
    chart: attendanceAreaChart('Daily attendance', series),
    insights: [],
    recommendations: rate !== null && rate < 85
      ? ['Reach out to families after two consecutive absences.', 'Celebrate full-attendance weeks during circle time.']
      : ['Attendance is healthy — maintain the current routine.'],
  });
}

async function handleStruggling(ctx: Ctx): Promise<AiResponse> {
  const { user, scope, q } = ctx;
  const family = detectFamily(q);
  let flagged = await strugglingStudents(scope.studentIds);
  if (family) flagged = flagged.filter(f => familyMatchesSubject(family, f.subject));

  const scopeLabel = user.role === 'parent' ? 'your children' : user.role === 'student' ? 'your subjects' : 'your students';
  const subjectLabel = family ? FAMILY_LABELS[family] : 'any learning area';

  if (flagged.length === 0) {
    return finalize({
      intent: 'struggling',
      title: 'Students Needing Support',
      summary: family
        ? `No one in ${scopeLabel} is currently flagged in ${subjectLabel}. Averages are at or above the 65% comfort threshold with no 'Developing' milestones.`
        : `No one in ${scopeLabel} is currently flagged (subject average below 65% or a 'Developing' milestone).`,
      metrics: [
        { label: 'Students checked', value: String(scope.studentIds.length) },
        ...(family ? [{ label: 'Focus area', value: subjectLabel }] : []),
      ],
      chart: null,
      insights: [{ severity: 'info', title: 'Everyone is on track', detail: 'Re-run this check after the next assessment cycle.' }],
      recommendations: [],
    });
  }

  const uniqueStudents = [...new Set(flagged.map(f => f.studentId))].length;
  return finalize({
    intent: 'struggling',
    title: user.role === 'parent' ? 'Areas Needing Improvement' : 'Students Needing Support',
    summary: user.role === 'parent'
      ? `${uniqueStudents === 1 ? 'Your child needs' : `${uniqueStudents} of your children need`} extra support in ${flagged.map(f => f.subject).filter((v, i, a) => a.indexOf(v) === i).join(', ')}. Targeted practice over the next two weeks should help.`
      : `${uniqueStudents} student(s) need support${family ? ` in ${subjectLabel}` : ''}: averages below 65% or a 'Developing' milestone were detected.`,
    metrics: [
      { label: 'Students flagged', value: String(uniqueStudents), accent: 'bad' },
      { label: 'Flagged subjects', value: String([...new Set(flagged.map(f => f.subject))].length) },
      { label: 'Lowest average', value: `${flagged[0].avgPct}%`, accent: 'bad' },
    ],
    chart: strugglingBarChart(flagged),
    insights: flagged.slice(0, 5).map(f => ({
      severity: f.avgPct < 50 ? 'critical' as const : 'warning' as const,
      title: `${f.studentName} — ${f.subject}`,
      detail: `${f.class} · average ${f.avgPct}%${f.milestoneStatus ? ` · milestone: ${f.milestoneStatus}` : ''}`,
    })),
    recommendations: [
      ...(ACTIVITY_BANK[family ?? 'general'] ?? ACTIVITY_BANK.general).slice(0, 2).map(a => `${a.name} — ${a.detail}`),
      'Re-assess in two weeks to check whether targeted practice helped.',
    ],
  });
}

async function handleProgressReport(ctx: Ctx): Promise<AiResponse> {
  const { user, scope, q } = ctx;
  const students = await listScopedStudents(user);
  if (students.length === 0) {
    return noData('progress-report', 'Progress Report', 'No students are linked to your account yet.');
  }

  const target = students.find(s => s.name.toLowerCase().split(/\s+/).every(tok => tok.length > 2 && q.includes(tok)));
  if (!target) {
    if (user.role === 'parent' && students.length === 1) {
      return studentReport(students[0], user);
    }
    return finalize({
      intent: 'progress-report',
      title: 'Progress Report',
      summary: 'Which student should I report on? Include the student name in your question.',
      metrics: [],
      chart: null,
      insights: [{ severity: 'info', title: 'Students you can report on', detail: students.map(s => `${s.name} (${s.class})`).join(', ') }],
      recommendations: [],
    });
  }
  return studentReport(target, user);
}

async function studentReport(target: { id: string; name: string; class: string; rollNo: string }, user: AuthUser): Promise<AiResponse> {
  const [details, rates] = await Promise.all([
    studentSubjectDetails(target.id),
    perStudentAttendanceRates([target.id]),
  ]);
  const att = rates.get(target.id);

  if (details.length === 0) {
    return finalize({
      intent: 'progress-report',
      title: `Progress Report — ${target.name}`,
      summary: `${target.name} (${target.class}, roll #${target.rollNo}) has no assessed milestones yet. Attendance${att ? ` is at ${att.rate}%` : ' has not been recorded yet'}.`,
      metrics: [
        { label: 'Class', value: target.class },
        ...(att ? [{ label: 'Attendance', value: `${att.rate}%` }] : []),
      ],
      chart: null,
      insights: [{ severity: 'info', title: 'No assessments recorded', detail: 'A report will appear here after the first milestone evaluation.' }],
      recommendations: [],
    });
  }

  const overall = Math.round(details.reduce((s, d) => s + d.avgPct, 0) / details.length);
  const strongest = [...details].sort((a, b) => b.avgPct - a.avgPct)[0];
  const focus = [...details].sort((a, b) => a.avgPct - b.avgPct)[0];
  const mastered = details.filter(d => d.milestoneStatus === 'Mastered').length;

  return finalize({
    intent: 'progress-report',
    title: `Progress Report — ${target.name}`,
    summary: `${target.name} (${target.class}) averages ${overall}% overall. Strongest area is ${strongest.subject} (${strongest.avgPct}%); the current focus area is ${focus.subject} (${focus.avgPct}%).`,
    metrics: [
      { label: 'Overall average', value: `${overall}%`, accent: overall >= 75 ? 'good' : overall >= 65 ? 'warn' : 'bad' },
      { label: 'Attendance', value: att ? `${att.rate}%` : '—', accent: att && att.rate >= 85 ? 'good' : 'warn' },
      { label: 'Mastered milestones', value: `${mastered}/${details.length}`, accent: 'good' },
    ],
    chart: barChart(
      `Subject performance — ${target.name}`,
      'name',
      details.map(d => ({ name: d.subject, score: d.avgPct })),
      [{ key: 'score', name: 'Average %', color: AI_COLORS.indigo }],
    ),
    insights: details.map(d => ({
      severity: (d.avgPct < 65 ? 'warning' : 'info') as AiInsight['severity'],
      title: `${d.subject} — ${d.avgPct}%`,
      detail: `Grade ${d.grade ?? '—'}${d.milestoneStatus ? ` · ${d.milestoneStatus}` : ''}`,
    })),
    recommendations: [
      `Give extra ${focus.subject.toLowerCase()} practice this fortnight.`,
      'Celebrate the strongest area to keep motivation high.',
    ],
  });
}

async function handleStreak(ctx: Ctx): Promise<AiResponse> {
  const { user } = ctx;
  const s = await streakSummary(user.id);
  const today = todayISO();
  const playedToday = s.lastActivityDate === today;
  const insights: AiInsight[] = [];
  if (s.currentStreak === 0) {
    insights.push({ severity: 'info', title: 'Start your streak!', detail: "Complete today's learning task to light up your first streak day." });
  } else if (!playedToday) {
    insights.push({ severity: 'warning', title: 'Streak at risk', detail: `Your ${s.currentStreak}-day streak resets if you skip today. Play today's task to keep it alive!` });
  } else {
    insights.push({ severity: 'info', title: `${s.currentStreak}-day streak 🔥`, detail: "You've already played today — see you tomorrow!" });
  }
  return finalize({
    intent: 'my-streak',
    title: 'My Learning Streak',
    summary: s.totalXp === 0
      ? "You haven't started the daily learning games yet — play today's task to earn XP and begin a streak!"
      : `You are on a ${s.currentStreak}-day streak with ${s.totalXp} XP (Level ${s.level}) and ${s.badgeCount} badge(s) earned${playedToday ? ", and today's task is done" : ''}.`,
    metrics: [
      { label: 'Current streak', value: `${s.currentStreak} day(s)`, accent: s.currentStreak > 0 ? 'good' : 'warn' },
      { label: 'Total XP', value: String(s.totalXp) },
      { label: 'Level', value: String(s.level) },
      { label: 'Badges', value: String(s.badgeCount) },
    ],
    chart: s.sessions.length >= 2
      ? barChart(
        'XP earned per session',
        'name',
        s.sessions.map(x => ({ name: shortDate(x.date), xp: x.xpEarned })),
        [{ key: 'xp', name: 'XP', color: AI_COLORS.violet }],
      )
      : null,
    insights,
    recommendations: playedToday ? ['Come back tomorrow to extend your streak.'] : ["Play today's task from the Learning page to protect your streak."],
  });
}

async function handlePerformanceSummary(ctx: Ctx): Promise<AiResponse> {
  const { user, scope } = ctx;

  if (user.role === 'student') {
    const me = await prisma.student.findUnique({ where: { id: user.id } });
    const [mine, classmates] = await Promise.all([
      studentSubjectDetails(user.id),
      me ? prisma.student.findMany({ where: { class: me.class }, select: { id: true } }) : Promise.resolve([]),
    ]);
    const classAvgs = await subjectAverages(classmates.map(c => c.id));
    if (mine.length === 0) {
      return noData('performance-summary', 'My Performance', 'No assessed milestones yet — your subject averages will appear after your first evaluation.');
    }
    const classMap = new Map(classAvgs.map(c => [c.subject, c.avgPct]));
    const overall = Math.round(mine.reduce((s, d) => s + d.avgPct, 0) / mine.length);
    return finalize({
      intent: 'performance-summary',
      title: 'My Performance Summary',
      summary: `You average ${overall}% across ${mine.length} assessed area(s)${mine[0] ? `, with your best result in ${[...mine].sort((a, b) => b.avgPct - a.avgPct)[0].subject}` : ''}.`,
      metrics: [
        { label: 'Overall average', value: `${overall}%`, accent: overall >= 75 ? 'good' : 'warn' },
        { label: 'Areas assessed', value: String(mine.length) },
      ],
      chart: barChart(
        'My scores vs class average',
        'name',
        mine.map(d => ({ name: d.subject, mine: d.avgPct, classAvg: classMap.get(d.subject) ?? 0 })),
        [
          { key: 'mine', name: 'My Score', color: AI_COLORS.indigo },
          { key: 'classAvg', name: 'Class Avg', color: AI_COLORS.lightIndigo },
        ],
      ),
      insights: [],
      recommendations: ['Check the Learning page daily to keep your XP and streak growing.'],
    });
  }

  if (user.role === 'parent') {
    const children = await listScopedStudents(user);
    const rows: { name: string; avg: number | null }[] = [];
    for (const child of children) {
      const details = await studentSubjectDetails(child.id);
      rows.push({
        name: child.name,
        avg: details.length > 0 ? Math.round(details.reduce((s, d) => s + d.avgPct, 0) / details.length) : null,
      });
    }
    const assessed = rows.filter(r => r.avg !== null);
    if (assessed.length === 0) {
      return noData('performance-summary', 'Child Progress', "Your children's first assessments haven't been recorded yet.");
    }
    const top = assessed.reduce((a, b) => (b.avg! > a.avg! ? b : a));
    const focus = assessed.reduce((a, b) => (b.avg! < a.avg! ? b : a));
    return finalize({
      intent: 'performance-summary',
      title: 'How Your Children Are Progressing',
      summary: children.length === 1
        ? `${assessed[0].name} is averaging ${assessed[0].avg}% across assessed learning areas.`
        : `Across your children, ${top.name} is currently strongest (${top.avg}%) and ${focus.name} may appreciate extra encouragement (${focus.avg}%).`,
      metrics: assessed.map(r => ({
        label: r.name,
        value: `${r.avg}%`,
        accent: (r.avg! >= 75 ? 'good' : r.avg! >= 65 ? 'warn' : 'bad') as 'good' | 'warn' | 'bad',
      })),
      chart: assessed.length > 1
        ? barChart('Average by child', 'name', assessed.map(r => ({ name: r.name, score: r.avg! })), [{ key: 'score', name: 'Average %', color: AI_COLORS.indigo }])
        : null,
      insights: [],
      recommendations: ['Ask me "Which areas need improvement?" for targeted suggestions.'],
    });
  }

  // Teacher / admin: aggregate per subject.
  const avgs = await subjectAverages(scope.studentIds);
  if (avgs.length === 0) {
    return noData('performance-summary', 'Performance Summary', `No assessment results exist yet for ${groupLabelFor(user.role)}.`);
  }
  const overall = Math.round(avgs.reduce((s, a) => s + a.avgPct * a.results, 0) / avgs.reduce((s, a) => s + a.results, 0));
  const strongest = avgs[0];
  const focusArea = avgs[avgs.length - 1];
  const sameArea = strongest.subject === focusArea.subject;
  return finalize({
    intent: 'performance-summary',
    title: user.role === 'admin' ? 'School Performance Summary' : "My Students' Performance",
    summary: sameArea
      ? `Across ${groupLabelFor(user.role)}, students average ${overall}% in assessments, with all results so far in ${strongest.subject}.`
      : `Across ${groupLabelFor(user.role)}, students average ${overall}% in assessments. ${strongest.subject} is the strongest area (${strongest.avgPct}%), while ${focusArea.subject} deserves the most attention (${focusArea.avgPct}%).`,
    metrics: [
      { label: 'Overall average', value: `${overall}%`, accent: overall >= 75 ? 'good' : 'warn' },
      { label: 'Students in scope', value: String(scope.studentIds.length) },
      { label: 'Strongest area', value: `${strongest.avgPct}%`, accent: 'good' },
      ...(sameArea ? [] : [{ label: 'Focus area', value: `${focusArea.avgPct}%`, accent: focusArea.avgPct < 65 ? 'bad' as const : 'warn' as const }]),
    ],
    chart: barChart(
      'Average score by learning area',
      'name',
      avgs.map(a => ({ name: a.subject, score: a.avgPct })),
      [{ key: 'score', name: 'Average %', color: AI_COLORS.indigo }],
    ),
    insights: [],
    recommendations: [
      sameArea ? `Keep building on ${strongest.subject} with fresh variations and materials.` : `Plan targeted ${focusArea.subject.toLowerCase()} activities this week.`,
      'Ask me "Which students are struggling?" for names and details.',
    ],
  });
}

async function handleEnrollment(ctx: Ctx): Promise<AiResponse> {
  const chart = await enrollmentPie();
  const total = chart.data.reduce((sum, row) => sum + Number(row.value ?? 0), 0);
  return finalize({
    intent: 'enrollment',
    title: 'Enrollment Distribution',
    summary: `The school currently has ${total} enrolled students across ${chart.data.length} classes.`,
    metrics: [
      { label: 'Total students', value: String(total) },
      { label: 'Classes', value: String(chart.data.length) },
    ],
    chart,
    insights: [],
    recommendations: [],
  });
}

function handleFallback(ctx: Ctx): AiResponse {
  const { user } = ctx;
  return finalize({
    intent: 'fallback',
    title: 'How I Can Help',
    summary: "I'm the KinderGuide AI Assistant. I analyze the data your role can access and answer with explanations, charts and downloadable reports. Try one of these:",
    metrics: [],
    chart: null,
    insights: [],
    recommendations: SUGGESTED_QUESTIONS[user.role],
  });
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

type Handler = (ctx: Ctx) => Promise<AiResponse> | AiResponse;

const INTENT_ROUTES: { id: string; test: RegExp | null; roles?: FrontendRole[]; handle: Handler }[] = [
  { id: 'fee-status', test: /fee|dues?\b|payment/, handle: handleFee },
  { id: 'attendance-low', test: /(below|under|less than)\s*\d{1,3}\s*%|low attendance|attendance\s+(?:is\s+)?(?:low|risky|concerning)/, handle: handleAttendanceLow },
  { id: 'class-comparison', test: /(which|compare)\b.{0,20}class|class(?:es)?\b.{0,25}(highest|lowest|best|worst|attention|compare|need)/, roles: ['admin', 'teacher'], handle: handleClassComparison },
  { id: 'activity-suggestions', test: /activit|things?\s+(?:to|we can)\s+do|at\s+home|suggest.{0,20}(?:idea|game)/, handle: handleActivities },
  { id: 'attendance-trend', test: /attendance|present|absent/, handle: handleAttendanceTrend },
  { id: 'my-streak', test: /streak|\bxp\b|badge|\blevel\b/, roles: ['student'], handle: handleStreak },
  { id: 'struggling', test: /struggl|weak|need.{0,20}(?:help|support|improv)|improvement|behind|difficult/, handle: handleStruggling },
  { id: 'progress-report', test: /progress\s+report|report\s+card|report\s+(?:for|on)/, roles: ['admin', 'teacher', 'parent'], handle: handleProgressReport },
  { id: 'enrollment', test: /enrol|how\s+many\s+students|distribution/, roles: ['admin'], handle: handleEnrollment },
  { id: 'performance-summary', test: /performance|progress|summar|how\s+(?:is|are)|doing|results/, handle: handlePerformanceSummary },
];

export async function answerQuestion(user: AuthUser, question: string): Promise<AiResponse> {
  const scope = await buildScope(user);
  const q = question.toLowerCase();
  const ctx: Ctx = { user, scope, q };

  let route = INTENT_ROUTES.find(r => (!r.roles || r.roles.includes(user.role)) && r.test?.test(q));

  // Optional LLM classification when nothing matched locally.
  if (!route && aiLlmEnabled) {
    const intent = await llmClassify(question, INTENT_ROUTES.map(r => r.id));
    if (intent) {
      route = INTENT_ROUTES.find(r => r.id === intent && (!r.roles || r.roles.includes(user.role)));
    }
  }

  if (!route) return handleFallback(ctx);
  return route.handle(ctx);
}

// ─── Proactive insights for the role dashboards ───────────────────────────────

export async function buildInsights(user: AuthUser): Promise<AiInsight[]> {
  const scope = await buildScope(user);

  if (user.role === 'admin') {
    const [rates, students, snap, rows, flagged] = await Promise.all([
      perStudentAttendanceRates(scope.studentIds),
      listScopedStudents(user),
      feeSnapshot(),
      classSummaries(),
      strugglingStudents(scope.studentIds),
    ]);
    const low = students.filter(s => {
      const r = rates.get(s.id);
      return r && r.days >= 5 && r.rate < 80;
    });
    const overall = await overallAttendanceRate(scope.studentIds);
    const withScores = rows.filter(r => r.avgScore !== null);
    const topClass = withScores.length > 0 ? withScores.reduce((a, b) => (b.avgScore! > a.avgScore! ? b : a)) : null;

    return [
      low.length > 0
        ? { severity: 'critical' as const, title: 'Attendance Alert', detail: `${low.length} student(s) have attendance below 80%: ${low.map(s => s.name).join(', ')}.` }
        : { severity: 'info' as const, title: 'Attendance is healthy', detail: `No student is below 80% attendance. School average is ${overall ?? '—'}%.` },
      snap.totalDue > 0
        ? {
          severity: 'warning' as const,
          title: 'Outstanding fees',
          detail: `${formatRs(snap.totalDue)} is pending across ${snap.dueStudents.length} student(s): ${snap.dueStudents.map(s => s.name).join(', ')}.`,
          chart: feePieChart(snap),
        }
        : { severity: 'info' as const, title: 'Fees fully collected', detail: `All ${formatRs(snap.totalBilled)} billed this term has been collected.`, chart: feePieChart(snap) },
      flagged.length > 0
        ? { severity: 'warning' as const, title: 'Students need support', detail: `${[...new Set(flagged.map(f => f.studentId))].length} student(s) flagged in assessments.`, chart: strugglingBarChart(flagged) }
        : { severity: 'info' as const, title: 'Assessments on track', detail: 'No students flagged below the 65% comfort threshold.' },
      topClass
        ? { severity: 'info' as const, title: 'Top performing class', detail: `${topClass.className} leads assessments at ${topClass.avgScore}% average.`, chart: classComparisonChart(rows) }
        : { severity: 'info' as const, title: 'Class data pending', detail: 'Record assessments to unlock class comparisons.' },
    ];
  }

  if (user.role === 'teacher') {
    const [flagged, series, rate, upcoming, streaks, students] = await Promise.all([
      strugglingStudents(scope.studentIds),
      dailyAttendanceSeries(scope.studentIds),
      overallAttendanceRate(scope.studentIds),
      prisma.test.count({ where: { class: { in: scope.teacherClasses }, status: 'upcoming' } }),
      prisma.studentStreak.findMany({ where: { studentId: { in: scope.studentIds } } }),
      listScopedStudents(user),
    ]);
    const today = todayISO();
    const atRisk = streaks.filter(s => s.currentStreak > 0 && s.lastActivityDate !== null && s.lastActivityDate < today);
    const flaggedIds = new Set(flagged.map(f => f.studentId));

    return [
      flagged.length > 0
        ? { severity: 'warning' as const, title: 'Students need support', detail: `${[...flaggedIds].length} student(s) below the 65% comfort threshold or on 'Developing' milestones.`, chart: strugglingBarChart(flagged) }
        : { severity: 'info' as const, title: 'All students on track', detail: `No students in your classes are flagged across ${students.length} students.` },
      series.length > 0
        ? {
          severity: (rate !== null && rate < 80 ? 'warning' : 'info') as AiInsight['severity'],
          title: 'Class attendance',
          detail: `Attendance across your classes averages ${rate ?? '—'}% over ${series.length} recorded days.`,
          chart: attendanceAreaChart('Daily attendance', series),
        }
        : { severity: 'info' as const, title: 'No attendance yet', detail: 'Mark roll call to unlock attendance insights.' },
      { severity: 'info' as const, title: 'Upcoming milestones', detail: upcoming > 0 ? `${upcoming} milestone evaluation(s) are scheduled for your classes.` : 'No upcoming milestone evaluations.' },
      atRisk.length > 0
        ? { severity: 'warning' as const, title: 'Learning streaks at risk', detail: `${atRisk.length} student(s) may lose their daily-learning streak today.` }
        : { severity: 'info' as const, title: 'Daily learning active', detail: 'No active streaks are at risk today.' },
    ];
  }

  if (user.role === 'parent') {
    const children = await listScopedStudents(user);
    if (children.length === 0) {
      return [{ severity: 'info', title: 'Welcome to KinderGuide', detail: 'No children are linked to your account yet. Contact the school office to link them.' }];
    }
    const insights: AiInsight[] = [];
    for (const child of children.slice(0, 2)) {
      const [details, series, rate] = await Promise.all([
        studentSubjectDetails(child.id),
        dailyAttendanceSeries([child.id]),
        overallAttendanceRate([child.id]),
      ]);
      const focus = details.length > 0 ? [...details].sort((a, b) => a.avgPct - b.avgPct)[0] : null;
      if (focus && focus.avgPct < 65) {
        insights.push({
          severity: 'warning',
          title: `${child.name}: focus on ${focus.subject}`,
          detail: `Average ${focus.avgPct}%${focus.milestoneStatus ? ` · milestone: ${focus.milestoneStatus}` : ''}. Try asking the assistant for home activities.`,
          chart: barChart(`Subject averages — ${child.name}`, 'name', details.map(d => ({ name: d.subject, score: d.avgPct })), [{ key: 'score', name: 'Average %', color: AI_COLORS.indigo }]),
        });
      } else if (details.length > 0) {
        const overall = Math.round(details.reduce((s, d) => s + d.avgPct, 0) / details.length);
        insights.push({
          severity: 'info',
          title: `${child.name} is progressing well`,
          detail: `Averaging ${overall}% across ${details.length} assessed area(s).`,
          chart: barChart(`Subject averages — ${child.name}`, 'name', details.map(d => ({ name: d.subject, score: d.avgPct })), [{ key: 'score', name: 'Average %', color: AI_COLORS.indigo }]),
        });
      } else {
        insights.push({ severity: 'info', title: `${child.name}: assessments pending`, detail: "Insights will appear after your child's first milestone evaluation." });
      }
      if (series.length > 0) {
        insights.push({
          severity: (rate !== null && rate < 80 ? 'warning' : 'info') as AiInsight['severity'],
          title: `${child.name}: attendance ${rate ?? '—'}%`,
          detail: rate !== null && rate < 80 ? 'Attendance is below 80% — regular days make a big difference at this age.' : 'Attendance is on track.',
          chart: attendanceAreaChart(`${child.name}'s attendance`, series),
        });
      }
    }
    const dueChildren = children.filter(c => c.feeDue);
    insights.push(dueChildren.length > 0
      ? { severity: 'warning', title: 'Fee notice outstanding', detail: `There is an outstanding fee notice for ${dueChildren.map(c => c.name).join(' and ')}. Please contact the school office.` }
      : { severity: 'info', title: 'Fees cleared', detail: 'No outstanding fee notices for your family.' });
    return insights.slice(0, 4);
  }

  // Student
  const [streak, details, rate] = await Promise.all([
    streakSummary(user.id),
    studentSubjectDetails(user.id),
    overallAttendanceRate(scope.studentIds),
  ]);
  const today = todayISO();
  const insights: AiInsight[] = [];
  insights.push(streak.currentStreak === 0
    ? { severity: 'info', title: 'Start your learning streak', detail: "Play today's task on the Learning page to earn XP and your first badges." }
    : streak.lastActivityDate === today
      ? { severity: 'info', title: `${streak.currentStreak}-day streak 🔥`, detail: `${streak.totalXp} XP · Level ${streak.level} · ${streak.badgeCount} badge(s). See you tomorrow!` }
      : { severity: 'warning', title: 'Streak at risk', detail: `Play today's task to keep your ${streak.currentStreak}-day streak alive.` });
  if (details.length > 0) {
    const overall = Math.round(details.reduce((s, d) => s + d.avgPct, 0) / details.length);
    insights.push({
      severity: (overall < 65 ? 'warning' : 'info') as AiInsight['severity'],
      title: `Assessment average: ${overall}%`,
      detail: `Across ${details.length} assessed area(s)${details.length > 0 ? ` — strongest is ${[...details].sort((a, b) => b.avgPct - a.avgPct)[0].subject}` : ''}.`,
      chart: barChart('My subject averages', 'name', details.map(d => ({ name: d.subject, score: d.avgPct })), [{ key: 'score', name: 'Average %', color: AI_COLORS.indigo }]),
    });
  }
  if (rate !== null) {
    insights.push({
      severity: (rate < 80 ? 'warning' : 'info') as AiInsight['severity'],
      title: `Attendance: ${rate}%`,
      detail: rate >= 80 ? 'Great job showing up for circle time!' : 'Try to attend more school days to keep up with activities.',
    });
  }
  return insights.slice(0, 4);
}
