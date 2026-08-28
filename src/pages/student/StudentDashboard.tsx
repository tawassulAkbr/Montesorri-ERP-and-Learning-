import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Video, CalendarCheck, ClipboardList, TrendingUp, BookOpen, Award, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/shared/StatCard';
import { VideoCard } from '@/components/shared/VideoCard';
import { TestScoreBarChart, RadialProgress } from '@/components/shared/Charts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiveClassBanner } from '@/components/shared/LiveClassBanner';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { buildScoreChartData, formatDate } from '@/lib/utils';

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

  return (
    <div className="space-y-6">
      {/* Live Classroom Banner */}
      <LiveClassBanner />

      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-indigo-200 font-bold">Montessori Student Portal</span>
          <h1 className="text-2xl font-bold mt-1">Hello, {currentUser?.name?.split(' ')[0]}! 🌟</h1>
          <p className="text-xs text-indigo-100 mt-1">
            {me?.class || 'Montessori'} • Roll #{me?.rollNo || '—'} • Age {me?.ageGroup || '—'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/student/live-class">
            <Button variant="secondary" size="sm" className="gap-1.5 shadow-sm text-xs font-bold text-indigo-700 bg-white hover:bg-slate-100">
              <Video size={15} /> Join Live Class
            </Button>
          </Link>
          <Link to="/student/schedule">
            <Button variant="outline" size="sm" className="gap-1.5 shadow-sm text-xs border-white/30 text-white hover:bg-white/10">
              <Sparkles size={15} /> Daily Routine
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
          icon={<CalendarCheck className="text-emerald-600" size={20} />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Video Lessons"
          value={lessons.length}
          subtitle="Phonics & rhymes"
          icon={<Video className="text-indigo-600" size={20} />}
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Upcoming Milestones"
          value={upcomingTests.length}
          subtitle="Sensorial & motor checks"
          icon={<ClipboardList className="text-sky-600" size={20} />}
          iconBg="bg-sky-50"
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

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Learning Area Performance</CardTitle>
              <p className="text-xs text-slate-400">Comparing your developmental progress against cohort averages</p>
            </div>
            <Link to="/student/reports" className="text-xs text-indigo-600 font-medium flex items-center gap-1">
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
            <p className="text-xs text-slate-400">Montessori roll call record</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <RadialProgress value={attendanceRate} label="Circle Attendance" color="#10B981" />
            <p className="text-xs text-slate-500 text-center mt-2">
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
            <Link to="/student/lectures" className="text-xs text-indigo-600 font-medium">
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
              <Link to="/student/tests" className="text-xs text-indigo-600 font-medium">
                View Milestones
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {upcomingTests.map(test => (
                <div key={test.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{test.title}</p>
                    <p className="text-[10px] text-slate-400">{test.subject} • {test.class}</p>
                  </div>
                  <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-200 text-xs">
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
