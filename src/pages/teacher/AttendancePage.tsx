import { useState } from 'react';
import { CheckCircle2, Clock, CalendarOff, Check, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AttendanceGrid } from '@/components/shared/AttendanceGrid';
import { LeaveRequestCard, SubmitLeaveModal } from '@/components/shared/LeaveModal';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { todayISO, isWeekend, formatDate } from '@/lib/utils';
import type { AttendanceStatus } from '@/types';

export const AttendancePage: React.FC = () => {
  const {
    students, attendance, leaveRequests, teacherAttendance,
    markDailyAttendance, updateLeaveStatus, applyTeacherLeave, markTeacherPresent,
  } = useData();
  const { currentUser } = useAuth();
  const [selectedClass, setSelectedClass] = useState('Junior Montessori (Nursery)');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'leaves'>('daily');
  const [openLeaveModal, setOpenLeaveModal] = useState(false);

  const today = todayISO();
  const weekend = isWeekend(today);
  const myRecord = teacherAttendance.find(r => r.teacherId === currentUser?.id && r.date === today);
  const myLeaves = leaveRequests.filter(l => l.kind === 'teacher' && l.teacherId === currentUser?.id);

  const filteredStudents = students.filter(s => s.class === selectedClass);

  // Map today's status from dynamic attendance
  const [dailyStatus, setDailyStatus] = useState<Record<string, AttendanceStatus>>(() => {
    const map: Record<string, AttendanceStatus> = {};
    filteredStudents.forEach(s => {
      const rec = attendance.find(a => a.studentId === s.id && a.date === selectedDate);
      map[s.id] = rec ? rec.status : 'present';
    });
    return map;
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggleStatus = (studentId: string, newStatus: AttendanceStatus) => {
    setDailyStatus(prev => ({ ...prev, [studentId]: newStatus }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    filteredStudents.forEach(s => { updated[s.id] = 'present'; });
    setDailyStatus(updated);
  };

  const handleSaveAttendance = () => {
    const recordsToSave = Object.entries(dailyStatus).map(([studentId, status]) => ({
      studentId,
      date: selectedDate,
      status,
    }));
    markDailyAttendance(recordsToSave, currentUser?.id);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleApplyTeacherLeave = (data: { fromDate: string; toDate: string; reason: string }) => {
    if (!currentUser) return;
    applyTeacherLeave({
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason,
    });
  };

  const presentCount = Object.values(dailyStatus).filter(s => s === 'present').length;
  const absentCount = Object.values(dailyStatus).filter(s => s === 'absent').length;
  const leaveCount = Object.values(dailyStatus).filter(s => s === 'leave').length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Montessori Attendance & Leave Portal</h1>
          <p className="text-sm text-slate-500">Mark your own presence, record roll calls, and manage leaves</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none shadow-sm cursor-pointer"
          >
            <option>Montessori Toddler (Playgroup)</option>
            <option>Junior Montessori (Nursery)</option>
            <option>Senior Montessori (Prep)</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none shadow-sm cursor-pointer"
          />
        </div>
      </div>

      {/* My Own Attendance Card */}
      <Card className={
        myRecord?.status === 'present'
          ? 'border-emerald-200 bg-emerald-50/50'
          : 'border-indigo-200 bg-indigo-50/40'
      }>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                myRecord?.status === 'present' ? 'bg-emerald-600' : 'bg-indigo-600'
              } text-white`}>
                {myRecord?.status === 'present' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {weekend
                    ? 'It\'s the weekend'
                    : myRecord?.status === 'present'
                      ? 'You are marked present today'
                      : myRecord?.status === 'leave'
                        ? 'You are on approved leave today'
                        : 'Mark your presence for today'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-md">
                  {weekend
                    ? 'No attendance is required on Saturday and Sunday.'
                    : myRecord?.status === 'present'
                      ? `Great! Your presence for ${formatDate(today)} has been recorded.`
                      : myRecord?.status === 'leave'
                        ? 'An approved leave covers today, so you are not marked absent.'
                        : 'If you are at school, mark yourself present. Failing to mark present or apply for leave results in an automatic absent.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!weekend && myRecord?.status !== 'present' && myRecord?.status !== 'leave' && (
                <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => currentUser && markTeacherPresent(currentUser.id)}>
                  <Check size={15} /> Mark Myself Present
                </Button>
              )}
              {!weekend && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpenLeaveModal(true)}>
                  <CalendarOff size={15} /> Apply for Leave
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'daily', label: 'Take Daily Roll Call' },
          { id: 'monthly', label: 'Monthly Grid & Records' },
          { id: 'leaves', label: `Leave Requests (${leaveRequests.filter(l => l.status === 'pending').length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Daily View */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="text-xl font-bold text-emerald-700">{presentCount}</span>
              <p className="text-xs font-medium text-emerald-600 mt-0.5">Present (Green)</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
              <span className="text-xl font-bold text-red-700">{absentCount}</span>
              <p className="text-xs font-medium text-red-600 mt-0.5">Absent (Red)</p>
            </div>
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-center">
              <span className="text-xl font-bold text-slate-700">{leaveCount}</span>
              <p className="text-xs font-medium text-slate-600 mt-0.5">Approved Leave (Grey)</p>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">Roll Call List — {selectedClass}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleMarkAllPresent} className="text-xs">
                  Mark All Present
                </Button>
                <Button size="sm" onClick={handleSaveAttendance} className="text-xs shadow-sm">
                  Save Attendance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {saveSuccess && (
                <div className="mb-4 p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} /> Attendance saved & synced live across Parent & Student portals!
                </div>
              )}

              <div className="divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const status = dailyStatus[student.id] || 'present';
                  return (
                    <div key={student.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {student.rollNo}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            {student.name}
                            {student.feeDue && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                                <AlertCircle size={9} /> Fee Due
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{student.enrollmentId} • {student.ageGroup}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleToggleStatus(student.id, 'present')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            status === 'present'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleToggleStatus(student.id, 'absent')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            status === 'absent'
                              ? 'bg-red-500 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleToggleStatus(student.id, 'leave')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            status === 'leave'
                              ? 'bg-slate-500 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Leave
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Grid */}
      {activeTab === 'monthly' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Monthly Attendance Grid</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceGrid records={attendance} defaultView="monthly" showFilter={true} />
          </CardContent>
        </Card>
      )}

      {/* Leave Requests Tab */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          {/* My own leaves */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">My Leave Applications</CardTitle>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setOpenLeaveModal(true)}>
                <Plus size={14} /> Apply for Leave
              </Button>
            </CardHeader>
            <CardContent>
              {myLeaves.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">You have not applied for any leave yet.</p>
              ) : (
                <div className="space-y-3">
                  {myLeaves.map(leave => (
                    <LeaveRequestCard key={leave.id} leave={leave} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student / parent leaves to review */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Student Leave Requests to Review</h3>
            {leaveRequests.filter(l => l.kind === 'student').length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-700">No student leave requests found</p>
              </div>
            ) : (
              leaveRequests.filter(l => l.kind === 'student').map(leave => (
                <LeaveRequestCard
                  key={leave.id}
                  leave={leave}
                  showActions={true}
                  onAccept={(id) => updateLeaveStatus(id, 'accepted', currentUser?.id)}
                  onReject={(id) => updateLeaveStatus(id, 'rejected', currentUser?.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      <SubmitLeaveModal
        open={openLeaveModal}
        onOpenChange={setOpenLeaveModal}
        applicantName={currentUser?.name || ''}
        applicantLabel="Teacher"
        onSubmit={handleApplyTeacherLeave}
      />
    </div>
  );
};
