import { useMemo, useState } from 'react';
import { CalendarCheck, MessageSquare, ArrowUpRight, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/shared/StatCard';
import { AiInsightsSection } from '@/components/ai/AiInsightsSection';
import { AttendanceAreaChart } from '@/components/shared/Charts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubmitLeaveModal } from '@/components/shared/LeaveModal';
import { LiveClassBanner } from '@/components/shared/LiveClassBanner';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { buildAttendanceChartData, formatDate, getInitials } from '@/lib/utils';

export const ParentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { students, remarks, leaveRequests, teachers, applyLeave, attendance } = useData();
  const myChildren = students.filter(s => s.parentId === currentUser?.id);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [openLeaveModal, setOpenLeaveModal] = useState(false);

  const selectedChild = myChildren.find(c => c.id === selectedChildId) || myChildren[0];

  const childAttendance = useMemo(
    () => attendance.filter(a => a.studentId === selectedChild?.id),
    [attendance, selectedChild?.id]
  );
  const chartData = useMemo(() => buildAttendanceChartData(childAttendance), [childAttendance]);

  const childRemarks = remarks.filter(r => r.studentId === selectedChild?.id);
  const childLeaves = leaveRequests.filter(l => l.kind === 'student' && l.studentId === selectedChild?.id);

  const presentCount = childAttendance.filter(a => a.status === 'present').length;
  const attendanceRate = childAttendance.length
    ? Math.round((presentCount / childAttendance.length) * 100)
    : 100;

  const handleApplyLeave = (data: { fromDate: string; toDate: string; reason: string }) => {
    if (!selectedChild || !currentUser) return;
    applyLeave({
      studentId: selectedChild.id,
      studentName: selectedChild.name,
      parentId: currentUser.id,
      parentName: currentUser.name,
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason,
    });
  };

  if (!selectedChild) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-slate-100">
        <p className="text-sm font-semibold text-slate-700">No children are linked to this account yet.</p>
        <p className="text-xs text-slate-400 mt-1">Please contact the school administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Classroom Banner */}
      <LiveClassBanner />

      {/* Welcome & Child Switcher */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-sky-200 font-bold">Montessori Parent Portal</span>
          <h1 className="text-2xl font-bold mt-1">Welcome, {currentUser?.name}!</h1>
          <p className="text-xs text-sky-100 mt-1">
            Active child development monitoring & live kindergarten communication
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
          <span className="text-xs font-semibold text-sky-100 pl-2">Active Child:</span>
          <select
            value={selectedChild.id}
            onChange={e => setSelectedChildId(e.target.value)}
            className="text-xs font-bold bg-white text-slate-800 rounded-lg px-3 py-1.5 outline-none shadow-sm cursor-pointer"
          >
            {myChildren.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.class})</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Circle Attendance"
          value={`${attendanceRate}%`}
          subtitle={`${presentCount} days attended`}
          icon={<CalendarCheck className="text-emerald-600" size={20} />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Teacher Observations"
          value={childRemarks.length}
          subtitle="Development notes posted"
          icon={<MessageSquare className="text-indigo-600" size={20} />}
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Leave Applications"
          value={childLeaves.length}
          subtitle={`${childLeaves.filter(l => l.status === 'accepted').length} approved, ${childLeaves.filter(l => l.status === 'pending').length} pending`}
          icon={<CalendarCheck className="text-sky-600" size={20} />}
          iconBg="bg-sky-50"
        />
        <StatCard
          title="Milestone Progress"
          value="Mastered 🌟"
          subtitle={`Age group ${selectedChild.ageGroup || '2-4 Years'}`}
          icon={<Sparkles className="text-amber-600" size={20} />}
          iconBg="bg-amber-50"
        />
      </div>

      <AiInsightsSection />

      {/* Attendance & Recent Remarks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Attendance Overview (Last 30 Days)</CardTitle>
              <p className="text-xs text-slate-400">Tracking daily presence for {selectedChild.name}</p>
            </div>
            <Link to="/parent/attendance" className="text-xs text-indigo-600 font-medium flex items-center gap-1">
              View Calendar <ArrowUpRight size={14} />
            </Link>
          </CardHeader>
          <CardContent>
            <AttendanceAreaChart data={chartData} height={230} />
          </CardContent>
        </Card>

        {/* Quick Leave Application Action Card */}
        <Card className="flex flex-col justify-between p-6 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-sm">
              <CalendarCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Need to Notify a Leave?</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Submit an absence request for {selectedChild.name}. Once accepted by the class teacher, the attendance mark turns Grey automatically.
            </p>
          </div>

          <Button onClick={() => setOpenLeaveModal(true)} className="w-full gap-2 mt-6 shadow-sm">
            <Plus size={16} /> Submit Leave Request
          </Button>
        </Card>
      </div>

      {/* Remarks Feed & Subject Teachers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Latest Teacher Observations</CardTitle>
            <Link to="/parent/remarks" className="text-xs text-indigo-600 font-medium">
              All Observations
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {childRemarks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No observation remarks posted yet.</p>
            ) : (
              childRemarks.slice(0, 2).map(rem => (
                <div key={rem.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{rem.teacherName} ({rem.teacherSubject})</span>
                    <span className="text-[10px] text-slate-400">{formatDate(rem.createdAt)}</span>
                  </div>
                  <div
                    className="text-xs text-slate-600 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: rem.content }}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Contact Strip */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">{selectedChild.name}'s Montessori Guides</CardTitle>
            <Link to="/parent/teachers" className="text-xs text-indigo-600 font-medium">
              View All
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {teachers.filter(t => t.classes.includes(selectedChild.class)).slice(0, 3).map(teacher => (
              <div key={teacher.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {getInitials(teacher.name)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{teacher.name}</p>
                    <p className="text-[10px] text-slate-400">{teacher.subject}</p>
                  </div>
                </div>

                <Link to="/parent/teachers">
                  <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                    Contact
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <SubmitLeaveModal
        open={openLeaveModal}
        onOpenChange={setOpenLeaveModal}
        applicantName={selectedChild.name}
        onSubmit={handleApplyLeave}
      />
    </div>
  );
};
