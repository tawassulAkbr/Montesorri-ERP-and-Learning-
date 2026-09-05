import { useMemo } from 'react';
import { Users, GraduationCap, Heart, BookMarked, UserPlus, AlertCircle, CheckCircle2, XCircle, CalendarOff, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/shared/StatCard';
import { AiInsightsSection } from '@/components/ai/AiInsightsSection';
import { AttendanceAreaChart, ClassPerformancePieChart, FeeCollectionPieChart } from '@/components/shared/Charts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeaveRequestCard } from '@/components/shared/LeaveModal';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { buildAttendanceChartData, buildClassPerformanceData, formatDate, formatPKR, MONTESSORI_CLASSES } from '@/lib/utils';

export const AdminDashboard: React.FC = () => {
  const {
    teachers, students, parents, attendance, testResults,
    notifications, leaveRequests, updateLeaveStatus, financeSummary,
    inventoryItems, lowStockCount,
  } = useData();
  const { currentUser } = useAuth();

  const attendanceChart = useMemo(() => buildAttendanceChartData(attendance), [attendance]);
  const performanceChart = useMemo(() => buildClassPerformanceData(testResults), [testResults]);

  const adminNotifications = notifications.filter(n => n.userId === currentUser?.id).slice(0, 6);
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending' && l.kind === 'teacher');
  const feeDueCount = students.filter(s => s.feeDue).length;
  const activeClasses = MONTESSORI_CLASSES.filter(c => students.some(s => s.class === c));

  // P/A/L attendance report: latest recorded day's status for every enrolled student.
  const palReport = useMemo(() => {
    if (attendance.length === 0 || students.length === 0) return null;
    const dates = [...new Set(attendance.map(a => a.date))].sort();
    const date = dates[dates.length - 1];
    const statusByStudent = new Map(attendance.filter(a => a.date === date).map(a => [a.studentId, a.status]));
    let present = 0, absent = 0, leave = 0;
    const absentees: string[] = [];
    const onLeave: string[] = [];
    for (const s of students) {
      const status = statusByStudent.get(s.id);
      if (status === 'present') present += 1;
      else if (status === 'absent') { absent += 1; absentees.push(s.name); }
      else if (status === 'leave') { leave += 1; onLeave.push(s.name); }
    }
    const unmarked = students.length - present - absent - leave;
    return { date, present, absent, leave, unmarked, absentees, onLeave };
  }, [attendance, students]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Administrator Console</h1>
          <p className="text-sm text-[#667085]">School-wide metrics, account administration, and leave approvals</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Teachers"
          value={teachers.length}
          subtitle="Active faculty staff"
          icon={<GraduationCap className="text-[#006B5D]" size={20} />}
          iconBg="bg-[#E6F4F1]"
        />
        <StatCard
          title="Total Students"
          value={students.length}
          subtitle={feeDueCount > 0 ? `${feeDueCount} with fee due` : 'Enrolled across classes'}
          icon={<Users className="text-[#006B5D]" size={20} />}
          iconBg="bg-[#E6F4F1]"
        />
        <StatCard
          title="Registered Parents"
          value={parents.length}
          subtitle="Connected guardians"
          icon={<Heart className="text-[#006B5D]" size={20} />}
          iconBg="bg-[#E6F4F1]"
        />
        <StatCard
          title="Active Classes"
          value={activeClasses.length}
          subtitle={activeClasses.map(c => c.split(' (')[0]).join(', ')}
          icon={<BookMarked className="text-[#006B5D]" size={20} />}
          iconBg="bg-[#E6F4F1]"
        />
        <StatCard
          title="Inventory Items"
          value={inventoryItems.length}
          subtitle={lowStockCount > 0 ? `${lowStockCount} low on stock` : 'All above minimum'}
          icon={<Package className={lowStockCount > 0 ? 'text-red-600' : 'text-[#006B5D]'} size={20} />}
          iconBg={lowStockCount > 0 ? 'bg-red-50' : 'bg-[#E6F4F1]'}
        />
      </div>

      <AiInsightsSection />

      {/* Teacher Leaves + Student Attendance (P/A/L) Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher Leave Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              Teacher Leave Requests
              {pendingLeaves.length > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {pendingLeaves.length} pending
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-[#98A2B3] text-right">Approving marks the teacher's attendance as leave</p>
          </CardHeader>
          <CardContent>
            {pendingLeaves.length === 0 ? (
              <p className="text-xs text-[#98A2B3] py-6 text-center">No pending teacher leave requests. All caught up!</p>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.map(leave => (
                  <LeaveRequestCard
                    key={leave.id}
                    leave={leave}
                    showActions
                    onAccept={id => updateLeaveStatus(id, 'accepted', currentUser?.id ?? '')}
                    onReject={id => updateLeaveStatus(id, 'rejected', currentUser?.id ?? '')}
                  />
                ))}
              </div>
            )}
            <p className="text-[11px] text-[#98A2B3] mt-4 pt-3 border-t border-slate-100">
              Student leave applications submitted by parents are reviewed by the class teacher in the Attendance portal.
            </p>
          </CardContent>
        </Card>

        {/* Student Attendance Report (P/A/L) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Student Attendance Report (P · A · L)</CardTitle>
            <p className="text-xs text-[#98A2B3] text-right">
              {palReport ? formatDate(palReport.date) : 'No data yet'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!palReport ? (
              <p className="text-xs text-[#98A2B3] py-6 text-center">No attendance has been recorded yet.</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#E6F4F1] border border-emerald-100 text-center">
                    <CheckCircle2 className="mx-auto text-[#006B5D]" size={20} />
                    <p className="text-2xl font-bold text-emerald-700 mt-1">{palReport.present}</p>
                    <p className="text-[11px] font-semibold text-[#006B5D]">Present</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-center">
                    <XCircle className="mx-auto text-red-600" size={20} />
                    <p className="text-2xl font-bold text-red-700 mt-1">{palReport.absent}</p>
                    <p className="text-[11px] font-semibold text-red-600">Absent</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                    <CalendarOff className="mx-auto text-amber-600" size={20} />
                    <p className="text-2xl font-bold text-amber-700 mt-1">{palReport.leave}</p>
                    <p className="text-[11px] font-semibold text-amber-600">On Leave</p>
                  </div>
                </div>

                {(palReport.absentees.length > 0 || palReport.onLeave.length > 0) && (
                  <div className="space-y-2">
                    {palReport.absentees.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-red-50/50 border border-red-100">
                        <p className="text-[11px] font-bold text-red-700 mb-1">Absent today</p>
                        <p className="text-[11px] text-red-600">{palReport.absentees.join(', ')}</p>
                      </div>
                    )}
                    {palReport.onLeave.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100">
                        <p className="text-[11px] font-bold text-amber-700 mb-1">On approved leave</p>
                        <p className="text-[11px] text-amber-600">{palReport.onLeave.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-[#98A2B3]">
                  {palReport.unmarked > 0
                    ? `${palReport.unmarked} student${palReport.unmarked > 1 ? 's' : ''} not yet marked for this day.`
                    : `All ${students.length} students accounted for on this day.`}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Milestone Grade Distribution</CardTitle>
            <p className="text-xs text-[#98A2B3]">All evaluated milestone results across classes</p>
          </CardHeader>
          <CardContent>
            <ClassPerformancePieChart data={performanceChart} height={240} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">School Attendance (30 Days)</CardTitle>
            <p className="text-xs text-[#98A2B3]">Daily student present vs absent counts</p>
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
              <div className="p-4 bg-white border border-[#EAECF0] rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-amber-500" />
                  <p className="text-sm font-bold text-[#101828]">Outstanding fees</p>
                </div>
                <p className="text-xs text-[#667085] mb-4">
                  {formatPKR(financeSummary?.outstandingAmount ?? 0)} is pending across {feeDueCount} student(s).{' '}
                  <Link to="/admin/finance" className="text-[#006B5D] font-bold">Review</Link>
                </p>
                <div className="mx-auto w-full max-w-[200px]">
                  <FeeCollectionPieChart collected={students.length - feeDueCount} outstanding={feeDueCount} />
                </div>
              </div>
            )}
            {adminNotifications.length === 0 && feeDueCount === 0 ? (
              <p className="text-xs text-[#98A2B3] py-6 text-center">No recent activity.</p>
            ) : (
              adminNotifications.map(n => (
                <div key={n.id} className="p-3 bg-[#F9FAFB] border border-[#F2F4F7] rounded-2xl flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#E6F4F1]0 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#101828]">{n.title}</p>
                    <p className="text-xs text-[#667085] mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-[#98A2B3]">{n.createdAt.split('T')[0]}</span>
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
            <Link to="/admin/users" className="block p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-[#101828] block">Manage Users Directory</span>
              <span className="text-[11px] text-[#98A2B3]">Create teacher & student accounts, issue credentials</span>
            </Link>
            <Link to="/admin/finance" className="block p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-[#101828] block">Finance & Fee Collection</span>
              <span className="text-[11px] text-[#98A2B3]">
                {formatPKR(financeSummary?.collectedThisMonth ?? 0)} collected this month · issue receipts
              </span>
            </Link>
            <Link to="/admin/inventory" className="block p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-[#101828] block">Inventory & Supplies</span>
              <span className="text-[11px] text-[#98A2B3]">
                {inventoryItems.length} tracked items
                {lowStockCount > 0 ? ` · ${lowStockCount} need reordering` : ' · stock levels healthy'}
              </span>
            </Link>
            <Link to="/admin/classes" className="block p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-[#101828] block">Class Cohorts & Curriculum</span>
              <span className="text-[11px] text-[#98A2B3]">Assign teachers and manage schedules</span>
            </Link>
            <Link to="/admin/reports" className="block p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-[#101828] block">School Performance Reports</span>
              <span className="text-[11px] text-[#98A2B3]">Analyze overall academic standings</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
