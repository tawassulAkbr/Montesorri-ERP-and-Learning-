import { useState } from 'react';
import { CalendarCheck, Plus, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AttendanceGrid } from '@/components/shared/AttendanceGrid';
import { SubmitLeaveModal } from '@/components/shared/LeaveModal';
import { useData } from '@/context/DataContext';
import { formatDate } from '@/lib/utils';
import type { LeaveRequest } from '@/types';

export const ParentAttendancePage: React.FC = () => {
  const { students, attendance, leaveRequests, applyLeave } = useData();
  const myChildren = students.filter(s => s.parentId === 'p1');
  const [selectedChildId, setSelectedChildId] = useState<string>(myChildren[0]?.id || 's1');
  const [openModal, setOpenModal] = useState(false);

  const selectedChild = myChildren.find(c => c.id === selectedChildId) || myChildren[0];
  const childLeaves = leaveRequests.filter(l => l.studentId === selectedChild.id);
  const childAttendance = attendance.filter(a => a.studentId === selectedChild.id);

  const handleApplyLeave = (data: { fromDate: string; toDate: string; reason: string }) => {
    applyLeave({
      studentId: selectedChild.id,
      studentName: selectedChild.name,
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason,
    });
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">Pending Teacher Review</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">Accepted (Marked Grey Leave)</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Child Attendance & Leave Portal</h1>
          <p className="text-sm text-slate-500">Monitor monthly circle presence, review roll calls, and apply for leaves</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedChildId}
            onChange={e => setSelectedChildId(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none shadow-sm cursor-pointer"
          >
            {myChildren.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.class})</option>
            ))}
          </select>

          <Button onClick={() => setOpenModal(true)} size="sm" className="gap-1.5 shadow-sm">
            <Plus size={15} /> Apply for Leave
          </Button>
        </div>
      </div>

      {/* Monthly Attendance Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Monthly Circle Roll Record — {selectedChild.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceGrid records={childAttendance} defaultView="monthly" showFilter={true} />
        </CardContent>
      </Card>

      {/* Leave Application Status Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            Submitted Leave Requests ({childLeaves.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setOpenModal(true)} className="text-xs text-indigo-600">
            + New Request
          </Button>
        </CardHeader>
        <CardContent>
          {childLeaves.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No leave requests submitted yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {childLeaves.map(leave => (
                <div key={leave.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {formatDate(leave.fromDate)} {leave.fromDate !== leave.toDate && `– ${formatDate(leave.toDate)}`}
                      </span>
                      {getStatusBadge(leave.status)}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{leave.reason}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Submitted on {formatDate(leave.submittedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SubmitLeaveModal
        open={openModal}
        onOpenChange={setOpenModal}
        studentName={selectedChild.name}
        onSubmit={handleApplyLeave}
      />
    </div>
  );
};
