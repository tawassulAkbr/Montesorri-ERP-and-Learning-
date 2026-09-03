import { useCallback, useEffect, useRef, useState } from 'react';
import { Flame, Trophy, Star, Clock, Sparkles, CheckCircle2, Zap, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { apiGet, apiPost } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { DailyTask, LearningProgress, SubmitResult } from '@/types';

type View = 'landing' | 'quiz' | 'result';

const TIMEOUT_SENTINEL = 9999;

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function formatHM(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export const StudentLearningPage: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [task, setTask] = useState<DailyTask | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<SubmitResult | null>(null);

  // streak countdown (landing)
  const [streakMs, setStreakMs] = useState(msUntilMidnight());

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [t, p] = await Promise.all([
        apiGet<DailyTask>('/students/learning/daily'),
        apiGet<LearningProgress>('/students/learning/progress'),
      ]);
      setTask(t);
      setProgress(p);
    } catch (err) {
      console.error('Failed to load learning data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Landing countdown ticks
  useEffect(() => {
    if (view !== 'landing') return;
    const id = setInterval(() => setStreakMs(msUntilMidnight()), 30000);
    return () => clearInterval(id);
  }, [view]);

  // Per-question countdown
  useEffect(() => {
    if (view !== 'quiz' || revealed) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, timeLeft, revealed]);

  // Elapsed timer
  useEffect(() => {
    if (view !== 'quiz') return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [view]);

  const startQuiz = () => {
    if (!task) return;
    setCurrentIdx(0);
    setSelected(null);
    setRevealed(false);
    setAnswers([]);
    setElapsed(0);
    setTimeLeft(task.questionSeconds);
    setView('quiz');
  };

  const goTo = (idx: number, accumulated: number[]) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (idx >= (task?.questions.length ?? 0)) {
      finishQuiz(accumulated);
      return;
    }
    setCurrentIdx(idx);
    setSelected(null);
    setRevealed(false);
    setTimeLeft(task?.questionSeconds ?? 30);
  };

  const handleChoose = (optIdx: number) => {
    if (revealed || !task) return;
    setSelected(optIdx);
    setRevealed(true);
    const next = [...answers, optIdx];
    setAnswers(next);
    advanceTimer.current = setTimeout(() => goTo(currentIdx + 1, next), 1000);
  };

  const handleTimeout = () => {
    if (revealed || !task) return;
    setSelected(TIMEOUT_SENTINEL);
    setRevealed(true);
    const next = [...answers, TIMEOUT_SENTINEL];
    setAnswers(next);
    advanceTimer.current = setTimeout(() => goTo(currentIdx + 1, next), 900);
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    try {
      const res = await apiPost<SubmitResult>('/students/learning/submit', {
        answers: finalAnswers,
        durationSec: elapsed,
      });
      setResult(res);
      setView('result');
      await loadAll();
    } catch (err) {
      console.error('Submit failed:', err);
      setView('landing');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card><CardContent className="py-16 text-center text-sm text-[#667085]">Loading your learning adventure...</CardContent></Card>
      </div>
    );
  }

  const questions = task?.questions ?? [];
  const currentQ = questions[currentIdx];
  const level = progress?.level ?? 1;
  const xpIntoLevel = (progress?.totalXp ?? 0) % 100;

  // ───────────────────────── QUIZ VIEW ─────────────────────────
  if (view === 'quiz' && currentQ) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Progress + timers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#344054]">
            <span>Question {currentIdx + 1} / {questions.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#667085]">
              <Clock size={13} /> {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
            </span>
            <span className={cn(
              'inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full',
              timeLeft <= 5 ? 'bg-red-50 text-red-600' : timeLeft <= 10 ? 'bg-amber-50 text-amber-600' : 'bg-[#E6F4F1] text-[#006B5D]'
            )}>
              <Zap size={12} /> {timeLeft}s
            </span>
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#006B5D] rounded-full transition-all duration-500"
            style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-5">
              {currentQ.emoji && <div className="text-5xl mb-3">{currentQ.emoji}</div>}
              <span className="inline-block text-[11px] font-semibold text-[#006B5D] bg-[#E6F4F1] px-2 py-0.5 rounded-full mb-2">{currentQ.area}</span>
              <h2 className="text-xl font-bold text-[#101828]">{currentQ.question}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt, i) => {
                const isChosen = selected === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleChoose(i)}
                    disabled={revealed}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left text-sm font-semibold transition-all',
                      revealed && isChosen
                        ? 'border-[#006B5D] bg-[#E6F4F1] text-[#006B5D]'
                        : revealed
                          ? 'border-slate-100 bg-slate-50 text-[#667085]'
                          : selected === TIMEOUT_SENTINEL
                            ? 'border-slate-100 bg-slate-50 text-[#667085]'
                            : 'border-slate-200 bg-white text-[#344054] hover:border-[#B7DDD6] hover:bg-[#E6F4F1]/50'
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div className={cn(
                'mt-4 text-center text-sm font-bold flex items-center justify-center gap-2',
                selected === TIMEOUT_SENTINEL ? 'text-amber-600' : 'text-[#006B5D]'
              )}>
                {selected === TIMEOUT_SENTINEL ? (
                  <><Clock size={16} /> Time's up! Moving on...</>
                ) : (
                  <><CheckCircle2 size={16} /> Locked in!</>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ───────────────────────── RESULT VIEW ─────────────────────────
  if (view === 'result' && result) {
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-[#006B5D] to-[#007A6B] p-6 text-center text-white">
            <div className="text-5xl mb-2">{result.perfect ? '🏆' : result.correct >= result.total / 2 ? '🎉' : '💪'}</div>
            <h2 className="text-2xl font-bold">
              {result.perfect ? 'Perfect Round!' : result.correct >= result.total / 2 ? 'Great Job!' : 'Keep Practising!'}
            </h2>
            <p className="text-[#006B5D] text-sm mt-1">You scored {result.correct} out of {result.total}</p>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#E6F4F1] rounded-xl p-3">
                <Zap className="mx-auto text-[#006B5D] mb-1" size={18} />
                <p className="text-lg font-bold text-[#006B5D]">+{result.xpEarned}</p>
                <p className="text-[10px] text-[#667085]">XP earned</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3">
                <Flame className="mx-auto text-orange-500 mb-1" size={18} />
                <p className="text-lg font-bold text-orange-600">{result.currentStreak}</p>
                <p className="text-[10px] text-[#667085]">Day streak</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <Star className="mx-auto text-amber-500 mb-1" size={18} />
                <p className="text-lg font-bold text-amber-600">Lv {result.level ?? level}</p>
                <p className="text-[10px] text-[#667085]">Level</p>
              </div>
            </div>

            {result.newBadges.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-bold text-amber-700 flex items-center gap-2 mb-2">
                  <Trophy size={16} /> New badge{result.newBadges.length > 1 ? 's' : ''} earned!
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.newBadges.map(b => (
                    <span key={b.id} className="inline-flex items-center gap-1.5 bg-white border border-amber-200 rounded-full px-3 py-1.5 text-xs font-semibold text-[#344054]">
                      <span className="text-base">{b.emoji}</span> {b.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full gap-2" onClick={() => setView('landing')}>
              <RotateCcw size={15} /> Back to My Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ───────────────────────── LANDING VIEW ─────────────────────────
  const alreadyDone = task?.todayCompleted ?? false;
  const streakAtRisk = !alreadyDone && (progress?.currentStreak ?? 0) > 0;
  const urgent = streakMs < 60 * 60 * 1000;
  const warning = !urgent && streakMs < 3 * 60 * 60 * 1000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">My Learning Adventure</h1>
          <p className="text-sm text-[#667085]">Play a quick game every day to grow your streak!</p>
        </div>
      </div>

      {/* Streak deadline alert */}
      {!alreadyDone && (
        <div className={cn(
          'flex items-center gap-3 p-4 rounded-xl border',
          urgent ? 'bg-red-50 border-red-200' : warning ? 'bg-amber-50 border-amber-200' : 'bg-[#E6F4F1] border-[#B7DDD6]'
        )}>
          <Flame className={urgent ? 'text-red-500' : warning ? 'text-amber-500' : 'text-[#006B5D]'} size={22} />
          <div className="flex-1">
            <p className={cn('text-sm font-bold', urgent ? 'text-red-700' : warning ? 'text-amber-700' : 'text-[#006B5D]')}>
              {streakAtRisk ? `Keep your ${progress?.currentStreak}-day streak alive!` : 'Start your streak today!'}
            </p>
            <p className="text-xs text-[#667085]">{formatHM(streakMs)} left today — complete your task before midnight.</p>
          </div>
          <Clock className={urgent ? 'text-red-500' : warning ? 'text-amber-500' : 'text-[#006B5D]'} size={20} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Streak + play card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Flame className="text-orange-500" size={16} /> Daily Streak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-orange-500 flex items-center justify-center gap-2">
                <Flame size={40} className="text-orange-500" /> {progress?.currentStreak ?? 0}
              </div>
              <p className="text-xs text-[#667085] mt-1">day streak · best {progress?.longestStreak ?? 0}</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#344054] flex items-center gap-1"><Star size={12} className="text-amber-500" /> Level {level}</span>
                <span className="text-[#667085]">{progress?.totalXp ?? 0} XP</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${xpIntoLevel}%` }} />
              </div>
              <p className="text-[10px] text-[#667085] mt-1">{100 - xpIntoLevel} XP to Level {level + 1}</p>
            </div>

            {alreadyDone ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <CheckCircle2 className="mx-auto text-emerald-600 mb-1" size={20} />
                <p className="text-sm font-bold text-emerald-700">Task complete!</p>
                <p className="text-xs text-[#667085] mt-0.5">
                  {task?.todayResult ? `${task.todayResult.correct}/${task.todayResult.total} correct · +${task.todayResult.xpEarned} XP` : 'Come back tomorrow!'}
                </p>
              </div>
            ) : (
              <Button className="w-full gap-2" onClick={startQuiz} disabled={questions.length === 0}>
                <Play size={16} /> {questions.length > 0 ? `Play Today's Task (${questions.length} questions)` : 'No questions yet'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Trophy className="text-amber-500" size={16} /> My Badges</CardTitle>
          </CardHeader>
          <CardContent>
            {progress && progress.badges.length === 0 ? (
              <p className="text-xs text-[#667085] py-6 text-center">Complete tasks to earn your first badge!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(progress?.badges ?? []).map(b => (
                  <div key={b.id} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 text-center">
                    <div className="text-3xl mb-1">{b.emoji}</div>
                    <p className="text-xs font-bold text-[#344054]">{b.name}</p>
                    <p className="text-[10px] text-[#667085] mt-0.5 leading-snug">{b.description}</p>
                  </div>
                ))}
              </div>
            )}

            {progress && progress.sessions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-[#667085] mb-2">Recent activity</p>
                <div className="flex flex-wrap gap-2">
                  {progress.sessions.slice(0, 7).map(s => (
                    <span key={s.date} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1 text-[#344054]">
                      <Sparkles size={11} className="text-[#006B5D]" /> {s.date.slice(5)} · {s.correct}/{s.total}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
