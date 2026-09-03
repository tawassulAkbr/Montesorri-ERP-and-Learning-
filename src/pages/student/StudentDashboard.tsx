import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, CalendarCheck, ClipboardList, TrendingUp, BookOpen, Award, ArrowUpRight, Sparkles, Flame, Trophy, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/shared/StatCard';
import { AiInsightsSection } from '@/components/ai/AiInsightsSection';
import { VideoCard } from '@/components/shared/VideoCard';
import { TestScoreBarChart, RadialProgress } from '@/components/shared/Charts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiveClassBanner } from '@/components/shared/LiveClassBanner';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { buildScoreChartData, formatDate } from '@/lib/utils';
import { apiGet } from '@/lib/api';
import type { LearningProgress } from '@/types';

export const StudentDashboard: React.FC = () => {
  const { lessons, tests, dailyWork, testResults, attendance, students } = useData();
  const { currentUser } = useAuth();
  const me = students.find(s => s.id === currentUser?.id);

  const recentLessons = lessons.slice(0, 2);
  const upcomingTests = tests.filter(t => t.status === 'upcoming' && (!me || t.class === me.class)).slice(0, 3);

  const myAttendance = useMemo(() => attendance.filter(a => a.studentId === currentUser?.id), [attendance, currentUser?.id]);
  const attendanceRate = myAttendance.length
    ? Math.round((myAttendance.filter(a => a.status === 'present').length / myAttendance.length) * 100)
    : 100;
  const scoreChart = useMemo(() => buildScoreChartData(testResults, currentUser?.id), [testResults, currentUser?.id]);

  const [streakInfo, setStreakInfo] = useState<LearningProgress | null>(null);
  useEffect(() => {
    apiGet<LearningProgress>('/students/learning/progress')
      .then(setStreakInfo)
      .catch(() => setStreakInfo(null));
  }, []);

  return (
    <div className="space-y-6">
      {/* Live Classroom Banner */}
      <LiveClassBanner />

      {/* Student Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#D7E7E4] bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#006B5D]">Montessori Student Portal</span>
          <h1 className="mt-1 text-2xl font-extrabold text-[#101828]">Hello, {currentUser?.name?.split(' ')[0]}! 🌟</h1>
          <p className="mt-1 text-xs font-medium text-[#667085]">
            {me?.class || 'Montessori'} • Roll #{me?.rollNo || '—'} • Age {me?.ageGroup || '—'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/student/live-class">
            <Button variant="secondary" size="sm" className="gap-1.5 rounded-xl bg-[#006B5D] text-xs font-bold text-white shadow-sm hover:bg-[#007A6B]">
              <Video size={15} /> Join Live Class
            </Button>
          </Link>
          <Link to="/student/schedule">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-[#D7E7E4] text-xs font-bold text-[#006B5D] shadow-sm hover:bg-[#E6F4F1]">
              <Sparkles size={15} /> Daily Routine
            </Button>
          </Link>
        </div>
      </div>

      {/* Gamified Learning Streak Widget */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-[#006B5D] p-5 text-white shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <Flame size={30} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{streakInfo?.currentStreak ?? 0}-day streak</span>
              {streakInfo && streakInfo.todayCompleted && (
                <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full">DONE TODAY ✓</span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-white/75">
              Level {streakInfo?.level ?? 1} · {streakInfo?.totalXp ?? 0} XP · {streakInfo?.badges.length ?? 0} badge{(streakInfo?.badges.length ?? 0) !== 1 ? 's' : ''} earned
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {streakInfo && streakInfo.badges.slice(0, 3).map(b => (
            <span key={b.id} title={b.name} className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-lg">
              {b.emoji}
            </span>
          ))}
          <Link to="/student/learning">
            <Button size="sm" className="gap-1.5 rounded-xl bg-[#D9531E] text-xs font-bold text-white shadow-sm hover:bg-[#C85A32]">
              {streakInfo?.todayCompleted ? <><Trophy size={14} /> View Progress</> : <><Play size={14} /> Play Today's Task</>}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Roll Call Rate"
          value={`${attendanceRate}%`}
          subtitle="Montessori circle attendance"
          icon={<CalendarCheck className="text-[#006B5D]" size={20} />}
          iconBg="bg-[#E6F4F1]"
        />
        <StatCard
          title="Video Lessons"
          value={lessons.length}
          subtitle="Phonics & rhymes"
          icon={<Video className="text-[#006B5D]" size={20} />}
          iconBg="bg-[#E6F4F1]"
        />
        <StatCard
          title="Upcoming Milestones"
          value={upcomingTests.length}
          subtitle="Sensorial & motor checks"
          icon={<ClipboardList className="text-[#006B5D]" size={20} />}
          iconBg="bg-[#E6F4F1]"
        />
        <StatCard
          title="Milestone Standing"
          value="Mastered 🌟"
          subtitle="Letter sounds & counting"
          icon={<Award className="text-amber-600" size={20} />}
          trend={5}
          iconBg="bg-amber-50"
        />
      </div>

      <AiInsightsSection />

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Learning Area Performance</CardTitle>
              <p className="text-xs text-[#667085]">Comparing your developmental progress against cohort averages</p>
            </div>
            <Link to="/student/reports" className="text-xs text-[#006B5D] font-medium flex items-center gap-1">
              Full Evaluation <ArrowUpRight size={14} />
            </Link>
          </CardHeader>
          <CardContent>
            <TestScoreBarChart data={scoreChart} height={220} />
          </CardContent>
        </Card>

        {/* Circular Attendance Metric */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold">Attendance Health</CardTitle>
            <p className="text-xs text-[#667085]">Montessori roll call record</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <RadialProgress value={attendanceRate} label="Circle Attendance" color="#006B5D" />
            <p className="text-xs text-[#667085] text-center mt-2">
              Consistent morning circle routine helps social development!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Lectures & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Latest Video Lessons</CardTitle>
            <Link to="/student/lectures" className="text-xs text-[#006B5D] font-medium">
              View All
            </Link>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentLessons.map(lesson => (
              <VideoCard key={lesson.id} lesson={lesson} />
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Milestones */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Upcoming Developmental Milestones</CardTitle>
              <Link to="/student/tests" className="text-xs text-[#006B5D] font-medium">
                View Milestones
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {upcomingTests.map(test => (
                <div key={test.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-[#101828]">{test.title}</p>
                    <p className="text-[10px] text-[#667085]">{test.subject} • {test.class}</p>
                  </div>
                  <Badge variant="outline" className="bg-white text-[#006B5D] border-[#B7DDD6] text-xs">
                    {formatDate(test.date)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
