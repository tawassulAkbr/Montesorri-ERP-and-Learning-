import { useMemo } from 'react';
import { Users, GraduationCap, Heart, BookMarked, UserPlus, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/shared/StatCard';
import { AttendanceAreaChart, ClassPerformancePieChart } from '@/components/shared/Charts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeaveRequestCard } from '@/components/shared/LeaveModal';
import { useData } from '@/context/DataContext';
import { buildAttendanceChartData, buildClassPerformanceData, MONTESSORI_CLASSES } from '@/lib/utils';

export const AdminDashboard: React.FC = () => {
  const {
    teachers, students, parents, attendance, testResults,
    notifications, leaveRequests, updateLeaveStatus,
  } = useData();

  const attendanceChart = useMemo(() => buildAttendanceChartData(attendance), [attendance]);
  const performanceChart = useMemo(() => buildClassPerformanceData(testResults), [testResults]);

  const adminNotifications = notifications.filter(n => n.userId === 'a1').slice(0, 6);
  const pendingLeaves = leaveRequests
    .filter(l => l.status === 'pending')
    .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'teacher' ? -1 : 1));
  const feeDueCount = students.filter(s => s.feeDue).length;
  const activeClasses = MONTESSORI_CLASSES.filter(c => students.some(s => s.class === c));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Administrator Console</h1>
          <p className="text-sm text-slate-500">School-wide metrics, account administration, and leave approvals</p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/users">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <UserPlus size={15} /> Add Teacher / Student
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Teachers"
          value={teachers.length}
          subtitle="Active faculty staff"
          icon={<GraduationCap className="text-indigo-600" size={20} />}
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Total Students"
          value={students.length}
          subtitle={feeDueCount > 0 ? `${feeDueCount} with fee due` : 'Enrolled across classes'}
          icon={<Users className="text-emerald-600" size={20} />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Registered Parents"
          value={parents.length}
          subtitle="Connected guardians"
          icon={<Heart className="text-sky-600" size={20} />}
          iconBg="bg-sky-50"
        />
        <StatCard
          title="Active Classes"
          value={activeClasses.length}
          subtitle={activeClasses.map(c => c.split(' (')[0]).join(', ')}
          icon={<BookMarked className="text-violet-600" size={20} />}
          iconBg="bg-violet-50"
        />
      </div>

      {/* Pending Leave Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Leave Requests
            {pendingLeaves.length > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {pendingLeaves.length} pending
              </Badge>
            )}
          </CardTitle>
          <p className="text-xs text-slate-400">Teacher & student leaves — accepting marks attendance as leave</p>
        </CardHeader>
        <CardContent>
          {pendingLeaves.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No pending leave requests. All caught up!</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {pendingLeaves.map(leave => (
                <LeaveRequestCard
                  key={leave.id}
                  leave={leave}
                  showActions
                  onAccept={id => updateLeaveStatus(id, 'accepted', 'a1')}
                  onReject={id => updateLeaveStatus(id, 'rejected', 'a1')}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Milestone Grade Distribution</CardTitle>
            <p className="text-xs text-slate-400">All evaluated milestone results across classes</p>
          </CardHeader>
          <CardContent>
            <ClassPerformancePieChart data={performanceChart} height={240} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">School Attendance (30 Days)</CardTitle>
            <p className="text-xs text-slate-400">Daily student present vs absent counts</p>
          </CardHeader>
          <CardContent>
            <AttendanceAreaChart data={attendanceChart} height={240} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Log & Quick Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Notifications & Activity Feed</CardTitle>
            <Badge variant="outline" className="text-xs">Live Logs</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {feeDueCount > 0 && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-700">Fee collection pending</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {feeDueCount} student{feeDueCount > 1 ? 's have' : ' has'} unpaid fees. Mark them in the Users Directory.
                  </p>
                </div>
                <Link to="/admin/users" className="text-[10px] font-bold text-red-600 underline whitespace-nowrap">Review</Link>
              </div>
            )}
            {adminNotifications.length === 0 && feeDueCount === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent activity.</p>
            ) : (
              adminNotifications.map(n => (
                <div key={n.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400">{n.createdAt.split('T')[0]}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Administrative Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Link to="/admin/users" className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-slate-800 block">Manage Users Directory</span>
              <span className="text-[11px] text-slate-400">Create teacher & student accounts, issue credentials</span>
            </Link>
            <Link to="/admin/classes" className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-slate-800 block">Class Cohorts & Curriculum</span>
              <span className="text-[11px] text-slate-400">Assign teachers and manage schedules</span>
            </Link>
            <Link to="/admin/reports" className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-slate-800 block">School Performance Reports</span>
              <span className="text-[11px] text-slate-400">Analyze overall academic standings</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
