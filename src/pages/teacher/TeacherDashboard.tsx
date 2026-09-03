import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Video, ClipboardList, TrendingUp, Plus, CalendarCheck, MessageSquare, ArrowUpRight, Radio, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/shared/StatCard';
import { AiInsightsSection } from '@/components/ai/AiInsightsSection';
import { AttendanceAreaChart, ClassPerformancePieChart } from '@/components/shared/Charts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiveClassBanner } from '@/components/shared/LiveClassBanner';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { buildAttendanceChartData, buildClassPerformanceData, formatDate } from '@/lib/utils';

export const TeacherDashboard: React.FC = () => {
  const { students, lessons, tests, dailyWork, leaveRequests, liveClass, startLiveClass, attendance, testResults } = useData();
  const { currentUser } = useAuth();
  const [activeClass, setActiveClass] = useState('Junior Montessori (Nursery)');

  const classStudentIds = useMemo(
    () => students.filter(s => s.class === activeClass).map(s => s.id),
    [students, activeClass]
  );
  const attendanceChart = useMemo(
    () => buildAttendanceChartData(attendance.filter(a => classStudentIds.includes(a.studentId))),
    [attendance, classStudentIds]
  );
  const performanceChart = useMemo(() => buildClassPerformanceData(testResults), [testResults]);

  const mastery = useMemo(() => {
    if (testResults.length === 0) return null;
    const mastered = testResults.filter(r =>
      r.milestoneStatus ? r.milestoneStatus === 'Mastered' : r.grade === 'A+' || r.grade === 'A'
    ).length;
    return Math.round((mastered / testResults.length) * 100);
  }, [testResults]);

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
          <h1 className="text-2xl font-bold text-[#101828]">Montessori Teacher Console</h1>
          <p className="text-sm text-[#667085]">Welcome, {currentUser?.name}. Manage sensorial work, phonics lessons, and live online classes.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={activeClass}
            onChange={e => setActiveClass(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-[#344054] outline-none shadow-sm cursor-pointer"
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
          icon={<Users className="text-[#006B5D]" size={20} />}
          trend={6}
          iconBg="bg-[#E6F4F1]"
        />
        <StatCard
          title="Video Lectures"
          value={lessons.length}
          subtitle="Phonics & sensorial videos"
          icon={<Video className="text-[#006B5D]" size={20} />}
          trend={12}
          iconBg="bg-[#E6F4F1]"
        />
        <StatCard
          title="Pending Leaves"
          value={pendingLeaves.length}
          subtitle="Awaiting teacher review"
          icon={<CalendarCheck className="text-[#006B5D]" size={20} />}
          iconBg="bg-[#E6F4F1]"
        />
        <StatCard
          title="Milestone Mastery"
          value={mastery === null ? '—' : `${mastery}%`}
          subtitle="Mastered milestones across results"
          icon={<Sparkles className="text-amber-600" size={20} />}
          iconBg="bg-amber-50"
        />
      </div>

      <AiInsightsSection />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Montessori Attendance Volume (30 Days)</CardTitle>
              <p className="text-xs text-[#98A2B3] mt-0.5">Present vs Absent trend for {activeClass}</p>
            </div>
            <Link to="/teacher/attendance" className="text-xs text-[#006B5D] hover:text-[#007A6B] font-medium flex items-center gap-1">
              Details <ArrowUpRight size={14} />
            </Link>
          </CardHeader>
          <CardContent>
            <AttendanceAreaChart data={attendanceChart} height={230} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Developmental Progress</CardTitle>
            <p className="text-xs text-[#98A2B3] mt-0.5">Milestone attainment breakdown</p>
          </CardHeader>
          <CardContent>
            <ClassPerformancePieChart data={performanceChart} height={230} />
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
              <Button variant="ghost" size="sm" className="text-xs text-[#006B5D]">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentWork.map(work => (
              <div key={work.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E6F4F1] text-[#006B5D] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {work.teacherSubject.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#101828]">{work.teacherSubject}</span>
                    <span className="text-[11px] text-[#98A2B3]">{formatDate(work.postedAt)}</span>
                  </div>
                  <div
                    className="text-xs text-[#475467] line-clamp-2 mt-1"
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
              <Link to="/teacher/attendance" className="text-xs text-[#006B5D] font-medium">Review</Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {pendingLeaves.length === 0 ? (
                <p className="text-xs text-[#98A2B3] py-3 text-center">No pending leave requests.</p>
              ) : (
                pendingLeaves.slice(0, 2).map(req => (
                  <div key={req.id} className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-lg text-xs">
                    <div className="flex justify-between items-center font-semibold text-[#101828]">
                      <span>{req.kind === 'teacher' ? req.teacherName : req.studentName}</span>
                      <Badge variant="outline" className="text-[10px] bg-white border-amber-300 text-amber-700">Pending</Badge>
                    </div>
                    <p className="text-[#475467] mt-1 line-clamp-1">{req.reason}</p>
                    <p className="text-[10px] text-[#98A2B3] mt-1">{formatDate(req.fromDate)} – {formatDate(req.toDate)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Upcoming Milestones</CardTitle>
              <Link to="/teacher/tests" className="text-xs text-[#006B5D] font-medium">All Milestones</Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {upcomingTests.map(test => (
                <div key={test.id} className="flex items-center justify-between p-2.5 bg-[#F9FAFB] border border-[#F2F4F7] rounded-lg">
                  <div>
                    <p className="text-xs font-semibold text-[#101828]">{test.title}</p>
                    <p className="text-[10px] text-[#98A2B3]">{test.subject} • {test.class}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 bg-[#E6F4F1] text-[#006B5D] rounded">
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
