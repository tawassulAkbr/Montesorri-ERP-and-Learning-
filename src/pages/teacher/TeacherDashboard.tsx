import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Video, ClipboardList, TrendingUp, Plus, CalendarCheck, MessageSquare, ArrowUpRight, Radio, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/shared/StatCard';
import { AttendanceAreaChart, ClassPerformancePieChart } from '@/components/shared/Charts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiveClassBanner } from '@/components/shared/LiveClassBanner';
import { useData } from '@/context/DataContext';
import { attendanceChartData, classPerformanceData } from '@/data/mockData';
import { formatDate } from '@/lib/utils';

export const TeacherDashboard: React.FC = () => {
  const { students, lessons, tests, dailyWork, leaveRequests, liveClass, startLiveClass } = useData();
  const [activeClass, setActiveClass] = useState('Junior Montessori (Nursery)');

  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const upcomingTests = tests.filter(t => t.status === 'upcoming').slice(0, 3);
  const recentWork = dailyWork.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Live Class Banner if Active */}
      <LiveClassBanner />

      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Montessori Teacher Console</h1>
          <p className="text-sm text-slate-500">Welcome, Maria Montessori. Manage sensorial work, phonics lessons, and live online classes.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={activeClass}
            onChange={e => setActiveClass(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none shadow-sm cursor-pointer"
          >
            <option>Montessori Toddler (Playgroup)</option>
            <option>Junior Montessori (Nursery)</option>
            <option>Senior Montessori (Prep)</option>
          </select>

          <Link to="/teacher/live-class">
            <Button size="sm" className="gap-1.5 shadow-sm bg-red-600 hover:bg-red-700 text-white font-bold text-xs">
              <Radio size={14} className="animate-pulse" /> Launch Live Teaching
            </Button>
          </Link>

          <Link to="/teacher/lessons">
            <Button variant="outline" size="sm" className="gap-1.5 shadow-sm text-xs">
              <Plus size={14} /> Upload Lesson
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Montessori Toddlers"
          value={students.length}
          subtitle="Enrolled in active cohorts"
          icon={<Users className="text-indigo-600" size={20} />}
          trend={6}
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Video Lectures"
          value={lessons.length}
          subtitle="Phonics & sensorial videos"
          icon={<Video className="text-emerald-600" size={20} />}
          trend={12}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Pending Leaves"
          value={pendingLeaves.length}
          subtitle="Awaiting teacher review"
          icon={<CalendarCheck className="text-sky-600" size={20} />}
          iconBg="bg-sky-50"
        />
        <StatCard
          title="Milestone Mastery"
          value="91.5%"
          subtitle="Sensorial & motor development"
          icon={<Sparkles className="text-amber-600" size={20} />}
          trend={4.2}
          iconBg="bg-amber-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Montessori Attendance Volume (30 Days)</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Present vs Absent trend for {activeClass}</p>
            </div>
            <Link to="/teacher/attendance" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              Details <ArrowUpRight size={14} />
            </Link>
          </CardHeader>
          <CardContent>
            <AttendanceAreaChart data={attendanceChartData} height={230} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Developmental Progress</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Milestone attainment breakdown</p>
          </CardHeader>
          <CardContent>
            <ClassPerformancePieChart data={classPerformanceData} height={230} />
          </CardContent>
        </Card>
      </div>

      {/* Actionable Tables / Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Daily Work */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Montessori Activity Posts</CardTitle>
            <Link to="/teacher/daily-work">
              <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentWork.map(work => (
              <div key={work.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {work.teacherSubject.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800">{work.teacherSubject}</span>
                    <span className="text-[11px] text-slate-400">{formatDate(work.postedAt)}</span>
                  </div>
                  <div
                    className="text-xs text-slate-600 line-clamp-2 mt-1"
                    dangerouslySetInnerHTML={{ __html: work.content }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Leave Requests */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Pending Leave Applications ({pendingLeaves.length})</CardTitle>
              <Link to="/teacher/attendance" className="text-xs text-indigo-600 font-medium">Review</Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {pendingLeaves.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No pending leave requests.</p>
              ) : (
                pendingLeaves.slice(0, 2).map(req => (
                  <div key={req.id} className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-lg text-xs">
                    <div className="flex justify-between items-center font-semibold text-slate-800">
                      <span>{req.studentName}</span>
                      <Badge variant="outline" className="text-[10px] bg-white border-amber-300 text-amber-700">Pending</Badge>
                    </div>
                    <p className="text-slate-600 mt-1 line-clamp-1">{req.reason}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(req.fromDate)} – {formatDate(req.toDate)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Upcoming Milestones</CardTitle>
              <Link to="/teacher/tests" className="text-xs text-indigo-600 font-medium">All Milestones</Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {upcomingTests.map(test => (
                <div key={test.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{test.title}</p>
                    <p className="text-[10px] text-slate-400">{test.subject} • {test.class}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                    {formatDate(test.date)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
