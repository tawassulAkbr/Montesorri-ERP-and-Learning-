import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { notFound, badRequest } from '../utils/errors';

const QUESTIONS_PER_TASK = 6;
const XP_PER_CORRECT = 10;
const PERFECT_BONUS = 20;
const QUESTION_SECONDS = 30;

const todayISO = () => new Date().toISOString().slice(0, 10);
const yesterdayISO = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);

// ─── Deterministic per-student, per-day randomization ────────────────────────
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function getDailyQuestions(studentId: string, gradeClass: string, date: string) {
  const bank = await prisma.learningQuestion.findMany({ where: { gradeClass } });
  const seed = hashStr(`${studentId}::${date}`);
  const shuffled = seededShuffle(bank, seed);
  const picked = shuffled.slice(0, Math.min(QUESTIONS_PER_TASK, shuffled.length));
  // Shuffle each question's options (deterministic) so the correct position varies.
  return picked.map(qq => {
    const optSeed = hashStr(`${studentId}::${date}::${qq.id}`);
    const order = seededShuffle(qq.options.map((_, i) => i), optSeed);
    return {
      ...qq,
      options: order.map(i => qq.options[i]),
      correctIndex: order.indexOf(qq.correctIndex),
    };
  });
}

const levelFromXp = (xp: number) => Math.floor(xp / 100) + 1;

async function getStudentRecord(userId: string) {
  const student = await prisma.student.findUnique({ where: { id: userId } });
  if (!student) throw notFound('Student record not found');
  return student;
}

// ─── Student router ───────────────────────────────────────────────────────────
export const studentLearningRouter = Router();
studentLearningRouter.use(requireAuth, requireRole('student'));

studentLearningRouter.get('/daily', async (req, res) => {
  const student = await getStudentRecord(req.user!.id);
  const date = todayISO();
  const [questions, existingSession] = await Promise.all([
    getDailyQuestions(student.id, student.class, date),
    prisma.learningSession.findUnique({ where: { studentId_date: { studentId: student.id, date } } }),
  ]);

  res.json({
    date,
    questionSeconds: QUESTION_SECONDS,
    todayCompleted: !!existingSession,
    todayResult: existingSession ? { correct: existingSession.correct, total: existingSession.total, xpEarned: existingSession.xpEarned } : null,
    questions: questions.map(qq => ({
      id: qq.id,
      area: qq.area,
      emoji: qq.emoji,
      question: qq.question,
      options: qq.options,
    })),
  });
});

const submitSchema = z.object({
  answers: z.array(z.number().int().min(0)).min(1),
  durationSec: z.number().int().min(0).optional(),
});

studentLearningRouter.post('/submit', async (req, res) => {
  const { answers, durationSec } = submitSchema.parse(req.body);
  const student = await getStudentRecord(req.user!.id);
  const date = todayISO();

  // Block a second completion the same day; return the existing result.
  const existing = await prisma.learningSession.findUnique({
    where: { studentId_date: { studentId: student.id, date } },
  });
  if (existing) {
    const streak = await prisma.studentStreak.findUnique({ where: { studentId: student.id } });
    res.json({
      alreadyCompleted: true,
      correct: existing.correct,
      total: existing.total,
      xpEarned: existing.xpEarned,
      currentStreak: streak?.currentStreak ?? 0,
      newBadges: [],
    });
    return;
  }

  const questions = await getDailyQuestions(student.id, student.class, date);
  if (answers.length !== questions.length) {
    throw badRequest('Answer count does not match the daily task');
  }

  let correct = 0;
  questions.forEach((qq, i) => {
    if (answers[i] === qq.correctIndex) correct++;
  });
  const total = questions.length;
  const perfect = correct === total;
  const xpEarned = correct * XP_PER_CORRECT + (perfect ? PERFECT_BONUS : 0);

  // Streak update
  const prevStreak = await prisma.studentStreak.findUnique({ where: { studentId: student.id } });
  const yesterday = yesterdayISO();
  let newStreak: number;
  if (!prevStreak || !prevStreak.lastActivityDate) {
    newStreak = 1;
  } else if (prevStreak.lastActivityDate === yesterday) {
    newStreak = prevStreak.currentStreak + 1;
  } else if (prevStreak.lastActivityDate === date) {
    newStreak = prevStreak.currentStreak; // already active today (shouldn't happen)
  } else {
    newStreak = 1;
  }

  const baseXp = prevStreak?.totalXp ?? 0;
  const basePerfect = prevStreak?.perfectCount ?? 0;
  const newTotalXp = baseXp + xpEarned;
  const newPerfectCount = basePerfect + (perfect ? 1 : 0);
  const longest = Math.max(prevStreak?.longestStreak ?? 0, newStreak);

  await prisma.$transaction([
    prisma.studentStreak.upsert({
      where: { studentId: student.id },
      update: { currentStreak: newStreak, longestStreak: longest, totalXp: newTotalXp, perfectCount: newPerfectCount, lastActivityDate: date },
      create: { studentId: student.id, currentStreak: newStreak, longestStreak: longest, totalXp: newTotalXp, perfectCount: newPerfectCount, lastActivityDate: date },
    }),
    prisma.learningSession.create({
      data: { studentId: student.id, date, correct, total, xpEarned, durationSec: durationSec ?? 0 },
    }),
  ]);

  // Badge evaluation
  const sessionCount = await prisma.learningSession.count({ where: { studentId: student.id } });
  const allBadges = await prisma.badge.findMany();
  const earned = await prisma.studentBadge.findMany({ where: { studentId: student.id } });
  const earnedIds = new Set(earned.map(e => e.badgeId));

  const qualifies = (b: { criterionType: string; criterionValue: number }) => {
    if (b.criterionType === 'first') return sessionCount >= b.criterionValue;
    if (b.criterionType === 'streak') return newStreak >= b.criterionValue;
    if (b.criterionType === 'xp') return newTotalXp >= b.criterionValue;
    if (b.criterionType === 'perfect') return newPerfectCount >= b.criterionValue;
    return false;
  };

  const newBadges = allBadges.filter(b => !earnedIds.has(b.id) && qualifies(b));
  if (newBadges.length > 0) {
    await prisma.$transaction([
      ...newBadges.map(b => prisma.studentBadge.create({ data: { studentId: student.id, badgeId: b.id } })),
      ...newBadges.map(b => prisma.notification.create({
        data: {
          userId: student.id, role: 'STUDENT',
          title: 'New badge earned!',
          message: `You earned the ${b.name} badge ${b.emoji}. Keep up the great work!`,
          type: 'SUCCESS', kind: 'GENERAL',
        },
      })),
    ]);
  }

  res.json({
    alreadyCompleted: false,
    correct,
    total,
    perfect,
    xpEarned,
    currentStreak: newStreak,
    longestStreak: longest,
    totalXp: newTotalXp,
    level: levelFromXp(newTotalXp),
    newBadges: newBadges.map(b => ({ id: b.id, code: b.code, name: b.name, emoji: b.emoji, description: b.description })),
  });
});

studentLearningRouter.get('/progress', async (req, res) => {
  const student = await getStudentRecord(req.user!.id);
  const date = todayISO();
  const [streak, earnedBadges, allBadges, sessions, todaySession] = await Promise.all([
    prisma.studentStreak.findUnique({ where: { studentId: student.id } }),
    prisma.studentBadge.findMany({ where: { studentId: student.id }, orderBy: { earnedAt: 'asc' } }),
    prisma.badge.findMany(),
    prisma.learningSession.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'desc' },
      take: 14,
    }),
    prisma.learningSession.findUnique({ where: { studentId_date: { studentId: student.id, date } } }),
  ]);

  const badgeById = new Map(allBadges.map(b => [b.id, b]));
  const totalXp = streak?.totalXp ?? 0;
  res.json({
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    totalXp,
    level: levelFromXp(totalXp),
    perfectCount: streak?.perfectCount ?? 0,
    lastActivityDate: streak?.lastActivityDate ?? null,
    todayCompleted: !!todaySession,
    badges: earnedBadges
      .map(sb => {
        const b = badgeById.get(sb.badgeId);
        if (!b) return null;
        return {
          id: b.id, code: b.code, name: b.name, emoji: b.emoji,
          description: b.description, earnedAt: sb.earnedAt.toISOString(),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null),
    sessions: sessions.map(s => ({ date: s.date, correct: s.correct, total: s.total, xpEarned: s.xpEarned })),
  });
});

// ─── Teacher router: streak progress for their classes ────────────────────────
export const teacherStreakRouter = Router();
teacherStreakRouter.use(requireAuth, requireRole('teacher'));

teacherStreakRouter.get('/', async (req, res) => {
  const teacher = await prisma.teacher.findUnique({ where: { id: req.user!.id } });
  if (!teacher) throw notFound('Teacher record not found');

  const students = await prisma.student.findMany({
    where: { class: { in: teacher.classes } },
    orderBy: [{ class: 'asc' }, { rollNo: 'asc' }],
  });
  const ids = students.map(s => s.id);
  const today = todayISO();

  const [streaks, badgeCounts] = await Promise.all([
    prisma.studentStreak.findMany({ where: { studentId: { in: ids } } }),
    prisma.studentBadge.groupBy({ by: ['studentId'], where: { studentId: { in: ids } }, _count: { _all: true } }),
  ]);

  const streakMap = new Map(streaks.map(s => [s.studentId, s]));
  const badgeMap = new Map(badgeCounts.map(b => [b.studentId, b._count._all]));

  res.json({
    students: students.map(s => {
      const st = streakMap.get(s.id);
      const last = st?.lastActivityDate ?? null;
      const current = st?.currentStreak ?? 0;
      return {
        studentId: s.id,
        name: s.name,
        class: s.class,
        rollNo: s.rollNo,
        currentStreak: current,
        longestStreak: st?.longestStreak ?? 0,
        totalXp: st?.totalXp ?? 0,
        level: levelFromXp(st?.totalXp ?? 0),
        badgeCount: badgeMap.get(s.id) ?? 0,
        lastActivityDate: last,
        atRisk: current > 0 && last !== null && last < today,
      };
    }),
  });
});
